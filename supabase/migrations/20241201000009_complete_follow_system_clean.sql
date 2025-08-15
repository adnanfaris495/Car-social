-- Complete Follow System Migration - Clean Start
-- This migration drops everything and recreates the follow system from scratch

-- Step 1: Drop all existing triggers, functions, and policies
DROP TRIGGER IF EXISTS trigger_update_follower_counts ON public.follows;
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

-- Step 5: Create indexes for better performance
CREATE INDEX idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX idx_follows_followed_id ON public.follows(followed_id);

-- Step 6: Enable RLS on follows table
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies for follows table
CREATE POLICY "Users can view all follows" ON public.follows
  FOR SELECT USING (true);

CREATE POLICY "Users can create follows" ON public.follows
  FOR INSERT WITH CHECK (
    auth.uid() = follower_id AND 
    follower_id != followed_id
  );

CREATE POLICY "Users can delete their own follows" ON public.follows
  FOR DELETE USING (auth.uid() = follower_id);

-- Step 8: Add follower_count and following_count columns to users table
ALTER TABLE public.users ADD COLUMN follower_count integer DEFAULT 0;
ALTER TABLE public.users ADD COLUMN following_count integer DEFAULT 0;

-- Step 9: Create function to update follower counts
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

-- Step 10: Create trigger to automatically update follower counts
CREATE TRIGGER trigger_update_follower_counts
    AFTER INSERT OR DELETE ON public.follows
    FOR EACH ROW
    EXECUTE FUNCTION update_follower_counts();

-- Step 11: Initialize follower counts for existing users (if any follows exist)
-- This will be 0 for all users since we just created the table
UPDATE public.users 
SET follower_count = 0,
    following_count = 0;

-- Step 12: Success message
SELECT 'Follow system setup completed successfully!' as status; 