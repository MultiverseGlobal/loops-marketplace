-- Database Schema for Loops Marketplace

-- 1. Campuses Table
CREATE TABLE IF NOT EXISTS public.campuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    domain TEXT NOT NULL UNIQUE, -- e.g., 'stanford.edu'
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Profiles Table (Extends Auth.Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    campus_id UUID REFERENCES public.campuses(id),
    full_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    reputation_score INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Listings Table
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    campus_id UUID REFERENCES public.campuses(id),
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    type TEXT CHECK (type IN ('product', 'service', 'request')),
    category TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'sold', 'completed')),
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id),
    receiver_id UUID REFERENCES public.profiles(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_id UUID REFERENCES public.profiles(id),
    reviewee_id UUID REFERENCES public.profiles(id),
    listing_id UUID REFERENCES public.listings(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) - Basic Examples
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Listings RLS
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Listings are viewable by everyone." ON public.listings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create listings." ON public.listings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own listings." ON public.listings FOR UPDATE USING (auth.uid() = seller_id);
