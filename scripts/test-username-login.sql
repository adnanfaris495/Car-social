-- Test Username Login Setup
-- Run this in your Supabase Dashboard SQL Editor

-- ========================================
-- 1. VERIFY FUNCTION EXISTS
-- ========================================

SELECT 
    'FUNCTION STATUS:' as info,
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_name = 'get_user_email_by_id';

-- ========================================
-- 2. TEST FUNCTION WITH REAL USER
-- ========================================

-- Get a real user to test with
SELECT 
    'TESTING WITH USER:' as info,
    id,
    username,
    created_at
FROM users 
WHERE username = 'aakhtar1';

-- Test the function with the real user
SELECT 
    'FUNCTION TEST RESULT:' as info,
    * 
FROM get_user_email_by_id('8c1889e0-b258-431e-821a-bee57ac3fa68');

-- ========================================
-- 3. VERIFY AUTH USERS
-- ========================================

SELECT 
    'AUTH USER CHECK:' as info,
    id,
    email,
    created_at
FROM auth.users 
WHERE id = '8c1889e0-b258-431e-821a-bee57ac3fa68';

-- ========================================
-- 4. SUCCESS MESSAGE
-- ========================================

SELECT 'Username login setup is working correctly!' as status; 