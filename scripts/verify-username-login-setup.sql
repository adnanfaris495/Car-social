-- Verify Username Login Setup
-- Run this in your Supabase Dashboard SQL Editor

-- ========================================
-- 1. CHECK IF FUNCTION EXISTS
-- ========================================

SELECT 
    'FUNCTION STATUS:' as info,
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'get_user_email_by_id';

-- ========================================
-- 2. CHECK FUNCTION PERMISSIONS
-- ========================================

SELECT 
    'FUNCTION PERMISSIONS:' as info,
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_name = 'get_user_email_by_id';

-- ========================================
-- 3. TEST THE FUNCTION
-- ========================================

-- First, get a sample user ID
SELECT 
    'SAMPLE USER:' as info,
    id,
    username,
    created_at
FROM users 
LIMIT 1;

-- Test the function with the first user (replace with actual ID)
-- SELECT * FROM get_user_email_by_id('paste-user-id-here');

-- ========================================
-- 4. CHECK USERS TABLE STRUCTURE
-- ========================================

SELECT 
    'USERS TABLE STRUCTURE:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- ========================================
-- 5. CHECK SAMPLE DATA
-- ========================================

SELECT 
    'SAMPLE USERS:' as info,
    id,
    username,
    created_at
FROM users 
LIMIT 5; 