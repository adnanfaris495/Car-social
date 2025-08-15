-- Complete Follow System Migration
-- This migration sets up the complete follow system with RLS policies and triggers

-- Enable RLS on follows table
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all follows" ON public.follows;
DROP POLICY IF EXISTS "Users can create follows" ON public.follows;
DROP POLICY IF EXISTS "Users can delete their own follows" ON public.follows;

-- Create RLS policies for follows table
CREATE POLICY "Users can view all follows" ON public.follows
  FOR SELECT USING (true);

CREATE POLICY "Users can create follows" ON public.follows
  FOR INSERT WITH CHECK (
    auth.uid() = follower_id AND 
    follower_id != followed_id
  );

CREATE POLICY "Users can delete their own follows" ON public.follows
  FOR DELETE USING (auth.uid() = follower_id);

-- Add follower_count and following_count columns to users table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'follower_count') THEN
        ALTER TABLE public.users ADD COLUMN follower_count integer DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'following_count') THEN
        ALTER TABLE public.users ADD COLUMN following_count integer DEFAULT 0;
    END IF;
END $$;

-- Create function to update follower counts
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

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_update_follower_counts ON public.follows;

-- Create trigger to automatically update follower counts
CREATE TRIGGER trigger_update_follower_counts
    AFTER INSERT OR DELETE ON public.follows
    FOR EACH ROW
    EXECUTE FUNCTION update_follower_counts();

-- Initialize follower counts for existing users
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

-- Success message
SELECT 'Follow system setup completed successfully!' as status; 