-- Fix all database RLS and schema issues
-- Run this in your Supabase Dashboard SQL Editor

-- ========================================
-- 1. FIX CARS TABLE RLS POLICIES
-- ========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all cars" ON public.cars;
DROP POLICY IF EXISTS "Users can insert their own cars" ON public.cars;
DROP POLICY IF EXISTS "Users can update their own cars" ON public.cars;
DROP POLICY IF EXISTS "Users can delete their own cars" ON public.cars;

-- Enable RLS on cars table
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;

-- Create new policies for cars table
CREATE POLICY "Users can view all cars" ON public.cars
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own cars" ON public.cars
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cars" ON public.cars
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cars" ON public.cars
  FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- 2. FIX MARKETPLACE_LISTINGS TABLE SCHEMA
-- ========================================

-- First, check if image_url column exists and rename it to image_urls
DO $$
BEGIN
    -- Check if image_url column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'marketplace_listings' 
        AND column_name = 'image_url'
    ) THEN
        -- Rename image_url to image_urls
        ALTER TABLE public.marketplace_listings RENAME COLUMN image_url TO image_urls;
        
        -- Convert to TEXT[] array type
        ALTER TABLE public.marketplace_listings ALTER COLUMN image_urls TYPE TEXT[] USING ARRAY[image_urls];
        
        RAISE NOTICE 'Renamed image_url to image_urls and converted to TEXT[]';
    ELSE
        RAISE NOTICE 'image_url column does not exist, checking for image_urls';
    END IF;
    
    -- Check if image_urls column exists and is TEXT[]
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'marketplace_listings' 
        AND column_name = 'image_urls'
    ) THEN
        -- Ensure it's TEXT[] type
        ALTER TABLE public.marketplace_listings ALTER COLUMN image_urls TYPE TEXT[];
        RAISE NOTICE 'Ensured image_urls is TEXT[] type';
    ELSE
        -- Create image_urls column if it doesn't exist
        ALTER TABLE public.marketplace_listings ADD COLUMN image_urls TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Created image_urls column as TEXT[]';
    END IF;
END $$;

-- ========================================
-- 3. FIX MARKETPLACE_LISTINGS RLS POLICIES
-- ========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view listings" ON public.marketplace_listings;
DROP POLICY IF EXISTS "Authenticated users can create listings" ON public.marketplace_listings;
DROP POLICY IF EXISTS "Users can update their own listings" ON public.marketplace_listings;
DROP POLICY IF EXISTS "Users can delete their own listings" ON public.marketplace_listings;

-- Enable RLS on marketplace_listings table
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

-- Create new policies for marketplace_listings table
CREATE POLICY "Anyone can view listings" ON public.marketplace_listings
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create listings" ON public.marketplace_listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings" ON public.marketplace_listings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings" ON public.marketplace_listings
  FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- 4. CREATE MISSING TABLES IF THEY DON'T EXIST
-- ========================================

-- Create marketplace_favorites table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.marketplace_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  UNIQUE(user_id, listing_id)
);

-- Create marketplace_ratings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.marketplace_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rater_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rated_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create marketplace_offers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.marketplace_offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- ========================================
-- 5. VERIFY THE FIXES
-- ========================================

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
WHERE tablename = 'cars';

-- Check marketplace_listings table policies
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
WHERE tablename = 'marketplace_listings';

-- Check marketplace_listings table schema
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'marketplace_listings' 
ORDER BY ordinal_position;

-- Success message
SELECT 'Database fixes completed successfully!' as status;

-- ========================================
-- 1. DROP PROBLEMATIC TRIGGERS FIRST
-- ========================================

-- Drop any existing triggers that might cause issues
DROP TRIGGER IF EXISTS trigger_update_follower_counts ON public.follows;
DROP TRIGGER IF EXISTS handle_updated_at ON public.follows;
DROP TRIGGER IF EXISTS handle_updated_at ON public.users;

-- ========================================
-- 2. DROP PROBLEMATIC FUNCTIONS
-- ========================================

DROP FUNCTION IF EXISTS handle_updated_at();
DROP FUNCTION IF EXISTS update_follower_counts();

-- ========================================
-- 3. ENSURE FOLLOWS TABLE HAS CORRECT STRUCTURE
-- ========================================

-- Add updated_at column to follows table if it doesn't exist
ALTER TABLE public.follows 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- ========================================
-- 4. CREATE THE UPDATED_AT TRIGGER FUNCTION
-- ========================================

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 5. CREATE THE FOLLOW COUNTS TRIGGER FUNCTION
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
-- 6. CREATE TRIGGERS
-- ========================================

-- Create trigger for updated_at on follows table
CREATE TRIGGER trigger_handle_updated_at_follows
    BEFORE UPDATE ON public.follows
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Create trigger for follower counts
CREATE TRIGGER trigger_update_follower_counts
    AFTER INSERT OR DELETE ON public.follows
    FOR EACH ROW
    EXECUTE FUNCTION update_follower_counts();

-- ========================================
-- 7. ENSURE USERS TABLE HAS THE REQUIRED COLUMNS
-- ========================================

-- Add follower_count column if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0;

-- Add following_count column if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- ========================================
-- 8. UPDATE EXISTING COUNTS
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
-- 9. VERIFY THE SETUP
-- ========================================

-- Check if the functions exist
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name IN ('update_follower_counts', 'handle_updated_at')
ORDER BY routine_name;

-- Check if the triggers exist
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers 
WHERE trigger_name IN ('trigger_update_follower_counts', 'trigger_handle_updated_at_follows')
ORDER BY trigger_name;

-- Show sample user data
SELECT id, username, follower_count, following_count 
FROM public.users 
LIMIT 5;

-- Show follows table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'follows' 
ORDER BY ordinal_position;

SELECT 'All database issues fixed!' as status; 