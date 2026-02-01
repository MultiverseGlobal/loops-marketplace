-- Add Matriculation Number to Profiles for flexible student verification
-- RUN THIS IN SUPABASE SQL EDITOR

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS matric_number TEXT,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.profiles.matric_number IS 'Student University ID (Matriculation Number).';
COMMENT ON COLUMN public.profiles.is_verified IS 'Whether the student has been manually or automatically verified.';
