-- Pre-Launch Configuration: Activate Only Founding 10 Nodes
-- This script adds an is_active flag and sets it to true ONLY for the Grand Launch universities

-- 1. Add is_active column to campuses table
ALTER TABLE public.campuses 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;

-- 2. Activate ONLY the Founding 10 nodes
UPDATE public.campuses SET is_active = true WHERE slug IN (
    'veritas',
    'bingham', 
    'nile',
    'uniabuja',
    'atbu',
    'unijos',
    'mouau',
    'unilag',
    'abu',
    'unn'
);

COMMENT ON COLUMN public.campuses.is_active IS 'Controls whether a campus is available for new user signups during onboarding. Set to true only for active/launched nodes.';
