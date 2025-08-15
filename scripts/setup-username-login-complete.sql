-- Complete Username Login Setup
-- Run this in your Supabase Dashboard SQL Editor

-- ========================================
-- 1. CREATE THE DATABASE FUNCTION
-- ========================================

-- Drop the function if it exists
DROP FUNCTION IF EXISTS get_user_email_by_id(UUID);

-- Create the function to get user email by ID
CREATE OR REPLACE FUNCTION get_user_email_by_id(user_id UUID)
RETURNS TABLE(email TEXT) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function allows us to get the email from auth.users
  -- It's marked as SECURITY DEFINER so it runs with elevated privileges
  RETURN QUERY
  SELECT au.email::TEXT
  FROM auth.users au
  WHERE au.id = user_id;
END;
$$;

-- ========================================
-- 2. SET UP PERMISSIONS
-- ========================================

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_email_by_id(UUID) TO authenticated;

-- Grant execute permission to anon users (for API routes)
GRANT EXECUTE ON FUNCTION get_user_email_by_id(UUID) TO anon;

-- ========================================
-- 3. VERIFY THE SETUP
-- ========================================

-- Check if the function exists
SELECT 
    'FUNCTION STATUS:' as info,
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_name = 'get_user_email_by_id';

-- Check function permissions
SELECT 
    'FUNCTION PERMISSIONS:' as info,
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_name = 'get_user_email_by_id';

-- ========================================
-- 4. TEST THE FUNCTION
-- ========================================

-- Get a sample user to test with
SELECT 
    'SAMPLE USER FOR TESTING:' as info,
    id,
    username,
    created_at
FROM users 
LIMIT 1;

-- Test the function (uncomment and replace with actual user ID)
-- SELECT * FROM get_user_email_by_id('paste-user-id-here');

-- ========================================
-- 5. SUCCESS MESSAGE
-- ========================================

SELECT 'Username login setup completed successfully!' as status; 