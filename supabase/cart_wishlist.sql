-- Cart, Wishlist, and Bargain (Offers) Schema for Loops

-- 1. Wishlist Items (Saved Items)
create table if not exists wishlist_items (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users on delete cascade not null,
    listing_id uuid references listings(id) on delete cascade not null,
    created_at timestamp with time zone default now(),
    unique(user_id, listing_id)
);

-- 2. Cart Items
create table if not exists cart_items (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users on delete cascade not null,
    listing_id uuid references listings(id) on delete cascade not null,
    quantity integer default 1,
    created_at timestamp with time zone default now(),
    unique(user_id, listing_id)
);

-- 3. Offers (Bargain System)
create table if not exists offers (
    id uuid primary key default uuid_generate_v4(),
    listing_id uuid references listings(id) on delete cascade not null,
    buyer_id uuid references auth.users on delete cascade not null,
    amount decimal(10,2) not null,
    status text default 'pending' check (status in ('pending', 'accepted', 'rejected', 'countered')),
    message text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- RLS POLICIES

-- Wishlist
alter table wishlist_items enable row level security;
create policy "Users can manage their own wishlist." 
    on wishlist_items for all using (auth.uid() = user_id);

-- Cart
alter table cart_items enable row level security;
create policy "Users can manage their own cart." 
    on cart_items for all using (auth.uid() = user_id);

-- Offers
alter table offers enable row level security;
create policy "Buyers can manage their own offers." 
    on offers for all using (auth.uid() = buyer_id);

create policy "Sellers can view offers on their listings." 
    on offers for select using (
        exists (
            select 1 from listings 
            where listings.id = offers.listing_id 
            and listings.seller_id = auth.uid()
        )
    );

create policy "Sellers can update offer status." 
    on offers for update using (
        exists (
            select 1 from listings 
            where listings.id = offers.listing_id 
            and listings.seller_id = auth.uid()
        )
    );
