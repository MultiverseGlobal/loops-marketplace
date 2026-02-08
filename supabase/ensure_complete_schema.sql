-- 🛡️ Loops Master Schema Validation Script
-- This script is idempotent: it checks if tables/columns exist before adding them.
-- Run this to ensure your database has all the features required for the launch.

-- ==========================================
-- 1. Core Tables & Extensions
-- ==========================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (Core User Table)
create table if not exists public.profiles (
    id uuid references auth.users(id) on delete cascade primary key,
    full_name text,
    avatar_url text,
    campus_id uuid, -- Link to campuses table
    email text,
    is_admin boolean default false,
    is_plug boolean default false,
    reputation integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seller Applications (Founding Plugs)
create table if not exists public.seller_applications (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    full_name text not null,
    whatsapp_number text not null,
    campus_email text not null,
    offering_type text not null,
    offering_description text not null,
    estimated_item_count text not null,
    currently_selling text,
    motivation text not null,
    status text default 'pending',
    reviewed_by uuid references auth.users(id),
    reviewed_at timestamp with time zone,
    user_id uuid references auth.users(id)
);

-- Listings (Marketplace Items)
create table if not exists public.listings (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    description text,
    price decimal(10,2) not null,
    images text[], -- Array of image URLs
    category text,
    condition text,
    seller_id uuid references auth.users(id) not null,
    campus_id uuid,
    status text default 'active',
    created_at timestamp with time zone default now()
);

-- Cart & Wishlist
create table if not exists public.cart_items (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade not null,
    listing_id uuid references listings(id) on delete cascade not null,
    quantity integer default 1,
    created_at timestamp with time zone default now(),
    unique(user_id, listing_id)
);

create table if not exists public.wishlist_items (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade not null,
    listing_id uuid references listings(id) on delete cascade not null,
    created_at timestamp with time zone default now(),
    unique(user_id, listing_id)
);

-- Offers (Bargaining)
create table if not exists public.offers (
    id uuid primary key default uuid_generate_v4(),
    listing_id uuid references listings(id) on delete cascade not null,
    buyer_id uuid references auth.users on delete cascade not null,
    amount decimal(10,2) not null,
    status text default 'pending',
    message text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- ==========================================
-- 2. Column Validation (Feature Backfilling)
-- ==========================================

do $$ 
begin
    -- 2.1 Profiles Columns (Branding & Verification)
    if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='store_logo_url') then
        alter table public.profiles add column store_logo_url text;
    end if;

    if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='branding_tier') then
        alter table public.profiles add column branding_tier text default 'basic';
    end if;

    -- 2.2 Seller Applications Columns (Branding, ID, Reasoning)
    if not exists (select 1 from information_schema.columns where table_name='seller_applications' and column_name='store_name') then
        alter table public.seller_applications add column store_name text;
    end if;

    if not exists (select 1 from information_schema.columns where table_name='seller_applications' and column_name='store_banner_color') then
        alter table public.seller_applications add column store_banner_color text default 'bg-loops-primary';
    end if;

    if not exists (select 1 from information_schema.columns where table_name='seller_applications' and column_name='store_logo_url') then
        alter table public.seller_applications add column store_logo_url text;
    end if;

    if not exists (select 1 from information_schema.columns where table_name='seller_applications' and column_name='student_id_url') then
        alter table public.seller_applications add column student_id_url text;
    end if;

    if not exists (select 1 from information_schema.columns where table_name='seller_applications' and column_name='rejection_reason') then
        alter table public.seller_applications add column rejection_reason text;
    end if;
    
    -- 2.3 Listings Columns
    if not exists (select 1 from information_schema.columns where table_name='listings' and column_name='likes_count') then
        alter table public.listings add column likes_count integer default 0;
    end if;

    -- 2.4 Campus Domains
    if not exists (select 1 from information_schema.columns where table_name='campuses' and column_name='domain') then
        alter table public.campuses add column domain text;
    end if;

end $$;

-- ==========================================
-- 3. Auxiliary Tables (Reviews & Follows)
-- ==========================================

-- Reviews (Reputation)
create table if not exists public.reviews (
    id uuid primary key default uuid_generate_v4(),
    transaction_id uuid references transactions(id),
    listing_id uuid references listings(id) on delete cascade,
    reviewer_id uuid references profiles(id) not null,
    reviewee_id uuid references profiles(id) not null,
    rating integer not null check (rating >= 1 and rating <= 5),
    comment text,
    created_at timestamp with time zone default now()
);

-- Follows (Social Graph)
create table if not exists public.follows (
    id uuid default gen_random_uuid() primary key,
    follower_id uuid references public.profiles(id) on delete cascade not null,
    following_id uuid references public.profiles(id) on delete cascade not null,
    created_at timestamp with time zone default now() not null,
    unique(follower_id, following_id)
);

--Enable RLS for new tables
alter table public.reviews enable row level security;
alter table public.follows enable row level security;

-- ==========================================
-- 4. Critical Triggers & Functions
-- ==========================================

-- 4.1 Update User Rating on Review
create or replace function update_user_rating()
returns trigger as $$
begin
    update profiles
    set 
        rating = (select avg(rating) from reviews where reviewee_id = new.reviewee_id),
        reputation = reputation + 10
    where id = new.reviewee_id;
    return new;
end;
$$ language plpgsql;

drop trigger if exists on_review_added on reviews;
create trigger on_review_added
    after insert on reviews
    for each row execute function update_user_rating();

-- 4.2 Auto-Verify Profile on Email Confirmation
create or replace function public.handle_auth_user_verification()
returns trigger as $$
begin
  if (new.email_confirmed_at is not null and old.email_confirmed_at is null) or
     (new.phone_confirmed_at is not null and old.phone_confirmed_at is null) then
    update public.profiles
    set email_verified = true
    where id = new.id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_verification on auth.users;
create trigger on_auth_user_verification
  after update on auth.users
  for each row
  execute function public.handle_auth_user_verification();

-- ==========================================
-- 5. Storage Setup (Buckets)
-- ==========================================

insert into storage.buckets (id, name, public)
values ('private_documents', 'private_documents', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- ==========================================
-- 4. Final Branding Cleanup
-- ==========================================

-- Ensure Campuses use correct "Drop" terminology
update public.campuses 
set terms = '{
    "communityName": "Campus Loop",
    "listingName": "Drop",
    "listingAction": "Post a Drop",
    "sellerName": "Plug",
    "buyerName": "Buyer",
    "statusActive": "Vibing",
    "statusPending": "Locked In",
    "statusCompleted": "Deal Sealed",
    "marketplaceName": "The Feed",
    "pickupLabel": "The Spot",
    "reputationLabel": "Karma"
}'::jsonb
where terms->>'listingAction' ilike '%Pulse%';

-- Safe check for any broken branding on applications
update public.seller_applications 
set store_banner_color = 'bg-loops-primary' 
where store_banner_color is null;

