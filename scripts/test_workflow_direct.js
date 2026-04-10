const crypto = require('crypto');

// Use built-in fetch (available in Node 18+)
// No need for node-fetch or dotenv as we use --env-file=.env.local

const LOCAL_URL = 'http://127.0.0.1:3000';
const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Known mock IDs from the database
const BUYER_ID = 'ac41ec03-ff32-44e4-ad39-939ba32154df'; 
const SELLER_ID = '6a0bd9c8-0511-4a04-9fd4-570fd1d0c93a';
const LISTING_ID = '4badf71d-2ec5-4e61-b87a-9e26eb4d4143';

async function runTests() {
  console.log('--- 🧪 Commencing Payment Workflow Test ---');
  
  if (!SECRET_KEY) {
      console.error('❌ SECRET_KEY is missing. Make sure .env.local is loaded.');
      return;
  }

  const reference = `T${Date.now()}`;

  // Step 1: Initialize custom transaction in DB using helper
  console.log('1️⃣ Creating mock pending transaction...');
  try {
    const createReq = await fetch(`${LOCAL_URL}/api/dev/test-helper`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_transaction',
          payload: {
            listing_id: LISTING_ID,
            buyer_id: BUYER_ID,
            seller_id: SELLER_ID,
            amount: 2000,
            platform_fee: 100,
            payment_status: 'pending',
            payment_id: reference,
            status: 'pending'
          }
        })
      });
      
      const responseText = await createReq.text();
      let createData;
      try {
        createData = JSON.parse(responseText);
      } catch (e) {
        console.error('❌ Failed to parse response as JSON. Body:', responseText);
        return;
      }
      
      if (!createReq.ok) {
        console.error('❌ Failed to create transaction:', createData);
        return;
      }
      
      const transaction = createData.transaction;
      console.log('✅ Created Transaction:', transaction.id);
      console.log('   Verification Token Output:', transaction.verification_token);
    
      // Step 2: Trigger the Paystack Webhook for successful Escrow Funding
      console.log('\n2️⃣ Hitting Webhook for ' + reference + '...');
      const payload = {
        event: "charge.success",
        data: {
          reference: reference,
          status: "success",
          amount: 210000, // in kobo
          metadata: {
            type: "escrow",
            listingId: LISTING_ID,
            buyerId: BUYER_ID,
            sellerId: SELLER_ID,
            baseAmount: 2000
          }
        }
      };
    
      const body = JSON.stringify(payload);
      const signature = crypto.createHmac("sha512", SECRET_KEY).update(body).digest("hex");
    
      const hookReq = await fetch(`${LOCAL_URL}/api/payments/paystack/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-paystack-signature': signature },
        body: body
      });
      
      if (!hookReq.ok) {
        console.error('❌ Webhook failed:', await hookReq.text());
        return;
      } else {
        console.log('✅ Webhook reported success for escrow funding!');
      }
    
      // Step 3: Verify Handoff QR Code Handshake
      console.log('\n3️⃣ Attempting Handshake with Token:', transaction.verification_token);
      const verifyReq = await fetch(`${LOCAL_URL}/api/dev/test-helper`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_handoff',
          payload: {
            transactionId: transaction.id,
            token: transaction.verification_token
          }
        })
      });
    
      const verifyData = await verifyReq.json();
      if (!verifyReq.ok) {
        console.error('❌ Handshake failed:', verifyData);
      } else {
        console.log('✅ Handshake successful!', verifyData);
        console.log('🎉 End to End local test completed flawlessly!');
      }
  } catch (e) {
      console.error('❌ Test failed with error:', e.message);
  }
}

runTests();
