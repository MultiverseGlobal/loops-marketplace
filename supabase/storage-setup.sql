-- RUN THIS IN SUPABASE SQL EDITOR
-- This script sets up the 'listings' bucket and its RLS policies

-- 1. Create the bucket
insert into storage.buckets (id, name, public)
values ('listings', 'listings', true)
on conflict (id) do nothing;

-- 2. Allow public access to read images
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Listings Public Access" ON storage.objects;
CREATE POLICY "Listings Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'listings' );

-- 3. Allow authenticated users to upload images
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Listings Authenticated Upload" ON storage.objects;
CREATE POLICY "Listings Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'listings' 
    AND auth.role() = 'authenticated'
);

-- 4. Allow users to delete their own images
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
DROP POLICY IF EXISTS "Listings User Delete" ON storage.objects;
CREATE POLICY "Listings User Delete"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'listings' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);
