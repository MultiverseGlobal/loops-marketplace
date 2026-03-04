-- 🛡️ Founding Plug RLS Stabilization
-- Ensures any student can submit an application while keeping data secure.

BEGIN;

-- 1. Enable RLS (just in case)
ALTER TABLE public.seller_applications ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing insertion policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can submit application" ON public.seller_applications;
DROP POLICY IF EXISTS "Unauthenticated users can insert applications" ON public.seller_applications;
DROP POLICY IF EXISTS "Insert for all" ON public.seller_applications;

-- 3. Create the definitive insertion policy
-- This allows both 'anon' (unlogged) and 'authenticated' users to insert.
CREATE POLICY "Enable insert for all users" 
ON public.seller_applications 
FOR INSERT 
WITH CHECK (true);

-- 4. Secure select/update (Only Admins or the User themselves)
-- Note: Current admin logic uses 'authenticated' as a proxy, but we should use is_admin check.
DROP POLICY IF EXISTS "Authenticated users can view applications" ON public.seller_applications;
DROP POLICY IF EXISTS "Authenticated users can update status" ON public.seller_applications;

CREATE POLICY "Admins can view all applications"
ON public.seller_applications
FOR SELECT
USING (
  auth.role() = 'authenticated' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admins can update applications"
ON public.seller_applications
FOR UPDATE
USING (
  auth.role() = 'authenticated' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

COMMIT;
