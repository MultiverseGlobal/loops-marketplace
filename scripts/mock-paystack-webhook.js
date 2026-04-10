/**
 * 🛠️ Mock Paystack Webhook Script (Auto-Setup Version)
 * Simulates a successful escrow payment for testing.
 * 
 * Usage: node scripts/mock-paystack-webhook.js
 */

const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

// Hardcoded credentials (same pattern as check_db_v2.js which works)
const SUPABASE_URL = 'https://auoyugxdgvvgwrldgudx.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1b3l1Z3hkZ3Z2Z3dybGRndWR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxMTMwNCwiZXhwIjoyMDgzODg3MzA0fQ.b-655KmqKg_cApFqts00KRNkLhAx_DdBvd5o0r1zrUI';
const PAYSTACK_SECRET = 'sk_test_f5c4a1cb124c9dc4176a72e6a843365964710fe6';
const WEBHOOK_URL = 'http://localhost:3000/api/payments/paystack/webhook';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function retry(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      console.log(`⏳ Attempt ${i + 1} failed, retrying in 2s...`);
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

async function runMock() {
  console.log("🔍 Step 1: Fetching test users from Supabase...");

  // 1. Get two users (with retry)
  const { data: users, error: userErr } = await retry(() =>
    supabase.from('profiles').select('id, full_name').limit(2)
  );

  if (userErr || !users || users.length < 2) {
    console.error("❌ Not enough users in 'profiles' table.", userErr);
    return;
  }
  const buyerId = users[0].id;
  const sellerId = users[1].id;
  console.log(`   Buyer:  ${users[0].full_name} (${buyerId})`);
  console.log(`   Seller: ${users[1].full_name} (${sellerId})`);

  // 2. Get a listing
  console.log("🔍 Step 2: Fetching a listing...");
  const { data: listings } = await retry(() =>
    supabase.from('listings').select('id, title, price').limit(1)
  );

  let listingId, baseAmount = 500;
  if (!listings || listings.length === 0) {
    console.log("⚠️ No listings found, creating a test one...");
    const { data: newListing } = await retry(() =>
      supabase.from('listings').insert({
        seller_id: sellerId,
        title: "Test Escrow Item",
        description: "Webhook Test",
        price: 500,
        condition: "new",
        category: "other"
      }).select().single()
    );
    listingId = newListing.id;
  } else {
    listingId = listings[0].id;
    baseAmount = listings[0].price;
    console.log(`   Listing: "${listings[0].title}" - ₦${baseAmount}`);
  }

  // 3. Create a pending transaction
  const REFERENCE = "TEST_REF_" + Date.now();
  console.log(`📝 Step 3: Creating pending transaction (Ref: ${REFERENCE})...`);

  const { error: txErr } = await retry(() =>
    supabase.from('transactions').insert({
      listing_id: listingId,
      buyer_id: buyerId,
      seller_id: sellerId,
      amount: baseAmount,
      platform_fee: baseAmount * 0.05,
      payment_id: REFERENCE,
      status: 'pending',
      payment_status: 'pending'
    })
  );

  if (txErr) {
    console.error("❌ Failed to create transaction:", txErr);
    return;
  }
  console.log("   ✅ Pending transaction created!");

  // 4. Build & send the webhook
  const payload = {
    event: "charge.success",
    data: {
      reference: REFERENCE,
      status: "success",
      amount: baseAmount * 100,
      metadata: {
        type: 'escrow',
        listingId, buyerId, sellerId, baseAmount
      }
    }
  };

  const body = JSON.stringify(payload);
  const signature = crypto.createHmac("sha512", PAYSTACK_SECRET).update(body).digest("hex");

  console.log(`🚀 Step 4: Sending mock webhook to ${WEBHOOK_URL}...`);

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-paystack-signature": signature
      },
      body
    });

    const json = await res.json();
    console.log("   ✅ Webhook Response:", json);

    // 5. Verify the database was updated
    console.log("🔍 Step 5: Verifying database update (waiting 3s)...");
    await new Promise(r => setTimeout(r, 3000));

    const { data: tx } = await retry(() =>
      supabase.from('transactions')
        .select('status, payment_status')
        .eq('payment_id', REFERENCE)
        .single()
    );

    console.log("   Transaction in DB:", tx);
    if (tx?.status === 'ready_for_handoff' && tx?.payment_status === 'paid') {
      console.log("\n🎉 SUCCESS! The full escrow flow works:");
      console.log("   Payment received → Transaction updated → Funds in escrow → Ready for QR handoff");
    } else {
      console.log("\n⚠️ Transaction did not update as expected.");
      console.log("   Expected: status=ready_for_handoff, payment_status=paid");
      console.log("   Got:", tx);
    }
  } catch (webhookErr) {
    console.error("❌ Webhook HTTP Error:", webhookErr.message);
    console.log("💡 Make sure your dev server is running (npm run dev)");
  }
}

runMock();
