import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { transactionId, token } = await req.json();
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Call the Supabase RPC to verify the handshake
    const { data, error } = await supabase.rpc("verify_handoff_handshake", {
      p_transaction_id: transactionId,
      p_token: token,
    });

    if (error) throw error;

    if (!data) {
      return NextResponse.json({ error: "Invalid token or transaction state." }, { status: 400 });
    }

    // Return success response with details
    return NextResponse.json({
      success: true,
      message: "Handoff verified and funds released to seller.",
    });

  } catch (error: any) {
    console.error("Handoff Verification Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
