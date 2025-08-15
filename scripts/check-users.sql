-- Check Users in Database
-- Run this in your Supabase Dashboard SQL Editor

-- ========================================
-- 1. CHECK USERS TABLE
-- ========================================

SELECT 
    'USERS IN DATABASE:' as info,
    id,
    username,
    created_at
FROM users 
ORDER BY created_at DESC;

-- ========================================
-- 2. CHECK AUTH USERS
-- ========================================

SELECT 
    'AUTH USERS:' as info,
    id,
    email,
    created_at
FROM auth.users 
ORDER BY created_at DESC;

-- ========================================
-- 3. CHECK IF FUNCTION EXISTS
-- ========================================

SELECT 
    'DATABASE FUNCTION:' as info,
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_name = 'get_user_email_by_id';

-- ========================================
-- 4. TEST FUNCTION WITH SAMPLE USER
-- ========================================

-- Get first user to test with
SELECT 
    'SAMPLE USER FOR TESTING:' as info,
    id,
    username
FROM users 
LIMIT 1;

-- Test the function (uncomment and replace with actual user ID)
-- SELECT * FROM get_user_email_by_id('paste-user-id-here'); 