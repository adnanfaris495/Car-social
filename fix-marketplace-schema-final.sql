-- Fix marketplace_listings schema mismatch
-- Run this in your Supabase Dashboard SQL Editor

-- ========================================
-- 1. CHECK CURRENT SCHEMA
-- ========================================

-- Check what columns exist in marketplace_listings
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'marketplace_listings' 
AND column_name IN ('image_url', 'image_urls')
ORDER BY ordinal_position;

-- ========================================
-- 2. FIX SCHEMA MISMATCH
-- ========================================

-- If image_url exists, rename it to image_urls and convert to TEXT[]
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
        RAISE NOTICE 'Renamed image_url to image_urls';
        
        -- Convert to TEXT[] array type
        ALTER TABLE public.marketplace_listings ALTER COLUMN image_urls TYPE TEXT[] USING ARRAY[image_urls];
        RAISE NOTICE 'Converted image_urls to TEXT[] type';
    ELSE
        RAISE NOTICE 'image_url column does not exist';
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
-- 3. VERIFY THE FIX
-- ========================================

-- Check the final schema
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'marketplace_listings' 
AND column_name = 'image_urls';

-- ========================================
-- 4. FIX RLS POLICIES IF NEEDED
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
-- 5. TEST THE FIX
-- ========================================

-- Test inserting a listing with image_urls
DO $$
BEGIN
    -- Try to insert a test listing
    INSERT INTO public.marketplace_listings (
        user_id,
        title,
        description,
        price,
        condition,
        location,
        image_urls,
        compatible_makes,
        compatible_models,
        compatible_years,
        is_trade_available,
        is_sold
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', -- Test user ID
        'Test Listing',
        'Test description',
        100.00,
        'New',
        'Test Location',
        ARRAY['test1.jpg', 'test2.jpg'],
        ARRAY['BMW'],
        ARRAY['M3'],
        ARRAY[2020],
        false,
        false
    );
    
    RAISE NOTICE '✅ Test insert successful - schema is working!';
    
    -- Clean up the test data
    DELETE FROM public.marketplace_listings WHERE title = 'Test Listing';
    RAISE NOTICE 'Cleaned up test data';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Test insert failed: %', SQLERRM;
END $$; 