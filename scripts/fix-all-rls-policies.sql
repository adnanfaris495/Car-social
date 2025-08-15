-- Comprehensive Fix for All RLS Policies
-- Run this in your Supabase Dashboard SQL Editor

-- ========================================
-- 1. FIX USERS TABLE RLS POLICIES
-- ========================================

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can delete their own profile" ON users;

-- Create comprehensive RLS policies for users table

-- Allow users to read all user profiles (for search functionality)
CREATE POLICY "Users can view all users" ON users
FOR SELECT USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON users
FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON users
FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to delete their own profile
CREATE POLICY "Users can delete their own profile" ON users
FOR DELETE USING (auth.uid() = id);

-- ========================================
-- 2. FIX FOLLOWS TABLE RLS POLICIES
-- ========================================

-- Enable RLS on follows table
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all follows" ON follows;
DROP POLICY IF EXISTS "Users can create follows" ON follows;
DROP POLICY IF EXISTS "Users can delete their own follows" ON follows;

-- Create comprehensive RLS policies for follows table

-- Allow users to read all follows (for follower counts)
CREATE POLICY "Users can view all follows" ON follows
FOR SELECT USING (true);

-- Allow users to insert their own follows
CREATE POLICY "Users can create follows" ON follows
FOR INSERT WITH CHECK (
  auth.uid() = follower_id AND 
  follower_id != followed_id
);

-- Allow users to delete their own follows
CREATE POLICY "Users can delete their own follows" ON follows
FOR DELETE USING (auth.uid() = follower_id);

-- ========================================
-- 3. FIX CARS TABLE RLS POLICIES
-- ========================================

-- Enable RLS on cars table
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view cars" ON cars;
DROP POLICY IF EXISTS "Users can insert cars" ON cars;
DROP POLICY IF EXISTS "Users can update cars" ON cars;
DROP POLICY IF EXISTS "Users can delete cars" ON cars;
DROP POLICY IF EXISTS "Public read access" ON cars;

-- Create comprehensive RLS policies for cars table

-- Allow users to read all cars
CREATE POLICY "Public read access" ON cars
FOR SELECT USING (true);

-- Allow users to insert their own cars
CREATE POLICY "Users can insert cars" ON cars
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own cars
CREATE POLICY "Users can update cars" ON cars
FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own cars
CREATE POLICY "Users can delete cars" ON cars
FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- 4. FIX MARKETPLACE LISTINGS RLS POLICIES
-- ========================================

-- Enable RLS on marketplace_listings table
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view listings" ON marketplace_listings;
DROP POLICY IF EXISTS "Users can insert listings" ON marketplace_listings;
DROP POLICY IF EXISTS "Users can update listings" ON marketplace_listings;
DROP POLICY IF EXISTS "Users can delete listings" ON marketplace_listings;
DROP POLICY IF EXISTS "Public read access" ON marketplace_listings;

-- Create comprehensive RLS policies for marketplace_listings table

-- Allow users to read all listings
CREATE POLICY "Public read access" ON marketplace_listings
FOR SELECT USING (true);

-- Allow users to insert their own listings
CREATE POLICY "Users can insert listings" ON marketplace_listings
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own listings
CREATE POLICY "Users can update listings" ON marketplace_listings
FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own listings
CREATE POLICY "Users can delete listings" ON marketplace_listings
FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- 5. FIX MEETS TABLE RLS POLICIES
-- ========================================

-- Enable RLS on meets table
ALTER TABLE meets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view meets" ON meets;
DROP POLICY IF EXISTS "Users can insert meets" ON meets;
DROP POLICY IF EXISTS "Users can update meets" ON meets;
DROP POLICY IF EXISTS "Users can delete meets" ON meets;
DROP POLICY IF EXISTS "Public read access" ON meets;

-- Create comprehensive RLS policies for meets table

-- Allow users to read all meets
CREATE POLICY "Public read access" ON meets
FOR SELECT USING (true);

