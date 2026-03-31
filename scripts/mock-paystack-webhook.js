/**
 * 🛠️ Mock Paystack Webhook Script
 * Use this to simulate a successful payment for testing the escrow flow.
 * 
 * Usage: node scripts/mock-paystack-webhook.js <transaction_reference> <type: escrow|listing_boost>
 */

const fetch = require('node-fetch');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

const REFERENCE = process.argv[2];
const TYPE = process.argv[3] || 'escrow';

if (!REFERENCE) {
  console.error("❌ Please provide a transaction reference.");
  process.exit(1);
}

const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const WEBHOOK_URL = `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/paystack/webhook`;

const payload = {
  event: "charge.success",
  data: {
    reference: REFERENCE,
    status: "success",
    amount: 50000, // ₦500.00
    metadata: {
      type: TYPE,
      listingId: "MOCK_LISTING_ID",
      buyerId: "MOCK_BUYER_ID",
      sellerId: "MOCK_SELLER_ID",
      baseAmount: 500
    }
  }
};

const body = JSON.stringify(payload);
const signature = crypto
  .createHmac("sha512", SECRET_KEY)
  .update(body)
  .digest("hex");

console.log(`🚀 Sending mock ${TYPE} webhook to ${WEBHOOK_URL}...`);

fetch(WEBHOOK_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-paystack-signature": signature
  },
  body: body
})
.then(res => res.json())
.then(json => console.log("✅ Response:", json))
.catch(err => console.error("❌ Error:", err));
