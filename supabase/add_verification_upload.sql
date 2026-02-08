-- Add student_id_url to seller_applications
ALTER TABLE seller_applications 
ADD COLUMN IF NOT EXISTS student_id_url text;

-- Create a secure bucket for ID cards if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('private_documents', 'private_documents', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Authenticated users can upload to private_documents
CREATE POLICY "Authenticated users can upload private docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'private_documents' AND auth.uid() = owner);

-- Policy: Users can see their own uploaded docs
CREATE POLICY "Users can view own private docs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'private_documents' AND auth.uid() = owner);

-- Policy: Admins (technically all authenticated for this MVP) can view
-- In production, restrict this to admin role only
