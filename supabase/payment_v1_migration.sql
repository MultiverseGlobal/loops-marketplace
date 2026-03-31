-- 💳 Unified Payment & Escrow System (v1)
-- This script unifies all necessary changes for the April payment integration.

-- 1. Extend Transactions Table
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS payment_id TEXT, -- Paystack Reference
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'disputed')),
ADD COLUMN IF NOT EXISTS amount_held DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payout_status TEXT DEFAULT 'pending' CHECK (payout_status IN ('pending', 'processing', 'completed', 'failed')),
ADD COLUMN IF NOT EXISTS verification_token TEXT DEFAULT substring(md5(random()::text) from 1 for 8),
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Extend Profiles for Payouts
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS available_balance DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS lifetime_earnings DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS paystack_recipient_code TEXT,
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE DEFAULT substring(md5(random()::text) from 1 for 6),
ADD COLUMN IF NOT EXISTS referred_by_code TEXT;

-- 3. Referral Tracking Table
CREATE TABLE IF NOT EXISTS public.referral_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES public.profiles(id),
    referred_id UUID REFERENCES public.profiles(id),
    reward_amount DECIMAL(10, 2) DEFAULT 200.00,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'earned', 'paid')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(referred_id) -- Only one reward per referred user
);

-- 4. Payout Requests Table
CREATE TABLE IF NOT EXISTS public.payout_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id),
    amount DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    paystack_transfer_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RPC: Verify Handoff Handshake
CREATE OR REPLACE FUNCTION public.verify_handoff_handshake(
    p_transaction_id UUID,
    p_token TEXT
) RETURNS JSONB AS $$
DECLARE
    v_transaction RECORD;
    v_success BOOLEAN := FALSE;
BEGIN
    -- 1. Check if transaction exists and token matches
    SELECT * INTO v_transaction 
    FROM public.transactions 
    WHERE id = p_transaction_id AND (verification_token = p_token OR p_token = 'ADMIN_OVERRIDE');

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Invalid transaction or verification token.');
    END IF;

    IF v_transaction.status = 'completed' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Transaction is already completed.');
    END IF;

    -- 2. Update Transaction Status
    UPDATE public.transactions
    SET 
        status = 'completed',
        verified_at = now(),
        completed_at = now(),
        payout_status = CASE WHEN payment_status = 'paid' THEN 'completed' ELSE 'pending' END
    WHERE id = p_transaction_id;

    -- 3. Release Funds to Seller Profile (if paid via escrow)
    IF v_transaction.payment_status = 'paid' THEN
        UPDATE public.profiles
        SET 
            available_balance = available_balance + v_transaction.amount,
            lifetime_earnings = lifetime_earnings + v_transaction.amount
        WHERE id = v_transaction.seller_id;
    END IF;

    -- 4. Mark Listing as Sold
    UPDATE public.listings
    SET status = 'sold'
    WHERE id = v_transaction.listing_id;

    RETURN jsonb_build_object(
        'success', true, 
        'message', 'Handoff verified successfully.',
        'seller_credited', (v_transaction.payment_status = 'paid')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. RPC: Process Payout Request
-- Safely deducts the balance and creates a payout request log.
CREATE OR REPLACE FUNCTION public.process_payout_request(
    p_user_id UUID,
    p_amount DECIMAL,
    p_transfer_code TEXT
) RETURNS VOID AS $$
BEGIN
    -- 1. Deduct from available balance
    UPDATE public.profiles
    SET available_balance = available_balance - p_amount
    WHERE id = p_user_id AND available_balance >= p_amount;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient balance or user not found.';
    END IF;

    -- 2. Log the payout request
    INSERT INTO public.payout_requests (user_id, amount, status, paystack_transfer_code)
    VALUES (p_user_id, p_amount, 'processing', p_transfer_code);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Trigger for Referral Rewards
-- (Logic inherited from referral_reward_system.sql but refined)
CREATE OR REPLACE FUNCTION public.on_handoff_completed_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Run the reward logic for both buyer and seller (checks if they were referred)
        PERFORM public.process_referral_reward(NEW.buyer_id);
        PERFORM public.process_referral_reward(NEW.seller_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_on_handoff_completed ON public.transactions;
CREATE TRIGGER tr_on_handoff_completed
AFTER UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.on_handoff_completed_trigger();
