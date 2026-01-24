-- Add admin role to profiles
alter table profiles add column if not exists is_admin boolean default false;

-- To make yourself an admin, run:
-- update profiles set is_admin = true where email = 'your-email@example.com';
