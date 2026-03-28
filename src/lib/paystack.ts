import { createClient } from "@supabase/supabase-js";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY;

export async function initializeTransaction(email: string, amount: number, metadata: any, subaccount?: string) {
  const body: any = {
    email,
    amount: amount * 100, // Paystack amount is in kobo
    metadata,
    callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/paystack/callback`,
  };

  if (subaccount) {
    body.subaccount = subaccount;
    body.bearer = "subaccount"; // Ensures the subaccount name appears on bank statements
  }

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || "Failed to initialize Paystack transaction");
  }

  return data.data;
}

export async function verifyTransaction(reference: string) {
  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    },
  });

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || "Failed to verify Paystack transaction");
  }

  return data.data;
}

export async function createTransferRecipient(name: string, accountNumber: string, bankCode: string) {
  const response = await fetch("https://api.paystack.co/transferrecipient", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "nuban",
      name,
      account_number: accountNumber,
      bank_code: bankCode,
      currency: "NGN",
    }),
  });

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || "Failed to create transfer recipient");
  }

  return data.data; // Includes recipient_code
}

export async function initiateTransfer(amount: number, recipientCode: string, reason: string) {
  const response = await fetch("https://api.paystack.co/transfer", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source: "balance",
      amount: amount * 100,
      recipient: recipientCode,
      reason,
    }),
  });

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || "Failed to initiate transfer");
  }

  return data.data;
}
