-- Make transaction_id optional in reviews table to allow general campus ratings
-- RUN THIS IN SUPABASE SQL EDITOR

ALTER TABLE public.reviews 
ALTER COLUMN transaction_id DROP NOT NULL;

-- Ensure RLS is enabled and allows users to insert reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view reviews." ON public.reviews;
CREATE POLICY "Anyone can view reviews." ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create reviews." ON public.reviews;
CREATE POLICY "Authenticated users can create reviews." ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Update the profile rating when a new review is added (Optional: could be a trigger)
-- For now, we will handle the rating aggregation in the frontend or a separate script.
