-- Fix Follow System Only
-- Run this in your Supabase Dashboard SQL Editor

-- ========================================
-- 1. DROP EXISTING FOLLOW SYSTEM TRIGGERS
-- ========================================

-- Drop follow system triggers
DROP TRIGGER IF EXISTS trigger_update_follower_counts ON public.follows;
DROP TRIGGER IF EXISTS set_updated_at ON public.follows;

-- ========================================
-- 2. DROP FOLLOW SYSTEM FUNCTIONS
-- ========================================

DROP FUNCTION IF EXISTS update_follower_counts();

-- ========================================
-- 3. ENSURE FOLLOWS TABLE HAS CORRECT STRUCTURE
-- ========================================

-- Add updated_at column to follows table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'follows' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.follows ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
END $$;

-- ========================================
-- 4. ENSURE USERS TABLE HAS FOLLOWER COUNT COLUMNS
-- ========================================

-- Add follower_count column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'follower_count'
    ) THEN
        ALTER TABLE public.users ADD COLUMN follower_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add following_count column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'following_count'
    ) THEN
        ALTER TABLE public.users ADD COLUMN following_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- ========================================
-- 5. CREATE THE UPDATE_FOLLOWER_COUNTS FUNCTION
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
-- 6. CREATE THE FOLLOW SYSTEM TRIGGER
-- ========================================

-- Create the follow system trigger
CREATE TRIGGER trigger_update_follower_counts
    AFTER INSERT OR DELETE ON public.follows
    FOR EACH ROW
    EXECUTE FUNCTION update_follower_counts();

-- ========================================
-- 7. INITIALIZE FOLLOWER COUNTS
-- ========================================

-- Update existing follower counts
UPDATE public.users 
SET follower_count = (
    SELECT COUNT(*) 
    FROM public.follows 
    WHERE followed_id = users.id
);

UPDATE public.users 
SET following_count = (
    SELECT COUNT(*) 
    FROM public.follows 
    WHERE follower_id = users.id
);

-- ========================================
-- 8. VERIFY THE SETUP
-- ========================================

-- Check if everything is working
SELECT 'Follow system setup complete!' as status; 