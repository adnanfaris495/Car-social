-- Fix Marketplace Listings Relationship with Users
-- Run this in your Supabase Dashboard SQL Editor

-- First, let's check if the foreign key constraint exists
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name='marketplace_listings';

-- Add foreign key constraint if it doesn't exist
ALTER TABLE public.marketplace_listings 
ADD CONSTRAINT marketplace_listings_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Verify the relationship is working
SELECT 
    ml.id,
    ml.title,
    ml.user_id,
    u.username,
    u.avatar_url
FROM public.marketplace_listings ml
LEFT JOIN public.users u ON ml.user_id = u.id
LIMIT 5; 