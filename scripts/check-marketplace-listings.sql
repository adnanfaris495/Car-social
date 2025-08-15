-- Check marketplace listings
SELECT 
  'MARKETPLACE_LISTINGS COUNT:' as info,
  COUNT(*) as total_listings
FROM marketplace_listings;

-- Check if there are any users
SELECT 
  'USERS COUNT:' as info,
  COUNT(*) as total_users
FROM users;

-- Check sample listings with user info
SELECT 
  'SAMPLE LISTINGS:' as info,
  ml.id,
  ml.title,
  ml.price,
  ml.user_id,
  u.username
FROM marketplace_listings ml
LEFT JOIN users u ON ml.user_id = u.id
LIMIT 5;

-- Check if RLS is enabled
SELECT 
  'RLS STATUS:' as info,
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'marketplace_listings';

-- Check RLS policies
SELECT 
  'RLS POLICIES:' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'marketplace_listings'; 