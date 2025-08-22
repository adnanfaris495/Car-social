-- Fix Follower Counts - Final Comprehensive Fix
-- Run this in your Supabase Dashboard SQL Editor

-- ========================================
-- 1. CHECK CURRENT DATABASE STRUCTURE
-- ========================================

-- Check follows table structure
SELECT 
    'Follows table structure:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'follows' 
ORDER BY ordinal_position;

-- Check users table for follower count columns
SELECT 
    'Users table follower columns:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('follower_count', 'following_count')
ORDER BY ordinal_position;

-- ========================================
-- 2. DROP EXISTING TRIGGERS AND FUNCTIONS
-- ========================================

-- Drop existing triggers
DROP TRIGGER IF EXISTS trigger_update_follower_counts ON public.follows;
DROP TRIGGER IF EXISTS trigger_update_follow_counts ON public.follows;
DROP TRIGGER IF EXISTS set_updated_at ON public.follows;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_follower_counts();
DROP FUNCTION IF EXISTS update_follow_counts();

-- ========================================
-- 3. ENSURE CORRECT TABLE STRUCTURE
-- ========================================

-- Ensure follows table has correct structure with followed_id (not following_id)
DO $$
BEGIN
    -- Check if follows table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'follows') THEN
        -- Check if it has the wrong column name (following_id instead of followed_id)
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'follows' AND column_name = 'following_id') THEN
            -- Rename the column from following_id to followed_id
            ALTER TABLE public.follows RENAME COLUMN following_id TO followed_id;
            RAISE NOTICE 'Renamed following_id to followed_id in follows table';
        END IF;
    ELSE
        -- Create follows table with correct structure
        CREATE TABLE public.follows (
            id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
            follower_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
            followed_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
            created_at timestamp with time zone DEFAULT now(),
            UNIQUE(follower_id, followed_id)
        );
        RAISE NOTICE 'Created follows table with correct structure';
    END IF;
END $$;

-- Ensure users table has follower count columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'follower_count') THEN
        ALTER TABLE public.users ADD COLUMN follower_count integer DEFAULT 0;
        RAISE NOTICE 'Added follower_count column to users table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'following_count') THEN
        ALTER TABLE public.users ADD COLUMN following_count integer DEFAULT 0;
        RAISE NOTICE 'Added following_count column to users table';
    END IF;
END $$;

-- ========================================
-- 4. CREATE CORRECT TRIGGER FUNCTION
-- ========================================

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

-- ========================================
-- 5. CREATE TRIGGER
-- ========================================

CREATE TRIGGER trigger_update_follower_counts
    AFTER INSERT OR DELETE ON public.follows
    FOR EACH ROW
    EXECUTE FUNCTION update_follower_counts();

-- ========================================
-- 6. RECALCULATE ALL FOLLOWER COUNTS
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
-- 7. VERIFY THE FIX
-- ========================================

-- Check current counts
SELECT 
    'Current follower counts:' as info,
    id,
    username,
    follower_count,
    following_count
FROM public.users 
ORDER BY username;

-- Check if trigger is working
SELECT 
    'Trigger function exists:' as info,
    routine_name
FROM information_schema.routines 
WHERE routine_name = 'update_follower_counts';

SELECT 
    'Trigger exists:' as info,
    trigger_name
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_update_follower_counts';

-- Check follows table structure
SELECT 
    'Final follows table structure:' as info,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'follows' 
ORDER BY ordinal_position;

-- Success message
SELECT 'Follower counts have been fixed successfully!' as status;
