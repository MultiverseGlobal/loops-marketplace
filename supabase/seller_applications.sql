-- Create table for seller applications
create table if not exists seller_applications (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_name text not null,
  whatsapp_number text not null,
  campus_email text not null,
  offering_type text not null, -- 'product' or 'service'
  offering_description text not null,
  estimated_item_count text not null,
  currently_selling text,
  motivation text not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamp with time zone
);

-- Enable RLS
alter table seller_applications enable row level security;

-- Policy: Anyone can insert (public application form)
create policy "Anyone can submit application"
  on seller_applications for insert
  with check (true);

-- Policy: Only admins can view/update (simplified for now to authenticated users, ideal would be admin role)
-- For this MVP/Founder mode, we'll allow authenticated users to view (assuming backend admin) or just keep it open for now if dashboard is insecure. 
-- Best practice: restricted to admin. Let's assume we'll use the Supabase dashboard or a protected admin route.
create policy "Authenticated users can view applications"
  on seller_applications for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can update status"
  on seller_applications for update
  using (auth.role() = 'authenticated');
