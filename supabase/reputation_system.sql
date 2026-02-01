-- Reputation & Ratings System for Loops
-- This script adds product and plug reviews

-- Modify Reviews Table to include listing_id and improved constraints
-- We check if table exists first from common-schema.sql
do $$ 
begin
    if exists (select 1 from information_schema.tables where table_name = 'reviews') then
        alter table reviews add column if not exists listing_id uuid references listings(id) on delete cascade;
        -- Optional: Remove transaction_id requirement if we want to allow reviews before a 'transaction' is explicitly marked
        alter table reviews alter column transaction_id drop not null;
    else
        create table reviews (
            id uuid primary key default uuid_generate_v4(),
            transaction_id uuid references transactions(id), -- Nullable if review happens via chat
            listing_id uuid references listings(id) on delete cascade,
            reviewer_id uuid references profiles(id) not null,
            reviewee_id uuid references profiles(id) not null,
            rating integer not null check (rating >= 1 and rating <= 5),
            comment text,
            created_at timestamp with time zone default now()
        );
    end if;
end $$;

-- Enable RLS for reviews
alter table reviews enable row level security;

-- Policies for reviews
drop policy if exists "Reviews are viewable by everyone." on reviews;
create policy "Reviews are viewable by everyone." on reviews for select using (true);

drop policy if exists "Authenticated users can create reviews." on reviews;
create policy "Authenticated users can create reviews." on reviews for insert with check (auth.uid() = reviewer_id);

-- Trigger to update user rating/reputation when a review is added
create or replace function update_user_rating()
returns trigger as $$
begin
    update profiles
    set 
        rating = (select avg(rating) from reviews where reviewee_id = new.reviewee_id),
        reputation = reputation + 10 -- Reward with reputation points
    where id = new.reviewee_id;
    return new;
end;
$$ language plpgsql;

drop trigger if exists on_review_added on reviews;
create trigger on_review_added
    after insert on reviews
    for each row execute function update_user_rating();
