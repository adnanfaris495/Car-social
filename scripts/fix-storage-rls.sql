-- Fix Storage RLS Policies
-- Run this in your Supabase Dashboard SQL Editor

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop all existing storage policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload car images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload listing images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload meet images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload profile images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to car images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to listing images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to meet images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to profile images" ON storage.objects;

-- Create comprehensive storage policies
-- Allow authenticated users to upload files to any bucket
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow public read access to all files
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT USING (true);

-- Allow users to update their own files
CREATE POLICY "Allow users to update own files" ON storage.objects
FOR UPDATE USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own files
CREATE POLICY "Allow users to delete own files" ON storage.objects
FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('cars', 'cars', true),
  ('post-images', 'post-images', true),
  ('listings', 'listings', true),
  ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- Verify the policies were created
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
WHERE tablename = 'objects' AND schemaname = 'storage';

-- Verify buckets exist
SELECT id, name, public, created_at FROM storage.buckets; 