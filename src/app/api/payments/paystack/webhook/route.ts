import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
    .update(body)
    .digest("hex");

  if (hash !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(body);

  if (payload.event === "charge.success") {
    const { metadata, reference } = payload.data;
    const supabase = await createClient();

    if (metadata.type === "listing_boost") {
      const { listingId, plan, userId } = metadata;
      let boostDuration;
      switch (plan) {
        case "premium": boostDuration = 10; break;
        case "elite": boostDuration = 30; break;
        default: boostDuration = 3;
      }

      const boostedUntil = new Date();
      boostedUntil.setDate(boostedUntil.getDate() + boostDuration);

      await supabase
        .from("listings")
        .update({ boosted_until: boostedUntil.toISOString() })
        .eq("id", listingId);

      await supabase.from("notifications").insert({
        user_id: userId,
        title: "Boost Activated! ⚡",
        message: `Your listing is now prioritized for the next ${boostDuration} days.`,
        type: "success",
      });
    } else if (metadata.type === "escrow") {
      const { listingId, buyerId, sellerId, baseAmount } = metadata;

      // 1. Update Transaction Status
      await supabase
        .from("transactions")
        .update({ 
          payment_status: "paid",
          status: "ready_for_handoff" 
        })
        .eq("payment_id", reference);

      // 2. Mark listing as pending
      await supabase
        .from("listings")
        .update({ status: "pending" })
        .eq("id", listingId);

      // 3. Notify Buyer
      await supabase.from("notifications").insert({
        user_id: buyerId,
        title: "Payment Confirmed! 📦",
        message: "Your funds are held in escrow. Meet the seller to complete the Loop.",
        type: "success",
      });

      // 4. Notify Seller
      await supabase.from("notifications").insert({
        user_id: sellerId,
        title: "New Order! 💰",
        message: `A buyer has paid for your item. Funds will be released upon handoff.`,
        type: "info",
      });
    }
  }

  return NextResponse.json({ status: "ok" });
}
