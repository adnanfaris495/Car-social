-- Comprehensive Fix for All Database and Storage Issues
-- Run this in your Supabase Dashboard SQL Editor

-- ========================================
-- 1. FIX STORAGE RLS POLICIES
-- ========================================

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop all existing storage policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload car images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view car images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own car images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload post images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view post images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own post images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload listing images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view listing images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own listing images" ON storage.objects;

-- Create comprehensive storage policies
CREATE POLICY "Public read access to storage" ON storage.objects
  FOR SELECT USING (true);

CREATE POLICY "Authenticated upload access to storage" ON storage.objects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated update access to storage" ON storage.objects
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete access to storage" ON storage.objects
  FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- 2. FIX USERS TABLE RLS POLICIES
-- ========================================

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.users;

-- Create new policies
CREATE POLICY "Users can view all users" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" ON public.users
  FOR DELETE USING (auth.uid() = id);

-- ========================================
-- 3. FIX CARS TABLE RLS POLICIES
-- ========================================

-- Enable RLS on cars table
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all cars" ON public.cars;
DROP POLICY IF EXISTS "Users can insert their own cars" ON public.cars;
DROP POLICY IF EXISTS "Users can update their own cars" ON public.cars;
DROP POLICY IF EXISTS "Users can delete their own cars" ON public.cars;

-- Create new policies
CREATE POLICY "Users can view all cars" ON public.cars
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own cars" ON public.cars
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cars" ON public.cars
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cars" ON public.cars
  FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- 4. FIX MARKETPLACE_LISTINGS TABLE RLS POLICIES
-- ========================================

-- Enable RLS on marketplace_listings table
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view listings" ON public.marketplace_listings;
DROP POLICY IF EXISTS "Authenticated users can create listings" ON public.marketplace_listings;
DROP POLICY IF EXISTS "Users can update their own listings" ON public.marketplace_listings;
DROP POLICY IF EXISTS "Users can delete their own listings" ON public.marketplace_listings;

-- Create new policies
CREATE POLICY "Anyone can view listings" ON public.marketplace_listings
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create listings" ON public.marketplace_listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings" ON public.marketplace_listings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings" ON public.marketplace_listings
  FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- 5. FIX FORUM TABLES RLS POLICIES
-- ========================================

-- Enable RLS on forum tables
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all forum posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Authenticated users can create forum posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Users can update their own forum posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Users can delete their own forum posts" ON public.forum_posts;

DROP POLICY IF EXISTS "Users can view all forum comments" ON public.forum_comments;
DROP POLICY IF EXISTS "Authenticated users can create forum comments" ON public.forum_comments;
DROP POLICY IF EXISTS "Users can update their own forum comments" ON public.forum_comments;
DROP POLICY IF EXISTS "Users can delete their own forum comments" ON public.forum_comments;

-- Create new policies for forum_posts
CREATE POLICY "Users can view all forum posts" ON public.forum_posts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create forum posts" ON public.forum_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own forum posts" ON public.forum_posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own forum posts" ON public.forum_posts
  FOR DELETE USING (auth.uid() = author_id);

-- Create new policies for forum_comments
CREATE POLICY "Users can view all forum comments" ON public.forum_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create forum comments" ON public.forum_comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own forum comments" ON public.forum_comments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own forum comments" ON public.forum_comments
  FOR DELETE USING (auth.uid() = author_id);

-- ========================================
-- 6. FIX FOLLOWS TABLE RLS POLICIES
-- ========================================

-- Enable RLS on follows table
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all follows" ON public.follows;
DROP POLICY IF EXISTS "Users can create follows" ON public.follows;
DROP POLICY IF EXISTS "Users can delete their own follows" ON public.follows;

-- Create new policies
CREATE POLICY "Users can view all follows" ON public.follows
  FOR SELECT USING (true);

CREATE POLICY "Users can create follows" ON public.follows
  FOR INSERT WITH CHECK (
    auth.uid() = follower_id AND 
    follower_id != followed_id
  );

CREATE POLICY "Users can delete their own follows" ON public.follows
  FOR DELETE USING (auth.uid() = follower_id);

-- ========================================
-- 7. VERIFY THE FIXES
-- ========================================

-- Check storage policies
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
WHERE tablename = 'objects' 
AND schemaname = 'storage';

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
WHERE tablename = 'users';

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

-- Success message
SELECT 'All RLS policies have been fixed successfully!' as status; 