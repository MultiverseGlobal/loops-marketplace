-- Fix for profiles_primary_role_check constraint
-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Identify the constraint and drop it
-- If you are unsure of the constraint name, it is likely "profiles_primary_role_check"
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_primary_role_check;

-- 2. Add the updated constraint to allow 'plug' and 'buying'
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_primary_role_check 
CHECK (primary_role IN ('student', 'buying', 'plug', 'selling'));

-- 3. Update any legacy 'selling' roles to 'plug' if you want to be consistent
UPDATE public.profiles 
SET primary_role = 'plug' 
WHERE primary_role = 'selling';

-- 4. Ensure the is_plug boolean is synced
UPDATE public.profiles 
SET is_plug = TRUE 
WHERE primary_role = 'plug';

COMMENT ON COLUMN public.profiles.primary_role IS 'Roles allowed: student, buying, plug, selling (legacy)';
