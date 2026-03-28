import { createClient } from "../../../../lib/supabase/server";
import { NextResponse } from "next/server";
import { initiateTransfer, createTransferRecipient } from "../../../../lib/paystack";

export async function POST(req: Request) {
  try {
    const { amount, accountNumber, bankCode, accountName } = await req.json();
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Check Balance
    const { data: profile } = await supabase
      .from("profiles")
      .select("available_balance, paystack_recipient_code, full_name")
      .eq("id", user.id)
      .single();

    if (!profile || profile.available_balance < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    if (amount < 500) {
      return NextResponse.json({ error: "Minimum withdrawal is ₦500" }, { status: 400 });
    }

    let recipientCode = profile.paystack_recipient_code;

    // 2. Create Recipient if not exists
    if (!recipientCode) {
      const recipient = await createTransferRecipient(
        accountName || profile.full_name,
        accountNumber,
        bankCode
      );
      recipientCode = recipient.recipient_code;

      // Save recipient code for future use
      await supabase
        .from("profiles")
        .update({ paystack_recipient_code: recipientCode })
        .eq("id", user.id);
    }

    // 3. Initiate Paystack Transfer
    const transfer = await initiateTransfer(
      amount,
      recipientCode,
      `Loops Payout for ${profile.full_name}`
    );

    // 4. Update Balance (Deduct)
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ 
        available_balance: profile.available_balance - amount 
      })
      .eq("id", user.id);

    if (updateError) throw updateError;

    // 5. Log Withdrawal Activity
    await supabase.from("notifications").insert({
      user_id: user.id,
      title: "Withdrawal Initiated! 💸",
      message: `Your withdrawal of ₦${amount} is being processed.`,
      type: "info",
    });

    return NextResponse.json({ success: true, transfer });
  } catch (error: any) {
    console.error("Withdrawal Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
