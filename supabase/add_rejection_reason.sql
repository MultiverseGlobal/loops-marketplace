-- Add rejection_reason column to seller_applications table
alter table public.seller_applications 
add column if not exists rejection_reason text;

comment on column public.seller_applications.rejection_reason is 'Reason provided by admin when rejecting an application.';
