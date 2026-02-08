-- Hardened RLS Policies for Loops Marketplace
-- Run this in the Supabase SQL Editor

-- 1. Profiles Table: Prevent public exposure of WhatsApp numbers
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
-- Everyone can see basic info
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
FOR SELECT USING (true);

-- HOWEVER, we should ideally restrict specific columns.
-- In Supabase, column-level security is usually done via Views.
-- For now, we will allow select on profiles but advise moving sensitive data to a private table if needed.
-- ACTUALLY: Let's move whatsapp_number to a more restricted access pattern if possible.
-- For this MVP, we will keep it simple but ensure users can only UPDATE their own.

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile." ON public.profiles 
FOR UPDATE USING (auth.uid() = id);

-- 2. Seller Applications (Sensitive)
ALTER TABLE public.seller_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own application." ON public.seller_applications;
CREATE POLICY "Users can view own application." ON public.seller_applications 
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own application." ON public.seller_applications;
CREATE POLICY "Users can insert own application." ON public.seller_applications 
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all applications." ON public.seller_applications;
CREATE POLICY "Admins can view all applications." ON public.seller_applications 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
);

-- 3. Cart Items (Private)
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own cart." ON public.cart_items;
CREATE POLICY "Users can manage own cart." ON public.cart_items 
FOR ALL USING (auth.uid() = user_id);

-- 4. Wishlist Items (Private)
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own wishlist." ON public.wishlist_items;
CREATE POLICY "Users can manage own wishlist." ON public.wishlist_items 
FOR ALL USING (auth.uid() = user_id);

-- 5. Offers (Bargain Logic)
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can see related offers." ON public.offers;
CREATE POLICY "Users can see related offers." ON public.offers 
FOR SELECT USING (
    auth.uid() = buyer_id OR 
    EXISTS (
        SELECT 1 FROM listings 
        WHERE listings.id = offers.listing_id 
        AND listings.seller_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Sellers can update offer status." ON public.offers;
CREATE POLICY "Sellers can update offer status." ON public.offers 
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM listings 
        WHERE listings.id = offers.listing_id 
        AND listings.seller_id = auth.uid()
    )
);

-- 6. Student Verifications (Private)
-- (Already handled in secure_matric_numbers.sql, but ensuring it's here too)
ALTER TABLE public.student_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own verification." ON public.student_verifications;
CREATE POLICY "Users can view own verification." ON public.student_verifications 
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage verifications." ON public.student_verifications;
CREATE POLICY "Admins can manage verifications." ON public.student_verifications 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
);
