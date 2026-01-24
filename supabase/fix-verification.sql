-- Manually set email_verified to true for your profile
-- Run this in Supabase SQL Editor

-- Option 1: Update ALL profiles (if you're the only user)
UPDATE profiles 
SET email_verified = true;

-- Option 2: Update specific user by email (replace with your email)
-- UPDATE profiles 
-- SET email_verified = true 
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');

-- Check the result
SELECT 
    p.id,
    u.email,
    p.full_name,
    p.email_verified,
    p.campus_id
FROM profiles p
JOIN auth.users u ON p.id = u.id;
