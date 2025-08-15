-- Test the username login function
-- Run this in your Supabase Dashboard SQL Editor

-- Check if the function exists
SELECT 
    'FUNCTION EXISTS:' as info,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name = 'get_user_email_by_id';

-- Test the function with a sample user ID
-- Replace 'your-user-id-here' with an actual user ID from your users table
SELECT 
    'TEST FUNCTION:' as info,
    * 
FROM get_user_email_by_id('your-user-id-here');

-- Show sample users to get a valid ID for testing
SELECT 
    'SAMPLE USERS:' as info,
    id,
    username,
    created_at
FROM users 
LIMIT 3; 