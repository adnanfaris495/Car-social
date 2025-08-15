-- Check Table Structure
-- Run this in your Supabase Dashboard SQL Editor to see what tables exist and their columns

-- ========================================
-- 1. CHECK WHICH TABLES EXIST
-- ========================================

SELECT 'EXISTING TABLES:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('cars', 'users', 'follows', 'marketplace_listings', 'marketplace_favorites', 'marketplace_offers', 'meets', 'meet_participants', 'forum_posts', 'forum_comments')
ORDER BY table_name;

-- ========================================
-- 2. CHECK COLUMN STRUCTURE FOR EACH TABLE
-- ========================================

-- Check cars table
SELECT 'CARS TABLE COLUMNS:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'cars' 
ORDER BY ordinal_position;

-- Check marketplace_listings table
SELECT 'MARKETPLACE_LISTINGS TABLE COLUMNS:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'marketplace_listings' 
ORDER BY ordinal_position;

-- Check marketplace_favorites table
SELECT 'MARKETPLACE_FAVORITES TABLE COLUMNS:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'marketplace_favorites' 
ORDER BY ordinal_position;

-- Check marketplace_offers table
SELECT 'MARKETPLACE_OFFERS TABLE COLUMNS:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'marketplace_offers' 
ORDER BY ordinal_position;

-- Check meets table
SELECT 'MEETS TABLE COLUMNS:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'meets' 
ORDER BY ordinal_position;

-- Check meet_participants table
SELECT 'MEET_PARTICIPANTS TABLE COLUMNS:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'meet_participants' 
ORDER BY ordinal_position;

-- Check forum_posts table
SELECT 'FORUM_POSTS TABLE COLUMNS:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'forum_posts' 
ORDER BY ordinal_position;

-- Check forum_comments table
SELECT 'FORUM_COMMENTS TABLE COLUMNS:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'forum_comments' 
ORDER BY ordinal_position;

-- ========================================
-- 3. CHECK FOR TABLES THAT DON'T EXIST
-- ========================================

SELECT 'MISSING TABLES:' as info;
SELECT 'cars' as table_name WHERE NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cars')
UNION ALL
SELECT 'marketplace_listings' WHERE NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'marketplace_listings')
UNION ALL
SELECT 'marketplace_favorites' WHERE NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'marketplace_favorites')
UNION ALL
SELECT 'marketplace_offers' WHERE NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'marketplace_offers')
UNION ALL
SELECT 'meets' WHERE NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'meets')
UNION ALL
SELECT 'meet_participants' WHERE NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'meet_participants')
UNION ALL
SELECT 'forum_posts' WHERE NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'forum_posts')
UNION ALL
SELECT 'forum_comments' WHERE NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'forum_comments'); 