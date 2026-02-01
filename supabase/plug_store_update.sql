-- Consolidated Update for Plug Pulse Storefront
-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Ensure store_name exists and add new plug fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS store_name TEXT,
ADD COLUMN IF NOT EXISTS is_plug BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS store_banner_color TEXT DEFAULT 'bg-loops-primary',
ADD COLUMN IF NOT EXISTS store_category TEXT,
ADD COLUMN IF NOT EXISTS plug_type TEXT DEFAULT 'Individual' CHECK (plug_type IN ('Individual', 'Business', 'Organization'));

-- 2. Update existing role data
UPDATE public.profiles 
SET is_plug = TRUE 
WHERE primary_role = 'selling';

-- 3. Ensure follows table is solid
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(follower_id, following_id)
);

-- Enable RLS on follows if not enabled
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Re-apply policies (drop first to avoid conflicts)
DROP POLICY IF EXISTS "Users can view all follows" ON public.follows;
CREATE POLICY "Users can view all follows" ON public.follows FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can follow others" ON public.follows;
CREATE POLICY "Users can follow others" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can unfollow" ON public.follows;
CREATE POLICY "Users can unfollow" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- 4. Refresh PostgREST cache
-- Note: This is usually automatic, but adding columns can sometimes require a manual "Reload Schema" in Supabase UI.
COMMENT ON TABLE public.profiles IS 'Student and Plug profiles for Loops.';
