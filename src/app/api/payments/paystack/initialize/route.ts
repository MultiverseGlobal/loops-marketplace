import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { initializeTransaction } from "@/lib/paystack";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { listingId, plan } = await req.json();

  if (!listingId) {
    return NextResponse.json({ error: "Listing ID is required" }, { status: 400 });
  }

  // Plan pricing (example)
  const plans: Record<string, number> = {
    "basic": 500, // ₦500 for 3 days
    "premium": 1500, // ₦1500 for 10 days
    "boost": 3000, // ₦3000 for 30 days
  };

  const amount = plans[plan] || 500;

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", user.id)
      .single();

    const transaction = await initializeTransaction(
      user.email || profile?.email, 
      amount, 
      {
        listingId,
        userId: user.id,
        plan,
        purpose: "listing_boost",
      },
      process.env.PAYSTACK_SUBACCOUNT_LOOPS // Pass the subaccount code from env
    );

    return NextResponse.json(transaction);
  } catch (error: any) {
    console.error("Paystack Init Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
