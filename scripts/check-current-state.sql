-- Check Current Database State
-- Run this in your Supabase Dashboard SQL Editor to diagnose issues

-- ========================================
-- 1. CHECK FOLLOWS TABLE STRUCTURE
-- ========================================

SELECT 
    'Follows table structure:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'follows' 
ORDER BY ordinal_position;

-- ========================================
-- 2. CHECK USERS TABLE FOLLOWER COLUMNS
-- ========================================

SELECT 
    'Users table follower columns:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('follower_count', 'following_count')
ORDER BY ordinal_position;

-- ========================================
-- 3. CHECK TRIGGERS AND FUNCTIONS
-- ========================================

SELECT 
    'Trigger functions:' as info,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name LIKE '%follower%' OR routine_name LIKE '%follow%'
ORDER BY routine_name;

SELECT 
    'Triggers:' as info,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name LIKE '%follower%' OR trigger_name LIKE '%follow%'
ORDER BY trigger_name;

-- ========================================
-- 4. CHECK CURRENT FOLLOWER COUNTS
-- ========================================

SELECT 
    'Current follower counts:' as info,
    id,
    username,
    follower_count,
    following_count,
    created_at
FROM public.users 
ORDER BY username;

-- ========================================
-- 5. CHECK ACTUAL FOLLOWS DATA
-- ========================================

SELECT 
    'Total follows in database:' as info,
    COUNT(*) as count
FROM public.follows;

SELECT 
    'Sample follows data:' as info,
    id,
    follower_id,
    followed_id,
    created_at
FROM public.follows 
ORDER BY created_at DESC
LIMIT 10;

-- ========================================
-- 6. VERIFY COUNTS MATCH ACTUAL DATA
-- ========================================

SELECT 
    'Count verification:' as info,
    u.id,
    u.username,
    u.follower_count as stored_follower_count,
    (SELECT COUNT(*) FROM public.follows WHERE followed_id = u.id) as actual_follower_count,
    u.following_count as stored_following_count,
    (SELECT COUNT(*) FROM public.follows WHERE follower_id = u.id) as actual_following_count,
    CASE 
        WHEN u.follower_count = (SELECT COUNT(*) FROM public.follows WHERE followed_id = u.id) 
        AND u.following_count = (SELECT COUNT(*) FROM public.follows WHERE follower_id = u.id)
        THEN '✓ MATCH'
        ELSE '✗ MISMATCH'
    END as status
FROM public.users u
ORDER BY u.username;

-- ========================================
-- 7. CHECK RLS POLICIES
-- ========================================

SELECT 
    'Follows table policies:' as info,
    policyname,
    permissive,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'follows'
ORDER BY policyname;

-- Success message
SELECT 'Database state check completed!' as status; 