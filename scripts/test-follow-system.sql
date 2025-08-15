-- Test Follow System
-- Run this in your Supabase Dashboard SQL Editor

-- ========================================
-- 1. GET TEST USERS
-- ========================================

-- Get first two users for testing
SELECT id, username, follower_count, following_count 
FROM public.users 
ORDER BY created_at 
LIMIT 2;

-- ========================================
-- 2. TEST FOLLOW FUNCTIONALITY
-- ========================================

-- Get user IDs for testing
DO $$
DECLARE
    user1_id uuid;
    user2_id uuid;
BEGIN
    -- Get first two users
    SELECT id INTO user1_id FROM public.users ORDER BY created_at LIMIT 1;
    SELECT id INTO user2_id FROM public.users WHERE id != user1_id ORDER BY created_at LIMIT 1;
    
    IF user1_id IS NOT NULL AND user2_id IS NOT NULL THEN
        RAISE NOTICE 'Testing with users: % and %', user1_id, user2_id;
        
        -- Show initial counts
        RAISE NOTICE 'Initial counts - User 1: % followers, % following', 
            (SELECT follower_count FROM public.users WHERE id = user1_id),
            (SELECT following_count FROM public.users WHERE id = user1_id);
            
        RAISE NOTICE 'Initial counts - User 2: % followers, % following', 
            (SELECT follower_count FROM public.users WHERE id = user2_id),
            (SELECT following_count FROM public.users WHERE id = user2_id);
        
        -- Create follow relationship
        INSERT INTO public.follows (follower_id, followed_id) 
        VALUES (user1_id, user2_id)
        ON CONFLICT (follower_id, followed_id) DO NOTHING;
        
        -- Show updated counts
        RAISE NOTICE 'After follow - User 1: % followers, % following', 
            (SELECT follower_count FROM public.users WHERE id = user1_id),
            (SELECT following_count FROM public.users WHERE id = user1_id);
            
        RAISE NOTICE 'After follow - User 2: % followers, % following', 
            (SELECT follower_count FROM public.users WHERE id = user2_id),
            (SELECT following_count FROM public.users WHERE id = user2_id);
        
        -- Remove follow relationship
        DELETE FROM public.follows WHERE follower_id = user1_id AND followed_id = user2_id;
        
        -- Show final counts
        RAISE NOTICE 'After unfollow - User 1: % followers, % following', 
            (SELECT follower_count FROM public.users WHERE id = user1_id),
            (SELECT following_count FROM public.users WHERE id = user1_id);
            
        RAISE NOTICE 'After unfollow - User 2: % followers, % following', 
            (SELECT follower_count FROM public.users WHERE id = user2_id),
            (SELECT following_count FROM public.users WHERE id = user2_id);
        
        RAISE NOTICE 'Test completed successfully!';
    ELSE
        RAISE NOTICE 'Not enough users for testing';
    END IF;
END $$;

-- ========================================
-- 3. SHOW CURRENT STATE
-- ========================================

-- Show all users with their counts
SELECT id, username, follower_count, following_count 
FROM public.users 
ORDER BY follower_count DESC, following_count DESC;

-- Show all follow relationships
SELECT 
    f.follower_id,
    u1.username as follower_username,
    f.followed_id,
    u2.username as followed_username,
    f.created_at
FROM public.follows f
JOIN public.users u1 ON f.follower_id = u1.id
JOIN public.users u2 ON f.followed_id = u2.id
ORDER BY f.created_at DESC; 