-- Allow users to insert their own meets
CREATE POLICY "Users can insert meets" ON meets
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own meets
CREATE POLICY "Users can update meets" ON meets
FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own meets
CREATE POLICY "Users can delete meets" ON meets
FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- 6. FIX FORUM TABLES RLS POLICIES
-- ========================================

-- Enable RLS on forum_posts table
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view posts" ON forum_posts;
DROP POLICY IF EXISTS "Users can insert posts" ON forum_posts;
DROP POLICY IF EXISTS "Users can update posts" ON forum_posts;
DROP POLICY IF EXISTS "Users can delete posts" ON forum_posts;
DROP POLICY IF EXISTS "Public read access" ON forum_posts;

-- Create comprehensive RLS policies for forum_posts table

-- Allow users to read all posts
CREATE POLICY "Public read access" ON forum_posts
FOR SELECT USING (true);

-- Allow users to insert their own posts
CREATE POLICY "Users can insert posts" ON forum_posts
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own posts
CREATE POLICY "Users can update posts" ON forum_posts
FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own posts
CREATE POLICY "Users can delete posts" ON forum_posts
FOR DELETE USING (auth.uid() = user_id);

-- Enable RLS on forum_comments table
ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view comments" ON forum_comments;
DROP POLICY IF EXISTS "Users can insert comments" ON forum_comments;
DROP POLICY IF EXISTS "Users can update comments" ON forum_comments;
DROP POLICY IF EXISTS "Users can delete comments" ON forum_comments;
DROP POLICY IF EXISTS "Public read access" ON forum_comments;

-- Create comprehensive RLS policies for forum_comments table

-- Allow users to read all comments
CREATE POLICY "Public read access" ON forum_comments
FOR SELECT USING (true);

-- Allow users to insert their own comments
CREATE POLICY "Users can insert comments" ON forum_comments
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own comments
CREATE POLICY "Users can update comments" ON forum_comments
FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own comments
CREATE POLICY "Users can delete comments" ON forum_comments
FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- 7. VERIFY POLICIES
-- ========================================

-- Check users table policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- Check follows table policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'follows'
ORDER BY policyname;

-- Check cars table policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'cars'
ORDER BY policyname;

-- Step 7: Ensure follows table has correct structure
-- Check if the table exists and has correct columns
DO $$ 
BEGIN
    -- Create follows table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'follows') THEN
        CREATE TABLE public.follows (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            follower_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
            following_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
            UNIQUE(follower_id, following_id)
        );
    END IF;
    
    -- Add follower_count and following_count to users if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'follower_count') THEN
        ALTER TABLE public.users ADD COLUMN follower_count integer DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'following_count') THEN
        ALTER TABLE public.users ADD COLUMN following_count integer DEFAULT 0;
    END IF;
END $$;

-- Step 8: Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment follower_count for followed user
        UPDATE public.users 
        SET follower_count = follower_count + 1 
        WHERE id = NEW.following_id;
        
        -- Increment following_count for follower
        UPDATE public.users 
        SET following_count = following_count + 1 
        WHERE id = NEW.follower_id;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement follower_count for followed user
        UPDATE public.users 
        SET follower_count = follower_count - 1 
        WHERE id = OLD.following_id;
        
        -- Decrement following_count for follower
        UPDATE public.users 
        SET following_count = following_count - 1 
        WHERE id = OLD.follower_id;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_follower_counts ON public.follows;

-- Step 10: Create trigger to automatically update follower counts
CREATE TRIGGER trigger_update_follower_counts
    AFTER INSERT OR DELETE ON public.follows
    FOR EACH ROW
    EXECUTE FUNCTION update_follower_counts();

-- Step 11: Initialize follower counts for existing users
UPDATE public.users 
SET follower_count = (
    SELECT COUNT(*) 
    FROM public.follows 
    WHERE following_id = users.id
),
following_count = (
    SELECT COUNT(*) 
    FROM public.follows 
    WHERE follower_id = users.id
);

-- Step 12: Success message
SELECT 'All RLS policies and follow system setup completed successfully!' as status; 