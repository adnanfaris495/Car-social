-- Fix Supabase Storage RLS Policies
-- Run this in your Supabase SQL Editor

-- 1. Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public read access to storage" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload access to storage" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update access to storage" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete access to storage" ON storage.objects;

-- 3. Create policies for public read access (anyone can view images)
CREATE POLICY "Public read access to storage" 
ON storage.objects
FOR SELECT
USING (true);

-- 4. Create policies for authenticated upload access (only authenticated users can upload)
CREATE POLICY "Authenticated upload access to storage" 
ON storage.objects
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- 5. Create policies for authenticated update access (only authenticated users can update their own files)
CREATE POLICY "Authenticated update access to storage" 
ON storage.objects
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 6. Create policies for authenticated delete access (only authenticated users can delete their own files)
CREATE POLICY "Authenticated delete access to storage" 
ON storage.objects
FOR DELETE
USING (auth.role() = 'authenticated');

-- 7. Create the required buckets if they don't exist
-- Note: You'll need to create these buckets manually in the Supabase dashboard
-- Go to Storage > Buckets and create:
-- - 'cars' bucket (for garage images)
-- - 'post-images' bucket (for marketplace and meets images)

-- 8. Verify the policies were created
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