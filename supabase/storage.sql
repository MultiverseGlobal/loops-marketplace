-- Create a storage bucket for listings
insert into storage.buckets (id, name, public)
values ('listings', 'listings', true);

-- Policy: Allow public to view images
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'listings' );

-- Policy: Allow authenticated users to upload images
create policy "Authenticated Uploads"
  on storage.objects for insert
  with check (
    bucket_id = 'listings' 
    and auth.role() = 'authenticated'
  );

-- Policy: Allow users to delete their own images (Optional but good practice)
create policy "Owner Delete"
  on storage.objects for delete
  using (
    bucket_id = 'listings'
    and auth.uid() = owner
  );
