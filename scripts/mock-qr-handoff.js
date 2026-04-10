/**
 * 🤝 Mock QR Handoff Script
 * Simulates the seller scanning the buyer's QR code to complete the loop.
 * 
 * Usage: node scripts/mock-qr-handoff.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Hardcoded credentials
const SUPABASE_URL = 'https://auoyugxdgvvgwrldgudx.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1b3l1Z3hkZ3Z2Z3dybGRndWR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxMTMwNCwiZXhwIjoyMDgzODg3MzA0fQ.b-655KmqKg_cApFqts00KRNkLhAx_DdBvd5o0r1zrUI';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runHandoff() {
  console.log("🔍 Fetching a 'ready_for_handoff' transaction...");

  const { data: tx, error: txErr } = await supabase
    .from('transactions')
    .select('id, verification_token, seller_id, buyer_id, amount, status')
    .eq('status', 'ready_for_handoff')
    .limit(1)
    .single();

  if (txErr || !tx) {
    console.error("❌ No transaction found ready for handoff. Run mock-paystack-webhook.js first!", txErr);
    return;
  }

  console.log(`✅ Found Transaction: ${tx.id}`);
  console.log(`🔑 Verification Token: ${tx.verification_token}`);
  console.log(`💰 Amount to realize: ₦${tx.amount}`);

  // Fetch seller's current balance for comparison
  const { data: profileBefore } = await supabase
    .from('profiles')
    .select('available_balance')
    .eq('id', tx.seller_id)
    .single();
  
  console.log(`📉 Seller Balance Before: ₦${profileBefore.available_balance}`);

  console.log("🤝 Simulating QR Code Scan (Calling verify_handoff_handshake RPC)...");

  const { data: result, error: rpcErr } = await supabase.rpc('verify_handoff_handshake', {
    p_transaction_id: tx.id,
    p_token: tx.verification_token
  });

  if (rpcErr) {
    console.error("❌ RPC Error:", rpcErr);
    return;
  }

  console.log("✅ RPC Response:", result);

  if (result.success) {
    // Check results
    const { data: txAfter } = await supabase.from('transactions').select('status, payout_status').eq('id', tx.id).single();
    const { data: profileAfter } = await supabase.from('profiles').select('available_balance').eq('id', tx.seller_id).single();

    console.log(`\n🎉 SUCCESS!`);
    console.log(`📦 Transaction Status: ${txAfter.status}`);
    console.log(`💸 Payout Status: ${txAfter.payout_status}`);
    console.log(`📈 Seller Balance After: ₦${profileAfter.available_balance}`);
    
    if (profileAfter.available_balance > profileBefore.available_balance) {
      console.log(`✨ Funds successfully released to the seller!`);
    } else {
      console.log(`⚠️ Balance didn't increase. Check RPC logic.`);
    }
  } else {
    console.log("❌ Handoff verification failed:", result.message);
  }
}

runHandoff();
