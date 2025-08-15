-- Fix Follow System
-- Run this in your Supabase Dashboard SQL Editor

-- ========================================
-- 1. CREATE OR REPLACE THE TRIGGER FUNCTION
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
-- 2. DROP EXISTING TRIGGER IF IT EXISTS
-- ========================================

DROP TRIGGER IF EXISTS trigger_update_follower_counts ON public.follows;

-- ========================================
-- 3. CREATE THE TRIGGER
-- ========================================

CREATE TRIGGER trigger_update_follower_counts
    AFTER INSERT OR DELETE ON public.follows
    FOR EACH ROW
    EXECUTE FUNCTION update_follower_counts();

-- ========================================
-- 4. ENSURE USERS TABLE HAS THE REQUIRED COLUMNS
-- ========================================

-- Add follower_count column if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0;

-- Add following_count column if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- ========================================
-- 5. UPDATE EXISTING COUNTS
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
-- 6. VERIFY THE SETUP
-- ========================================

-- Check if the function exists
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'update_follower_counts';

-- Check if the trigger exists
SELECT trigger_name, event_manipulation 
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_update_follower_counts';

-- Show sample user data
SELECT id, username, follower_count, following_count 
FROM public.users 
LIMIT 5;

SELECT 'Follow system setup completed!' as status; 