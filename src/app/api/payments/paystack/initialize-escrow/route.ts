import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { initializeTransaction } from "@/lib/paystack";

export async function POST(req: Request) {
  try {
    const { listingId, amount, sellerId, planName } = await req.json();
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Platform Fee: 5% (Example)
    const platformFee = Math.round(amount * 0.05);
    const totalAmount = amount + platformFee;

    // Initialize Paystack Transaction
    const transaction = await initializeTransaction(
      user.email!,
      totalAmount,
      {
        type: "escrow",
        listingId,
        buyerId: user.id,
        sellerId,
        baseAmount: amount,
        platformFee,
        planName,
      },
      process.env.PAYSTACK_SUBACCOUNT_LOOPS
    );

    // Create pending transaction record in Supabase
    const { error: txError } = await supabase
      .from("transactions")
      .insert({
        listing_id: listingId,
        buyer_id: user.id,
        seller_id: sellerId,
        amount: amount,
        platform_fee: platformFee,
        payment_status: "pending",
        payment_id: transaction.reference,
        status: "pending",
      });

    if (txError) throw txError;

    return NextResponse.json(transaction);
  } catch (error: any) {
    console.error("Escrow Initialize Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
