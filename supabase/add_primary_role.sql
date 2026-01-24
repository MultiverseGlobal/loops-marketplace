-- Add missing primary_role column to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS primary_role text DEFAULT 'buying' CHECK (primary_role IN ('buying', 'selling'));
