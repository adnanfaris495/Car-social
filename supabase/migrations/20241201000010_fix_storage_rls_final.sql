-- Fix Storage RLS Policies - Complete Reset
-- This migration completely resets and recreates all storage RLS policies

-- Step 1: Drop all existing storage policies
DROP POLICY IF EXISTS "Allow authenticated users to upload car images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view car images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own car images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload post images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view post images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own post images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload profile images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view profile images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own profile images" ON storage.objects;

-- Step 2: Enable RLS on storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 3: Create comprehensive policies for all storage buckets

-- Car Images Bucket Policies
CREATE POLICY "Allow authenticated users to upload car images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'cars' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Allow public to view car images" ON storage.objects
  FOR SELECT USING (bucket_id = 'cars');

CREATE POLICY "Allow users to delete their own car images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'cars' AND 
    auth.role() = 'authenticated'
  );

-- Post Images Bucket Policies
CREATE POLICY "Allow authenticated users to upload post images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'post-images' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Allow public to view post images" ON storage.objects
  FOR SELECT USING (bucket_id = 'post-images');

CREATE POLICY "Allow users to delete their own post images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'post-images' AND 
    auth.role() = 'authenticated'
  );

-- Profile Images Bucket Policies
CREATE POLICY "Allow authenticated users to upload profile images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profiles' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Allow public to view profile images" ON storage.objects
  FOR SELECT USING (bucket_id = 'profiles');

CREATE POLICY "Allow users to delete their own profile images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profiles' AND 
    auth.role() = 'authenticated'
  );

-- Step 4: Success message
SELECT 'Storage RLS policies fixed successfully!' as status; 