-- Test Follow Trigger Functionality
-- Run this in your Supabase Dashboard SQL Editor to verify the trigger works

-- ========================================
-- 1. CHECK CURRENT STATE
-- ========================================

-- Check current follower counts
SELECT 
    'Current follower counts:' as info,
    username,
    follower_count,
    following_count
FROM public.users 
ORDER BY username;

-- ========================================
-- 2. TEST THE TRIGGER
-- ========================================

-- First, let's see what follows exist
SELECT 
    'Existing follows:' as info,
    COUNT(*) as total_follows
FROM public.follows;

-- Show some sample follows
SELECT 
    'Sample follows:' as info,
    f.follower_id,
    u1.username as follower_username,
    f.followed_id,
    u2.username as followed_username
FROM public.follows f
JOIN public.users u1 ON f.follower_id = u1.id
JOIN public.users u2 ON f.followed_id = u2.id
LIMIT 5;

-- ========================================
-- 3. SIMULATE A FOLLOW (if you want to test)
-- ========================================

-- Uncomment the lines below to test the trigger
-- Replace the UUIDs with actual user IDs from your database

/*
-- Test follow (replace with actual user IDs)
INSERT INTO public.follows (follower_id, followed_id)
VALUES (
    '575a7946-aa3d-43be-94af-222748808a54', -- CEOFaris
    'ffc30bd4-3b79-46cf-b7c1-f04b9a3230ba'  -- abeer.adnan
);

-- Check if counts updated
SELECT 
    'After follow - follower counts:' as info,
    username,
    follower_count,
    following_count
FROM public.users 
WHERE username IN ('CEOFaris', 'abeer.adnan');

-- Test unfollow
DELETE FROM public.follows 
WHERE follower_id = '575a7946-aa3d-43be-94af-222748808a54' 
AND followed_id = 'ffc30bd4-3b79-46cf-b7c1-f04b9a3230ba';

-- Check if counts updated back
SELECT 
    'After unfollow - follower counts:' as info,
    username,
    follower_count,
    following_count
FROM public.users 
WHERE username IN ('CEOFaris', 'abeer.adnan');
*/

-- ========================================
-- 4. VERIFY TRIGGER STATUS
-- ========================================

-- Check if trigger exists
SELECT 
    'Trigger exists:' as info,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_update_follower_counts';

-- Check if function exists
SELECT 
    'Function exists:' as info,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name = 'update_follower_counts';

-- Success message
SELECT 'Trigger test completed! The trigger should automatically update follower/following counts when follows are added or removed.' as status; 