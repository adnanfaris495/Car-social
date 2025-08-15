-- Check foreign key relationships for marketplace_listings
SELECT 
  'FOREIGN KEY CHECK:' as info,
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'marketplace_listings';

-- Check if marketplace_listings table exists and has user_id column
SELECT 
  'TABLE STRUCTURE:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'marketplace_listings'
ORDER BY ordinal_position;

-- Check if users table exists and has id column
SELECT 
  'USERS TABLE STRUCTURE:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Check if there are any marketplace_listings records
SELECT 
  'MARKETPLACE_LISTINGS COUNT:' as info,
  COUNT(*) as total_listings
FROM marketplace_listings;

-- Check if there are any users records
SELECT 
  'USERS COUNT:' as info,
  COUNT(*) as total_users
FROM users;

-- Check sample marketplace_listings with user_id
SELECT 
  'SAMPLE LISTINGS:' as info,
  id,
  user_id,
  title,
  created_at
FROM marketplace_listings
LIMIT 5; 