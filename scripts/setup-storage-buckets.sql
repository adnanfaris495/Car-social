-- Setup Storage Buckets with RLS Policies (Compatible with Existing Setup)
-- Run this in your Supabase Dashboard SQL Editor

-- ========================================
-- 1. CREATE STORAGE BUCKETS (Only if they don't exist)
-- ========================================

-- Create cars bucket (already exists in your setup)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cars',
  'cars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create post-images bucket (already exists in your setup)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-images',
  'post-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create listings bucket (already exists in your setup)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listings',
  'listings',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create profiles bucket (already exists in your setup)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profiles',
  'profiles',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 2. ENABLE RLS ON STORAGE.OBJECTS
-- ========================================

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 3. DROP EXISTING STORAGE POLICIES (Safe - only drops if they exist)
-- ========================================

DROP POLICY IF EXISTS "Public read access to storage" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload access to storage" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update access to storage" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete access to storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view car images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload car images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own car images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view marketplace images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload marketplace images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own marketplace images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view meet images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload meet images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own meet images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view avatar images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload avatar images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own avatar images" ON storage.objects;

-- ========================================
-- 4. CREATE COMPREHENSIVE STORAGE POLICIES
-- ========================================

-- General read access for all public buckets
CREATE POLICY "Public read access to storage" ON storage.objects
  FOR SELECT USING (
    bucket_id IN ('cars', 'post-images', 'listings', 'profiles')
  );

-- Upload access for authenticated users
CREATE POLICY "Authenticated upload access to storage" ON storage.objects
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    bucket_id IN ('cars', 'post-images', 'listings', 'profiles')
  );

-- Update access for authenticated users (for their own files)
CREATE POLICY "Authenticated update access to storage" ON storage.objects
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    bucket_id IN ('cars', 'post-images', 'listings', 'profiles')
  ) WITH CHECK (
    auth.role() = 'authenticated' AND
    bucket_id IN ('cars', 'post-images', 'listings', 'profiles')
  );

-- Delete access for authenticated users (for their own files)
CREATE POLICY "Authenticated delete access to storage" ON storage.objects
  FOR DELETE USING (
    auth.role() = 'authenticated' AND
    bucket_id IN ('cars', 'post-images', 'listings', 'profiles')
  );

-- ========================================
-- 5. CREATE BUCKET-SPECIFIC POLICIES (Compatible with existing buckets)
-- ========================================

-- Cars bucket policies
CREATE POLICY "Allow public to view car images" ON storage.objects
  FOR SELECT USING (bucket_id = 'cars');

CREATE POLICY "Allow authenticated users to upload car images" ON storage.objects
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND bucket_id = 'cars'
  );

CREATE POLICY "Allow users to delete their own car images" ON storage.objects
  FOR DELETE USING (
    auth.role() = 'authenticated' AND bucket_id = 'cars'
  );

-- Post-images bucket policies (for marketplace and meets)
CREATE POLICY "Allow public to view post images" ON storage.objects
  FOR SELECT USING (bucket_id = 'post-images');

CREATE POLICY "Allow authenticated users to upload post images" ON storage.objects
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND bucket_id = 'post-images'
  );

CREATE POLICY "Allow users to delete their own post images" ON storage.objects
  FOR DELETE USING (
    auth.role() = 'authenticated' AND bucket_id = 'post-images'
  );

-- Listings bucket policies
CREATE POLICY "Allow public to view listing images" ON storage.objects
  FOR SELECT USING (bucket_id = 'listings');

CREATE POLICY "Allow authenticated users to upload listing images" ON storage.objects
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND bucket_id = 'listings'
  );

CREATE POLICY "Allow users to delete their own listing images" ON storage.objects
  FOR DELETE USING (
    auth.role() = 'authenticated' AND bucket_id = 'listings'
  );

-- Profiles bucket policies
CREATE POLICY "Allow public to view profile images" ON storage.objects
  FOR SELECT USING (bucket_id = 'profiles');

CREATE POLICY "Allow authenticated users to upload profile images" ON storage.objects
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND bucket_id = 'profiles'
  );

CREATE POLICY "Allow users to delete their own profile images" ON storage.objects
  FOR DELETE USING (
    auth.role() = 'authenticated' AND bucket_id = 'profiles'
  );

-- ========================================
-- 6. VERIFY SETUP
-- ========================================

-- Check that buckets exist
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id IN ('cars', 'post-images', 'listings', 'profiles')
ORDER BY id;

-- Check that RLS is enabled on storage.objects
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- Check that policies exist
SELECT 
    schemaname,
    tablename,
    policyname
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;

-- Success message
SELECT 'Storage buckets setup completed successfully!' as status; 