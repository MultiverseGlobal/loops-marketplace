-- DATA INTEGRITY FIX: Sync Approved Plugs with Profiles in Real-time

-- 1. Backfill user_id in seller_applications using email matching
UPDATE public.seller_applications sa
SET user_id = p.id
FROM public.profiles p
WHERE sa.user_id IS NULL
  AND sa.campus_email = p.email;

-- 2. Force-update Profile Status for ALL Approved Applications that have a user_id
--    This ensures that even if the API failed to update the profile earlier, it gets fixed now.
UPDATE public.profiles p
SET 
  is_plug = TRUE,
  primary_role = 'plug',
  store_name = COALESCE(sa.store_name, p.store_name),
  store_logo_url = COALESCE(sa.store_logo_url, p.store_logo_url),
  store_banner_color = COALESCE(sa.store_banner_color, 'bg-loops-primary'),
  reputation = GREATEST(p.reputation, 100) -- Give them a starting boost if they don't have it
FROM public.seller_applications sa
WHERE sa.user_id = p.id
  AND sa.status = 'approved'
  AND (p.is_plug = FALSE OR p.is_plug IS NULL);

-- 3. Ensure Referral Codes exist for all Plugs (just in case)
UPDATE public.profiles
SET referral_code = UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6))
WHERE is_plug = TRUE 
  AND referral_code IS NULL;

-- 4. Verify the results
SELECT 
  count(*) as count_approved_apps,
  (SELECT count(*) FROM public.profiles WHERE is_plug = TRUE) as count_actual_plugs
FROM public.seller_applications 
WHERE status = 'approved';
