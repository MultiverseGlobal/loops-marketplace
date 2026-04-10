import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveAccount } from "@/lib/paystack";

export async function POST(req: Request) {
  try {
    const { accountNumber, bankCode } = await req.json();
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!accountNumber || !bankCode) {
      return NextResponse.json({ error: "Account number and bank code are required" }, { status: 400 });
    }

    const accountData = await resolveAccount(accountNumber, bankCode);

    return NextResponse.json({ 
      success: true, 
      accountName: accountData.account_name 
    });

  } catch (error: any) {
    console.error("Account Verification Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
