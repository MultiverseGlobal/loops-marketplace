-- Run this in Supabase SQL Editor to check verification status
SELECT 
    p.id,
    u.email,
    p.full_name,
    p.email_verified,
    p.campus_id,
    p.created_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC
LIMIT 5;
