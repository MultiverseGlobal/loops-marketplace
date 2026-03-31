import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { createTransferRecipient, initiateTransfer } from "@/lib/paystack";

export async function POST(req: Request) {
  try {
    const { amount, bankName, accountNumber, bankCode, accountName } = await req.json();
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Get current balance and recipient code
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("available_balance, paystack_recipient_code, full_name")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) throw new Error("Profile not found");

    if (profile.available_balance < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    let recipientCode = profile.paystack_recipient_code;

    // 2. Create recipient if it doesn't exist
    if (!recipientCode) {
      if (!accountNumber || !bankCode || !accountName) {
        return NextResponse.json({ 
          error: "Bank details required to set up your payout recipient." 
        }, { status: 400 });
      }

      const recipientData = await createTransferRecipient(
        accountName,
        accountNumber,
        bankCode
      );
      recipientCode = recipientData.recipient_code;

      // Save recipient code for future payouts
      await supabase
        .from("profiles")
        .update({ paystack_recipient_code: recipientCode })
        .eq("id", user.id);
    }

    // 3. Initiate Paystack Transfer
    const transfer = await initiateTransfer(
      amount,
      recipientCode,
      `Loops Payout: ${user.email}`
    );

    // 4. Update balance and log payout request
    const { error: txError } = await supabase.rpc("process_payout_request", {
      p_user_id: user.id,
      p_amount: amount,
      p_transfer_code: transfer.transfer_code,
    });

    if (txError) throw txError;

    return NextResponse.json({
      success: true,
      message: "Payout initiated successfully. Funds will arrive shortly.",
      transferCode: transfer.transfer_code,
    });

  } catch (error: any) {
    console.error("Withdrawal Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
