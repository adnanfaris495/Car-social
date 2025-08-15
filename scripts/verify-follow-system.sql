-- Verify and Fix Follow System
-- Run this in your Supabase Dashboard SQL Editor

-- ========================================
-- 1. CHECK CURRENT DATABASE STRUCTURE
-- ========================================

-- Check if follows table exists and has correct structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'follows' 
ORDER BY ordinal_position;

-- Check if users table has follower_count and following_count columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('follower_count', 'following_count')
ORDER BY ordinal_position;

-- ========================================
-- 2. CHECK TRIGGERS
-- ========================================

-- Check if the trigger function exists
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'update_follower_counts';

-- Check if the trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_update_follower_counts';

-- ========================================
-- 3. CHECK RLS POLICIES
-- ========================================

-- Check follows table policies
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'follows'
ORDER BY policyname;

-- Check users table policies
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- ========================================
-- 4. FIX ISSUES IF NEEDED
-- ========================================

-- If the trigger function doesn't exist, create it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'update_follower_counts') THEN
        CREATE OR REPLACE FUNCTION update_follower_counts()
        RETURNS TRIGGER AS $$
        BEGIN
            IF TG_OP = 'INSERT' THEN
                -- Increment follower_count for followed user
                UPDATE public.users 
                SET follower_count = follower_count + 1 
                WHERE id = NEW.followed_id;
                
                -- Increment following_count for follower
                UPDATE public.users 
                SET following_count = following_count + 1 
                WHERE id = NEW.follower_id;
                
                RETURN NEW;
            ELSIF TG_OP = 'DELETE' THEN
                -- Decrement follower_count for followed user
                UPDATE public.users 
                SET follower_count = follower_count - 1 
                WHERE id = OLD.followed_id;
                
                -- Decrement following_count for follower
                UPDATE public.users 
                SET following_count = following_count - 1 
                WHERE id = OLD.follower_id;
                
                RETURN OLD;
            END IF;
            
            RETURN NULL;
        END;
        $$ LANGUAGE plpgsql;
        
        RAISE NOTICE 'Created update_follower_counts function';
    END IF;
END $$;

-- If the trigger doesn't exist, create it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'trigger_update_follower_counts') THEN
        CREATE TRIGGER trigger_update_follower_counts
            AFTER INSERT OR DELETE ON public.follows
            FOR EACH ROW
            EXECUTE FUNCTION update_follower_counts();
            
        RAISE NOTICE 'Created trigger_update_follower_counts trigger';
    END IF;
END $$;

-- ========================================
-- 5. TEST THE SYSTEM
-- ========================================

-- Get a sample user to test with
DO $$ 
DECLARE
    test_user_id uuid;
    test_user2_id uuid;
BEGIN
    -- Get first two users for testing
    SELECT id INTO test_user_id FROM public.users LIMIT 1;
    SELECT id INTO test_user2_id FROM public.users WHERE id != test_user_id LIMIT 1;
    
    IF test_user_id IS NOT NULL AND test_user2_id IS NOT NULL THEN
        RAISE NOTICE 'Test users found: % and %', test_user_id, test_user2_id;
        
        -- Show current follower counts
        RAISE NOTICE 'Before follow - User 1: % followers, % following', 
            (SELECT follower_count FROM public.users WHERE id = test_user_id),
            (SELECT following_count FROM public.users WHERE id = test_user_id);
            
        RAISE NOTICE 'Before follow - User 2: % followers, % following', 
            (SELECT follower_count FROM public.users WHERE id = test_user2_id),
            (SELECT following_count FROM public.users WHERE id = test_user2_id);
        
        -- Try to create a follow relationship
        INSERT INTO public.follows (follower_id, followed_id) 
        VALUES (test_user_id, test_user2_id)
        ON CONFLICT (follower_id, followed_id) DO NOTHING;
        
        -- Show updated follower counts
        RAISE NOTICE 'After follow - User 1: % followers, % following', 
            (SELECT follower_count FROM public.users WHERE id = test_user_id),
            (SELECT following_count FROM public.users WHERE id = test_user_id);
            
        RAISE NOTICE 'After follow - User 2: % followers, % following', 
            (SELECT follower_count FROM public.users WHERE id = test_user2_id),
            (SELECT following_count FROM public.users WHERE id = test_user2_id);
        
        -- Clean up test follow
        DELETE FROM public.follows WHERE follower_id = test_user_id AND followed_id = test_user2_id;
        
        RAISE NOTICE 'Test completed successfully!';
    ELSE
        RAISE NOTICE 'Not enough users for testing';
    END IF;
END $$;

-- ========================================
-- 6. FINAL STATUS
-- ========================================

SELECT 'Follow system verification completed!' as status; 