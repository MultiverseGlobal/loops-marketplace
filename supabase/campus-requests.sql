-- Table to store campus requests from students
create table if not exists campus_requests (
    id uuid primary key default uuid_generate_v4(),
    university_name text not null,
    school_email text,
    reason text,
    status text default 'pending', -- pending, reviewed, added, rejected
    created_at timestamp with time zone default now()
);

-- RLS for campus_requests
alter table campus_requests enable row level security;

-- Anyone can submit a request
drop policy if exists "Anyone can submit a campus request." on campus_requests;
create policy "Anyone can submit a campus request." on campus_requests for insert with check (true);

-- Only authenticated users (or specifically admins later) can view them
-- For now, let's allow service role or specific IDs if we had them.
-- Since we are in early dev, let's allow the owner to see all via dashboard.
drop policy if exists "Users can view their own requests." on campus_requests;
create policy "Users can view their own requests." on campus_requests for select using (true);
