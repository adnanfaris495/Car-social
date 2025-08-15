-- Check and Fix Follower/Following Counts
-- Run this in your Supabase Dashboard SQL Editor

-- ========================================
-- 1. CHECK CURRENT COUNTS
-- ========================================

-- Check current follower/following counts for all users
SELECT 
    id,
    username,
    follower_count,
    following_count,
    created_at
FROM public.users 
ORDER BY username;

-- ========================================
-- 2. MANUALLY RECALCULATE COUNTS
-- ========================================

-- Update follower counts for all users
UPDATE public.users 
SET follower_count = (
    SELECT COUNT(*) 
    FROM public.follows 
    WHERE followed_id = users.id
);

-- Update following counts for all users
UPDATE public.users 
SET following_count = (
    SELECT COUNT(*) 
    FROM public.follows 
    WHERE follower_id = users.id
);

-- ========================================
-- 3. VERIFY THE FIXES
-- ========================================

-- Check updated counts
SELECT 
    id,
    username,
    follower_count,
    following_count
FROM public.users 
ORDER BY username;

-- Check if there are any follows in the database
SELECT 
    'Total follows in database:' as info,
    COUNT(*) as count
FROM public.follows;

-- Show sample follows
SELECT 
    'Sample follows:' as info,
    follower_id,
    followed_id,
    created_at
FROM public.follows 
LIMIT 5;

-- ========================================
-- 4. VERIFY TRIGGER IS WORKING
-- ========================================

-- Check if the trigger function exists
SELECT 
    'Trigger function exists:' as info,
    routine_name
FROM information_schema.routines 
WHERE routine_name = 'update_follower_counts';

-- Check if the trigger exists
SELECT 
    'Trigger exists:' as info,
    trigger_name
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_update_follower_counts';

-- Success message
SELECT 'Follower counts have been recalculated!' as status; 