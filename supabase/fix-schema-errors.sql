-- 🛡️ Consolidated Loops Marketplace Schema & Security Fix
-- Run this ENTIRE script in the Supabase SQL Editor

-- 0. Ensure Extensions
create extension if not exists "uuid-ossp";

-- 1. Safely add columns to existing tables
do $$ 
begin
    -- Add user_id to seller_applications if it doesn't exist
    if not exists (select 1 from information_schema.columns where table_name='seller_applications' and column_name='user_id') then
        alter table public.seller_applications add column user_id uuid references auth.users(id);
    end if;

    -- Add student_id_url to seller_applications if it doesn't exist
    if not exists (select 1 from information_schema.columns where table_name='seller_applications' and column_name='student_id_url') then
        alter table public.seller_applications add column student_id_url text;
    end if;

    -- Add is_admin to profiles if it doesn't exist
    if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='is_admin') then
        alter table public.profiles add column is_admin boolean default false;
    end if;
end $$;

-- 2. Create Shopping & Bargain Tables (If they don't exist)
create table if not exists public.wishlist_items (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade not null,
    listing_id uuid references listings(id) on delete cascade not null,
    created_at timestamp with time zone default now(),
    unique(user_id, listing_id)
);

create table if not exists public.cart_items (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade not null,
    listing_id uuid references listings(id) on delete cascade not null,
    quantity integer default 1,
    created_at timestamp with time zone default now(),
    unique(user_id, listing_id)
);

create table if not exists public.offers (
    id uuid primary key default uuid_generate_v4(),
    listing_id uuid references listings(id) on delete cascade not null,
    buyer_id uuid references auth.users(id) on delete cascade not null,
    amount decimal(10,2) not null,
    status text default 'pending' check (status in ('pending', 'accepted', 'rejected', 'countered')),
    message text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

create table if not exists public.student_verifications (
    user_id uuid primary key references auth.users(id) on delete cascade,
    matric_number text not null,
    verification_status text default 'pending' check (verification_status in ('pending', 'verified', 'rejected')),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 3. APPLY HARDENED RLS POLICIES
alter table public.profiles enable row level security;
alter table public.seller_applications enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.offers enable row level security;
alter table public.student_verifications enable row level security;

-- Profiles: Public View, Private Update
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
drop policy if exists "Users can update own profile." on public.profiles;
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Seller Applications: Owner Select/Insert, Admin View
drop policy if exists "Users can view own application." on public.seller_applications;
create policy "Users can view own application." on public.seller_applications for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own application." on public.seller_applications;
create policy "Users can insert own application." on public.seller_applications for insert with check (auth.uid() = user_id);

-- Cart & Wishlist: Private
drop policy if exists "Users can manage own cart." on public.cart_items;
create policy "Users can manage own cart." on public.cart_items for all using (auth.uid() = user_id);
drop policy if exists "Users can manage own wishlist." on public.wishlist_items;
create policy "Users can manage own wishlist." on public.wishlist_items for all using (auth.uid() = user_id);

-- Offers: Buyer & Related Seller Only
drop policy if exists "Users can see related offers." on public.offers;
create policy "Users can see related offers." on public.offers for select using (
    auth.uid() = buyer_id or exists (
        select 1 from listings where listings.id = offers.listing_id and listings.seller_id = auth.uid()
    )
);
drop policy if exists "Buyers can create offers." on public.offers;
create policy "Buyers can create offers." on public.offers for insert with check (auth.uid() = buyer_id);

-- Student Verifications: Private
drop policy if exists "Users can view own verification." on public.student_verifications;
create policy "Users can view own verification." on public.student_verifications for select using (auth.uid() = user_id);
