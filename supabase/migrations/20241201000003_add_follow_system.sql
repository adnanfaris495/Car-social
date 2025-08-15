-- Add follow/follower system
-- Run this in your Supabase Dashboard SQL Editor

-- Step 1: Drop any existing triggers and functions
DROP TRIGGER IF EXISTS handle_updated_at ON public.follows;
DROP TRIGGER IF EXISTS trigger_update_follow_counts ON public.follows;
DROP FUNCTION IF EXISTS update_follow_counts();

-- Step 2: Create follows table FIRST
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  UNIQUE(follower_id, following_id)
);

-- Step 3: Enable RLS on follows table
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies for follows table
CREATE POLICY "Users can view all follows" ON public.follows
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own follows" ON public.follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows" ON public.follows
  FOR DELETE USING (auth.uid() = follower_id);

-- Step 5: Create indexes for better performance
CREATE INDEX IF NOT EXISTS follows_follower_id_idx ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS follows_following_id_idx ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS follows_created_at_idx ON public.follows(created_at DESC);

-- Step 6: Add follower_count and following_count columns to users table if they don't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- Step 7: Create trigger function to update follower/following counts
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment following_count for follower
    UPDATE public.users 
    SET following_count = following_count + 1 
    WHERE id = NEW.follower_id;
    
    -- Increment follower_count for following
    UPDATE public.users 
    SET follower_count = follower_count + 1 
    WHERE id = NEW.following_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement following_count for follower
    UPDATE public.users 
    SET following_count = following_count - 1 
    WHERE id = OLD.follower_id;
    
    -- Decrement follower_count for following
    UPDATE public.users 
    SET follower_count = follower_count - 1 
    WHERE id = OLD.following_id;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create trigger to automatically update counts
CREATE TRIGGER trigger_update_follow_counts
  AFTER INSERT OR DELETE ON public.follows
  FOR EACH ROW
  EXECUTE FUNCTION update_follow_counts();

-- Step 9: Initialize counts for existing users
UPDATE public.users 
SET follower_count = (
  SELECT COUNT(*) 
  FROM public.follows 
  WHERE following_id = public.users.id
),
following_count = (
  SELECT COUNT(*) 
  FROM public.follows 
  WHERE follower_id = public.users.id
);

-- Success message
SELECT 'Follow system added successfully!' as status; 