import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { transactionId, reason, description, evidenceUrls } = await req.json();
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Verify transaction ownership/involvement
    const { data: tx, error: txError } = await supabase
      .from("transactions")
      .select("buyer_id, seller_id, status")
      .eq("id", transactionId)
      .single();

    if (txError || !tx) throw new Error("Transaction not found");

    if (tx.buyer_id !== user.id && tx.seller_id !== user.id) {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    if (tx.status === "completed") {
      return NextResponse.json({ 
        error: "Cannot dispute a completed transaction. Please contact support." 
      }, { status: 400 });
    }

    // 2. Insert Dispute Record
    const { data: dispute, error: disputeError } = await supabase
      .from("disputes")
      .insert({
        transaction_id: transactionId,
        reporter_id: user.id,
        reason,
        description,
        evidence_urls: evidenceUrls,
        status: "open",
      })
      .select()
      .single();

    if (disputeError) throw disputeError;

    // 3. Notify Admin (Placeholder for notification logic)
    // You could send an email or trigger a push notification here

    return NextResponse.json({
      success: true,
      message: "Dispute opened successfully. An administrator will review your case.",
      disputeId: dispute.id,
    });

  } catch (error: any) {
    console.error("Dispute Opening Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
