-- Fix Follow System - Final Version
-- This migration completely fixes the follow system by handling the trigger function issue

-- Step 1: Drop all existing triggers, functions, and policies
DROP TRIGGER IF EXISTS trigger_update_follower_counts ON public.follows;
DROP TRIGGER IF EXISTS handle_updated_at ON public.follows;
DROP FUNCTION IF EXISTS update_follower_counts();
DROP POLICY IF EXISTS "Users can view all follows" ON public.follows;
DROP POLICY IF EXISTS "Users can create follows" ON public.follows;
DROP POLICY IF EXISTS "Users can delete their own follows" ON public.follows;

-- Step 2: Drop the follows table if it exists
DROP TABLE IF EXISTS public.follows;

-- Step 3: Remove follower_count and following_count columns from users table if they exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'follower_count') THEN
        ALTER TABLE public.users DROP COLUMN follower_count;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'following_count') THEN
        ALTER TABLE public.users DROP COLUMN following_count;
    END IF;
END $$;

-- Step 4: Create the follows table
CREATE TABLE public.follows (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    follower_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    followed_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(follower_id, followed_id)
);

-- Step 5: Create indexes for performance
CREATE INDEX ON public.follows(follower_id);
CREATE INDEX ON public.follows(followed_id);

-- Step 6: Add follower_count and following_count columns to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS follower_count integer DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS following_count integer DEFAULT 0;

-- Step 7: Enable RLS on follows table
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS policies for follows table
CREATE POLICY "Users can view all follows" ON public.follows
  FOR SELECT USING (true);

CREATE POLICY "Users can create follows" ON public.follows
  FOR INSERT WITH CHECK (
    auth.uid() = follower_id AND 
    follower_id != followed_id
  );

CREATE POLICY "Users can delete their own follows" ON public.follows
  FOR DELETE USING (auth.uid() = follower_id);

-- Step 9: Create the trigger function for updating follower counts
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Update follower count for the followed user
    IF TG_OP = 'INSERT' THEN
        UPDATE public.users 
        SET follower_count = follower_count + 1 
        WHERE id = NEW.followed_id;
        
        UPDATE public.users 
        SET following_count = following_count + 1 
        WHERE id = NEW.follower_id;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.users 
        SET follower_count = follower_count - 1 
        WHERE id = OLD.followed_id;
        
        UPDATE public.users 
        SET following_count = following_count - 1 
        WHERE id = OLD.follower_id;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Step 10: Create the trigger
CREATE TRIGGER trigger_update_follower_counts
    AFTER INSERT OR DELETE ON public.follows
    FOR EACH ROW
    EXECUTE FUNCTION update_follower_counts();

-- Step 11: Initialize follower counts for existing users
UPDATE public.users 
SET follower_count = (
    SELECT COUNT(*) 
    FROM public.follows 
    WHERE followed_id = users.id
),
following_count = (
    SELECT COUNT(*) 
    FROM public.follows 
    WHERE follower_id = users.id
); 