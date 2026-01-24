-- Database Schema for Loops Marketplace

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Campuses Table
create table campuses (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    slug text unique not null,
    location text,
    created_at timestamp with time zone default now()
);

-- Profiles Table (Extends Supabase Auth)
create table profiles (
    id uuid references auth.users on delete cascade primary key,
    username text unique,
    full_name text,
    avatar_url text,
    bio text,
    campus_id uuid references campuses(id),
    reputation integer default 0,
    rating decimal(3,2) default 0.00,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Categories Table
create table categories (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    slug text unique not null,
    icon text -- Lucide icon name
);

-- Listings Table
create table listings (
    id uuid primary key default uuid_generate_v4(),
    seller_id uuid references profiles(id) on delete cascade not null,
    campus_id uuid references campuses(id) not null,
    category_id uuid references categories(id),
    title text not null,
    description text,
    price decimal(10,2) not null,
    images text[], -- Array of URLs
    status text default 'active', -- active, sold, archived
    type text default 'product', -- product, service, request
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Transactions Table
create table transactions (
    id uuid primary key default uuid_generate_v4(),
    listing_id uuid references listings(id) not null,
    buyer_id uuid references profiles(id) not null,
    seller_id uuid references profiles(id) not null,
    amount decimal(10,2) not null,
    status text default 'pending', -- pending, completed, cancelled
    created_at timestamp with time zone default now()
);

-- Reviews Table
create table reviews (
    id uuid primary key default uuid_generate_v4(),
    transaction_id uuid references transactions(id) not null,
    reviewer_id uuid references profiles(id) not null,
    reviewee_id uuid references profiles(id) not null,
    rating integer check (rating >= 1 and rating <= 5),
    comment text,
    created_at timestamp with time zone default now()
);

-- RLS (Row Level Security) Policies

-- Profiles
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Listings
alter table listings enable row level security;
create policy "Listings are viewable by everyone." on listings for select using (true);
create policy "Users can insert their own listings." on listings for insert with check (auth.uid() = seller_id);
create policy "Users can update own listings." on listings for update using (auth.uid() = seller_id);
create policy "Users can delete own listings." on listings for delete using (auth.uid() = seller_id);

-- Transactions (Private)
alter table transactions enable row level security;
create policy "Users can see their own transactions." on transactions for select using (auth.uid() = buyer_id or auth.uid() = seller_id);

-- Realtime
alter publication supabase_realtime add table listings;
