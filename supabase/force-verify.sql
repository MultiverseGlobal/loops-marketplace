-- RUN THIS IN SUPABASE SQL EDITOR
-- This script ensures all profiles have the correct verification status based on Supabase Auth

-- 1. Update all profiles that are already verified in Auth
UPDATE profiles
SET email_verified = true
FROM auth.users
WHERE profiles.id = auth.users.id
AND (auth.users.email_confirmed_at IS NOT NULL OR auth.users.phone_confirmed_at IS NOT NULL OR auth.users.last_sign_in_at IS NOT NULL);

-- 2. Verify everything is correct
SELECT 
    p.id,
    u.email,
    p.email_verified,
    u.email_confirmed_at,
    u.last_sign_in_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY u.last_sign_in_at DESC;
