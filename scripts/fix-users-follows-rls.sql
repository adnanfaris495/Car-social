-- Fix Users and Follows RLS Policies
-- Run this in your Supabase Dashboard SQL Editor

-- ========================================
-- 1. FIX USERS TABLE RLS POLICIES
-- ========================================

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Public read access" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- Create comprehensive RLS policies for users table

-- Allow users to read all user profiles (for search functionality)
CREATE POLICY "Public read access" ON users
FOR SELECT USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON users
FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON users
FOR UPDATE USING (auth.uid() = id);

-- Allow users to delete their own profile
CREATE POLICY "Users can delete own profile" ON users
FOR DELETE USING (auth.uid() = id);

-- ========================================
-- 2. FIX FOLLOWS TABLE RLS POLICIES
-- ========================================

-- Enable RLS on follows table
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view follows" ON follows;
DROP POLICY IF EXISTS "Users can insert follows" ON follows;
DROP POLICY IF EXISTS "Users can delete follows" ON follows;
DROP POLICY IF EXISTS "Public read access" ON follows;
DROP POLICY IF EXISTS "Users can manage their follows" ON follows;

-- Create comprehensive RLS policies for follows table

-- Allow users to read all follows (for follower counts)
CREATE POLICY "Public read access" ON follows
FOR SELECT USING (true);

-- Allow users to insert their own follows
CREATE POLICY "Users can insert follows" ON follows
FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- Allow users to delete their own follows
CREATE POLICY "Users can delete follows" ON follows
FOR DELETE USING (auth.uid() = follower_id);

-- ========================================
-- 3. VERIFY POLICIES
-- ========================================

-- Check users table policies
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
WHERE tablename = 'users'
ORDER BY policyname;

-- Check follows table policies
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
WHERE tablename = 'follows'
ORDER BY policyname; 