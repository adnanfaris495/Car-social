-- Fix User Profiles - Create missing user records and add trigger
-- Run this in your Supabase Dashboard SQL Editor

-- ========================================
-- 1. CREATE MISSING USER PROFILES
-- ========================================

-- Insert user profiles for auth users that don't have profiles yet
INSERT INTO public.users (id, username, full_name, avatar_url, bio, location, website, created_at, follower_count, following_count)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'username', SPLIT_PART(au.email, '@', 1), 'user') as username,
    au.raw_user_meta_data->>'full_name' as full_name,
    au.raw_user_meta_data->>'avatar_url' as avatar_url,
    NULL as bio,
    NULL as location,
    NULL as website,
    au.created_at,
    0 as follower_count,
    0 as following_count
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 2. CREATE TRIGGER FOR NEW USERS
-- ========================================

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (
        id,
        username,
        full_name,
        avatar_url,
        bio,
        location,
        website,
        created_at,
        follower_count,
        following_count
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1), 'user'),
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url',
        NULL,
        NULL,
        NULL,
        NEW.created_at,
        0,
        0
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- 3. VERIFY THE SETUP
-- ========================================

-- Show how many users were created
SELECT 
    'Users created: ' || COUNT(*) as status
FROM public.users;

-- Show sample user data
SELECT id, username, full_name, created_at, follower_count, following_count 
FROM public.users 
ORDER BY created_at DESC 
LIMIT 5;

-- Show trigger function
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- Show trigger
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Success message
SELECT 'User profiles setup completed successfully!' as status; 