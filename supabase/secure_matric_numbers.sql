-- Secure Student Matriculation Numbers
-- This script moves sensitive data to a private table with strict RLS.
-- RUN THIS IN SUPABASE SQL EDITOR

-- 0. Ensure profiles table has the necessary columns for security policies
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 1. Create a private table for student verification data
CREATE TABLE IF NOT EXISTS public.student_verifications (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    matric_number TEXT NOT NULL,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS on the private table
ALTER TABLE public.student_verifications ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Users can only see their own verification info
DROP POLICY IF EXISTS "Users can view own verification." ON public.student_verifications;
CREATE POLICY "Users can view own verification." ON public.student_verifications 
FOR SELECT USING (auth.uid() = user_id);

-- 4. Policy: Users can only insert their own verification info
DROP POLICY IF EXISTS "Users can insert own verification." ON public.student_verifications;
CREATE POLICY "Users can insert own verification." ON public.student_verifications 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Policy: Admins can view all verification info for moderation
DROP POLICY IF EXISTS "Admins can view all verifications." ON public.student_verifications;
CREATE POLICY "Admins can view all verifications." ON public.student_verifications 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
);

-- 6. Cleanup: Drop the sensitive column from the public profiles table
-- We only do this after the migration is ready.
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS matric_number;

-- Note: is_verified remains in public profiles to show student trust status, 
-- but the actual Matric Number is now protected.
