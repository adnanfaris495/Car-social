-- Check Database State
-- Run this in your Supabase Dashboard SQL Editor to diagnose issues

-- ========================================
-- 1. CHECK TABLE STRUCTURES
-- ========================================

-- Check users table structure
SELECT 'USERS TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Check follows table structure
SELECT 'FOLLOWS TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'follows' 
ORDER BY ordinal_position;

-- ========================================
-- 2. CHECK EXISTING FUNCTIONS
-- ========================================

SELECT 'EXISTING FUNCTIONS:' as info;
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN ('update_follower_counts', 'handle_updated_at')
ORDER BY routine_name;

-- ========================================
-- 3. CHECK EXISTING TRIGGERS
-- ========================================

SELECT 'EXISTING TRIGGERS:' as info;
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND trigger_name LIKE '%follow%' OR trigger_name LIKE '%updated%'
ORDER BY trigger_name;

-- ========================================
-- 4. CHECK SAMPLE DATA
-- ========================================

SELECT 'SAMPLE USERS:' as info;
SELECT id, username, follower_count, following_count 
FROM public.users 
LIMIT 5;

SELECT 'SAMPLE FOLLOWS:' as info;
SELECT follower_id, followed_id, created_at, updated_at
FROM public.follows 
LIMIT 5;

-- ========================================
-- 5. CHECK COUNTS
-- ========================================

SELECT 'FOLLOW COUNTS:' as info;
SELECT 
    COUNT(*) as total_follows,
    COUNT(DISTINCT follower_id) as unique_followers,
    COUNT(DISTINCT followed_id) as unique_followed
FROM public.follows;

-- ========================================
-- 6. CHECK FOR ERRORS
-- ========================================

SELECT 'POTENTIAL ISSUES:' as info;

-- Check if users have follower_count but follows table doesn't exist
SELECT 'Users with follower_count but no follows table' as issue
WHERE EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'follower_count'
) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'follows'
);

-- Check if follows table exists but no trigger
SELECT 'Follows table exists but no trigger' as issue
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'follows'
) AND NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'trigger_update_follower_counts'
);

SELECT 'Database check completed!' as status; 