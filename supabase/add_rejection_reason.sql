-- Add rejection_reason column to seller_applications
ALTER TABLE seller_applications 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Update RLS to ensure users can see their own rejection reasons
-- (Assuming existing policy allows users to see their own applications)
