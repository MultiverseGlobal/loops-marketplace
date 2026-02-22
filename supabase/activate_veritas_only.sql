-- Pivot to Lean Launch: Isolate Veritas Only
-- This script ensures only Veritas University is active, while deactivating bingham, nile, uniabuja, etc.

-- 1. Ensure the column exists
ALTER TABLE public.campuses 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;

-- 2. Deactivate EVERYTHING first (Global Reset)
UPDATE public.campuses SET is_active = false;

-- 3. Activate ONLY Veritas
UPDATE public.campuses SET is_active = true WHERE slug = 'veritas';

-- 4. Verify (Optional Comment)
COMMENT ON COLUMN public.campuses.is_active IS 'Lean Launch Mode: Set to true ONLY for Veritas.';
