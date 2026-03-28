-- Escrow & Referral Payouts Schema
-- This script enables secure in-app payments and the withdrawal of referral earnings.

-- 1. Update Transactions Table for Escrow
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS payment_id TEXT; -- Paystack Reference
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'disputed'));
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS amount_held DECIMAL(10, 2);
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS payout_status TEXT DEFAULT 'pending' CHECK (payout_status IN ('pending', 'processing', 'completed', 'failed'));

-- 2. Add Earnings to Profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS available_balance DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS lifetime_earnings DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS paystack_recipient_code TEXT; -- For automated transfers

-- 3. Referral Tracking for Payouts
CREATE TABLE IF NOT EXISTS public.referral_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES public.profiles(id),
    referred_id UUID REFERENCES public.profiles(id),
    reward_amount DECIMAL(10, 2) DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'earned', 'paid')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Function to credit referral rewards upon verified activity
-- (e.g., when a referred user makes their first sale/purchase)
CREATE OR REPLACE FUNCTION public.credit_referral_reward(p_referrer_id UUID, p_amount DECIMAL)
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles
    SET available_balance = available_balance + p_amount,
        lifetime_earnings = lifetime_earnings + p_amount
    WHERE id = p_referrer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
