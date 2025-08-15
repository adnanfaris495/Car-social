-- Fix Storage RLS Policies
-- This migration sets up proper Row Level Security policies for Supabase Storage buckets

-- Enable RLS on storage.objects table if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload car images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view car images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own car images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload post images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view post images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own post images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload listing images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view listing images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own listing images" ON storage.objects;

-- Create policies for cars bucket
CREATE POLICY "Allow authenticated users to upload car images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'cars' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Allow public to view car images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'cars'
  );

CREATE POLICY "Allow users to delete their own car images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'cars' AND 
    auth.role() = 'authenticated'
  );

-- Create policies for post-images bucket
CREATE POLICY "Allow authenticated users to upload post images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'post-images' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Allow public to view post images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'post-images'
  );

CREATE POLICY "Allow users to delete their own post images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'post-images' AND 
    auth.role() = 'authenticated'
  );

-- Create policies for listings bucket
CREATE POLICY "Allow authenticated users to upload listing images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'listings' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Allow public to view listing images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'listings'
  );

CREATE POLICY "Allow users to delete their own listing images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'listings' AND 
    auth.role() = 'authenticated'
  );

-- Success message
SELECT 'Storage RLS policies created successfully!' as status; 