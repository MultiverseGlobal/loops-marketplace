import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  const isValidUrl = url.startsWith('http://') || url.startsWith('https://');

  if (!isValidUrl || !key) {
      return NextResponse.json({ error: "Configuration missing or invalid" }, { status: 500 });
  }

  // Initialize client inside to avoid build-time errors if env vars are missing
  const supabaseAdmin = createSupabaseClient(url, key);

  try {
    const { action, payload } = await req.json();

    if (action === "create_transaction") {
      const { data, error } = await supabaseAdmin.rpc("create_test_transaction", {
        p_listing_id: payload.listing_id,
        p_buyer_id: payload.buyer_id,
        p_seller_id: payload.seller_id,
        p_amount: payload.amount,
        p_platform_fee: payload.platform_fee,
        p_payment_id: payload.payment_id
      });
      
      if (error) {
          console.error("Supabase Create Test Transaction RPC Error:", error);
          throw new Error(error.message);
      }
      
      // The RPC returns just the ID, fetch the full transaction to include verification_token
      const { data: transaction, error: fetchError } = await supabaseAdmin
        .from("transactions")
        .select("*")
        .eq("id", data)
        .single();

      if (fetchError) throw fetchError;

      return NextResponse.json({ success: true, transaction });
    }

    if (action === "verify_handoff") {
      const { data, error } = await supabaseAdmin.rpc("verify_handoff_handshake", {
        p_transaction_id: payload.transactionId,
        p_token: payload.token,
      });
      
      if (error) {
          console.error("Supabase RPC Verify Handoff Error:", error);
          throw new Error(error.message);
      }
      return NextResponse.json({ success: true, result: data });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error: any) {
    const errorDetail = JSON.stringify(error, Object.getOwnPropertyNames(error));
    console.error("[Test Helper Endpoint ERROR]:", errorDetail);
    return NextResponse.json({ error: error.message || "Internal Server Error", detail: errorDetail }, { status: 500 });
  }
}
