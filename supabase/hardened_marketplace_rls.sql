-- 🔒 Loops Financial Hardening: Transaction & Payout RLS
-- Ensures that only involved parties can view or act on financial data.

-- 1. Transactions Table
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own transactions." ON public.transactions;
CREATE POLICY "Users can view their own transactions." ON public.transactions
FOR SELECT USING (
    auth.uid() = buyer_id OR 
    auth.uid() = seller_id OR 
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
);

-- Note: UPDATES to transactions are handled via SECURITY DEFINER functions (RPCs) to ensure integrity.
-- However, we should block direct public updates.
DROP POLICY IF EXISTS "Direct updates to transactions are restricted." ON public.transactions;
CREATE POLICY "Direct updates to transactions are restricted." ON public.transactions
FOR UPDATE USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
);

-- 2. Payout Requests (Private)
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own payout requests." ON public.payout_requests;
CREATE POLICY "Users can view own payout requests." ON public.payout_requests
FOR SELECT USING (
    auth.uid() = user_id OR 
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
);

-- 3. Referral Rewards (Private)
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own referral rewards." ON public.referral_rewards;
CREATE POLICY "Users can view own referral rewards." ON public.referral_rewards
FOR SELECT USING (
    auth.uid() = referrer_id OR 
    auth.uid() = referred_id OR 
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
);

-- 4. Marketplace Listings (Update/Delete ownership)
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Listings are viewable by everyone." ON public.listings;
CREATE POLICY "Listings are viewable by everyone." ON public.listings
FOR SELECT USING (status = 'active' OR auth.uid() = seller_id OR (SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can update own listings." ON public.listings;
CREATE POLICY "Users can update own listings." ON public.listings
FOR UPDATE USING (
    auth.uid() = seller_id OR 
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "Users can delete own listings." ON public.listings;
CREATE POLICY "Users can delete own listings." ON public.listings
FOR DELETE USING (
    auth.uid() = seller_id OR 
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
);
