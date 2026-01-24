-- Database Schema for Loops Marketplace
-- Run this ENTIRE script in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Campuses Table
create table if not exists campuses (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    slug text unique not null,
    location text,
    created_at timestamp with time zone default now()
);

-- Profiles Table (Extends Supabase Auth)
create table if not exists profiles (
    id uuid references auth.users on delete cascade primary key,
    username text unique,
    full_name text,
    avatar_url text,
    bio text,
    campus_id uuid references campuses(id),
    email_verified boolean default false,
    reputation integer default 0,
    rating decimal(3,2) default 0.00,
    whatsapp_number text,
    primary_role text default 'buying' check (primary_role in ('buying', 'selling')),
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);


-- Categories Table
create table if not exists categories (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    slug text unique not null,
    icon text -- Lucide icon name
);

-- Listings Table
create table if not exists listings (
    id uuid primary key default uuid_generate_v4(),
    seller_id uuid references profiles(id) on delete cascade not null,
    campus_id uuid references campuses(id) not null,
    category text,
    title text not null,
    description text,
    price decimal(10,2) not null,
    images text[], -- Array of URLs
    status text default 'active', -- active, sold, archived
    type text default 'product', -- product, service, request
    pickup_location text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Messages Table
create table if not exists messages (
    id uuid primary key default uuid_generate_v4(),
    listing_id uuid references listings(id) on delete cascade,
    sender_id uuid references profiles(id) not null,
    receiver_id uuid references profiles(id) not null,
    content text not null,
    created_at timestamp with time zone default now()
);

-- Transactions Table
create table if not exists transactions (
    id uuid primary key default uuid_generate_v4(),
    listing_id uuid references listings(id) on delete cascade not null,
    buyer_id uuid references profiles(id) not null,
    seller_id uuid references profiles(id) not null,
    amount decimal(10,2) not null,
    status text default 'pending', -- pending, completed, cancelled
    created_at timestamp with time zone default now()
);

-- Reviews Table
create table if not exists reviews (
    id uuid primary key default uuid_generate_v4(),
    transaction_id uuid references transactions(id) not null,
    reviewer_id uuid references profiles(id) not null,
    reviewee_id uuid references profiles(id) not null,
    rating integer check (rating >= 1 and rating <= 5),
    comment text,
    created_at timestamp with time zone default now()
);

-- Reports Table
create table if not exists reports (
    id uuid primary key default uuid_generate_v4(),
    listing_id uuid references listings(id) on delete cascade,
    reporter_id uuid references profiles(id) on delete cascade,
    reason text not null,
    status text default 'pending', -- pending, reviewed, resolved
    created_at timestamp with time zone default now()
);

-- RLS for Reports
alter table reports enable row level security;
drop policy if exists "Users can create reports." on reports;
create policy "Users can create reports." on reports for insert with check (auth.uid() = reporter_id);
drop policy if exists "Users can view their own reports." on reports;
create policy "Users can view their own reports." on reports for select using (auth.uid() = reporter_id);

-- RLS (Row Level Security) Policies

-- Profiles
alter table profiles enable row level security;

drop policy if exists "Public profiles are viewable by everyone." on profiles;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);

drop policy if exists "Users can insert their own profile." on profiles;
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile." on profiles;
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Listings
alter table listings enable row level security;

drop policy if exists "Listings are viewable by everyone." on listings;
create policy "Listings are viewable by everyone." on listings for select using (true);

drop policy if exists "Users can insert their own listings." on listings;
create policy "Users can insert their own listings." on listings for insert with check (auth.uid() = seller_id);

drop policy if exists "Users can update own listings." on listings;
create policy "Users can update own listings." on listings for update using (auth.uid() = seller_id);

drop policy if exists "Users can delete own listings." on listings;
create policy "Users can delete own listings." on listings for delete using (auth.uid() = seller_id);

-- Messages
alter table messages enable row level security;

drop policy if exists "Users can view their own messages." on messages;
create policy "Users can view their own messages." on messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "Users can send messages." on messages;
create policy "Users can send messages." on messages for insert with check (auth.uid() = sender_id);

-- Transactions (Private)
alter table transactions enable row level security;

drop policy if exists "Users can see their own transactions." on transactions;
create policy "Users can see their own transactions." on transactions for select using (auth.uid() = buyer_id or auth.uid() = seller_id);

drop policy if exists "Users can create transactions." on transactions;
create policy "Users can create transactions." on transactions for insert with check (auth.uid() = buyer_id or auth.uid() = seller_id);

-- Insert Sample Campuses
insert into campuses (id, name, slug, location) values
    ('00000000-0000-0000-0000-000000000001', 'Veritas University', 'veritas', 'Abuja, Nigeria'),
    ('00000000-0000-0000-0000-000000000002', 'University of Lagos', 'unilag', 'Lagos, Nigeria'),
    ('00000000-0000-0000-0000-000000000003', 'University of Ibadan', 'ui', 'Ibadan, Nigeria'),
    ('00000000-0000-0000-0000-000000000004', 'Covenant University', 'covenant', 'Ota, Nigeria')
on conflict (slug) do nothing;
