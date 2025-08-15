-- Check Current Database State
-- Run this in your Supabase Dashboard SQL Editor to see what's currently set up

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
AND routine_name IN ('handle_updated_at', 'update_follower_counts');

-- ========================================
-- 3. CHECK EXISTING TRIGGERS
-- ========================================

SELECT 'EXISTING TRIGGERS:' as info;
SELECT trigger_name, event_manipulation, event_object_table, action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND event_object_table IN ('follows', 'users');

-- ========================================
-- 4. CHECK SAMPLE DATA
-- ========================================

-- Check if there are any users
SELECT 'USER COUNT:' as info;
SELECT COUNT(*) as user_count FROM public.users;

-- Check if there are any follows
SELECT 'FOLLOW COUNT:' as info;
SELECT COUNT(*) as follow_count FROM public.follows;

-- Check sample user data
SELECT 'SAMPLE USER DATA:' as info;
SELECT id, username, follower_count, following_count 
FROM public.users 
LIMIT 3;

-- Check sample follow data
SELECT 'SAMPLE FOLLOW DATA:' as info;
SELECT follower_id, followed_id, created_at 
FROM public.follows 
LIMIT 3; 