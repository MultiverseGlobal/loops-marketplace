import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { disputeId, decision, adminNotes } = await req.json();
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Verify Admin Status
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
    }

    // 2. Fetch Dispute and Transaction Info
    const { data: dispute, error: disputeError } = await supabase
      .from("disputes")
      .select("*, transactions(id, buyer_id, seller_id, amount, status)")
      .eq("id", disputeId)
      .single();

    if (disputeError || !dispute) throw new Error("Dispute Not Found");

    const transaction = dispute.transactions;

    if (decision === "REFUND") {
      // 3a. RESOLUTION: REFUND BUYER
      // (For MVP, we mark as processing refund and keep funds held)
      // (In production, trigger Paystack Refund API here)
      
      await supabase
        .from("disputes")
        .update({
          status: "resolved_refunded",
          admin_id: user.id,
          admin_notes: adminNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", disputeId);

      await supabase
        .from("transactions")
        .update({ status: "cancelled", payout_status: "failed" })
        .eq("id", transaction.id);

      // Notify Buyer
      await supabase.from("notifications").insert({
        user_id: transaction.buyer_id,
        title: "Dispute Resolved: Refunded 💸",
        message: "Your dispute was reviewed and a refund has been initiated.",
        type: "info",
      });

    } else if (decision === "RELEASE") {
      // 3b. RESOLUTION: RELEASE TO SELLER
      // (Forces the escrow release logic)

      await supabase
        .from("disputes")
        .update({
          status: "resolved_released",
          admin_id: user.id,
          admin_notes: adminNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", disputeId);

      // Reuse the RPC function that releases funds to the seller
      // (Note: we use a special token or bypass check for admin)
      const { data: verifyData, error: verifyError } = await supabase.rpc("verify_handoff_handshake", {
        p_transaction_id: transaction.id,
        p_token: "ADMIN_OVERRIDE", // Admin can bypass the QR check
      });

      if (verifyError) throw verifyError;

      // Notify Seller
      await supabase.from("notifications").insert({
        user_id: transaction.seller_id,
        title: "Dispute Resolved: Released 💰",
        message: "The dispute was resolved in your favor. Funds have been added to your balance.",
        type: "success",
      });
    }

    return NextResponse.json({
      success: true,
      message: `Dispute resolved with decision: ${decision}`,
    });

  } catch (error: any) {
    console.error("Dispute Resolution Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
