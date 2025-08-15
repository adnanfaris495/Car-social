-- Comprehensive Database Fix Script (Compatible with Existing Setup)
-- Run this in your Supabase Dashboard SQL Editor

-- ========================================
-- 1. DROP ALL PROBLEMATIC TRIGGERS AND FUNCTIONS
-- ========================================

-- Drop all triggers that use handle_updated_at function (including existing ones)
DROP TRIGGER IF EXISTS handle_cars_updated_at ON public.cars;
DROP TRIGGER IF EXISTS handle_modifications_updated_at ON public.modifications;
DROP TRIGGER IF EXISTS handle_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS handle_meets_updated_at ON public.meets;
DROP TRIGGER IF EXISTS handle_meet_attendees_updated_at ON public.meet_attendees;
DROP TRIGGER IF EXISTS handle_meet_comments_updated_at ON public.meet_comments;
DROP TRIGGER IF EXISTS set_updated_at ON public.follows;
DROP TRIGGER IF EXISTS trigger_update_follower_counts ON public.follows;

-- Drop existing triggers that depend on handle_updated_at function
DROP TRIGGER IF EXISTS handle_follows_updated_at ON public.follows;
DROP TRIGGER IF EXISTS handle_forum_posts_updated_at ON public.forum_posts;
DROP TRIGGER IF EXISTS handle_marketplace_listings_updated_at ON public.marketplace_listings;
DROP TRIGGER IF EXISTS handle_marketplace_offers_updated_at ON public.marketplace_offers;

-- Drop problematic functions
DROP FUNCTION IF EXISTS handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_follower_counts();

-- ========================================
-- 2. CREATE SAFE UPDATED_AT FUNCTION
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 3. ENSURE ALL TABLES HAVE CORRECT STRUCTURE
-- ========================================

-- Add updated_at column to follows table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'follows' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.follows ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
END $$;

-- Add follower_count and following_count columns to users table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'follower_count'
    ) THEN
        ALTER TABLE public.users ADD COLUMN follower_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'following_count'
    ) THEN
        ALTER TABLE public.users ADD COLUMN following_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Fix marketplace_listings image_urls column (compatible with existing setup)
DO $$
BEGIN
    -- Check if image_url column exists and rename it to image_urls
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'marketplace_listings' 
        AND column_name = 'image_url'
    ) THEN
        ALTER TABLE public.marketplace_listings RENAME COLUMN image_url TO image_urls;
        ALTER TABLE public.marketplace_listings ALTER COLUMN image_urls TYPE TEXT[] USING ARRAY[image_urls];
    END IF;
    
    -- Ensure image_urls column exists and is TEXT[]
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'marketplace_listings' 
        AND column_name = 'image_urls'
    ) THEN
        ALTER TABLE public.marketplace_listings ADD COLUMN image_urls TEXT[] DEFAULT '{}';
    ELSE
        ALTER TABLE public.marketplace_listings ALTER COLUMN image_urls TYPE TEXT[];
    END IF;
END $$;

-- ========================================
-- 4. ENABLE RLS ON ALL TABLES
-- ========================================

ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meet_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 5. CREATE COMPREHENSIVE RLS POLICIES
-- ========================================

-- Cars table policies (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cars') THEN
        DROP POLICY IF EXISTS "Users can view all cars" ON public.cars;
        DROP POLICY IF EXISTS "Users can insert their own cars" ON public.cars;
        DROP POLICY IF EXISTS "Users can update their own cars" ON public.cars;
        DROP POLICY IF EXISTS "Users can delete their own cars" ON public.cars;

        CREATE POLICY "Users can view all cars" ON public.cars
          FOR SELECT USING (true);

        CREATE POLICY "Users can insert their own cars" ON public.cars
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update their own cars" ON public.cars
          FOR UPDATE USING (auth.uid() = user_id);

        CREATE POLICY "Users can delete their own cars" ON public.cars
          FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Users table policies (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
        DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

        CREATE POLICY "Users can view all profiles" ON public.users
          FOR SELECT USING (true);

        CREATE POLICY "Users can update their own profile" ON public.users
          FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;

-- Follows table policies (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'follows') THEN
        DROP POLICY IF EXISTS "Users can view follows" ON public.follows;
        DROP POLICY IF EXISTS "Users can insert their own follows" ON public.follows;
        DROP POLICY IF EXISTS "Users can delete their own follows" ON public.follows;

        CREATE POLICY "Users can view follows" ON public.follows
          FOR SELECT USING (true);

        CREATE POLICY "Users can insert their own follows" ON public.follows
          FOR INSERT WITH CHECK (auth.uid() = follower_id AND follower_id != followed_id);

        CREATE POLICY "Users can delete their own follows" ON public.follows
          FOR DELETE USING (auth.uid() = follower_id);
    END IF;
END $$;

-- Marketplace listings policies (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'marketplace_listings') THEN
        DROP POLICY IF EXISTS "Anyone can view listings" ON public.marketplace_listings;
        DROP POLICY IF EXISTS "Authenticated users can create listings" ON public.marketplace_listings;
        DROP POLICY IF EXISTS "Users can update their own listings" ON public.marketplace_listings;
        DROP POLICY IF EXISTS "Users can delete their own listings" ON public.marketplace_listings;

        CREATE POLICY "Anyone can view listings" ON public.marketplace_listings
          FOR SELECT USING (true);

        CREATE POLICY "Authenticated users can create listings" ON public.marketplace_listings
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update their own listings" ON public.marketplace_listings
          FOR UPDATE USING (auth.uid() = user_id);

        CREATE POLICY "Users can delete their own listings" ON public.marketplace_listings
          FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Marketplace favorites policies (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'marketplace_favorites') THEN
        DROP POLICY IF EXISTS "Users can view their own favorites" ON public.marketplace_favorites;
        DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.marketplace_favorites;
        DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.marketplace_favorites;

        CREATE POLICY "Users can view their own favorites" ON public.marketplace_favorites
          FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Users can insert their own favorites" ON public.marketplace_favorites
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can delete their own favorites" ON public.marketplace_favorites
          FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Marketplace offers policies (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'marketplace_offers') THEN
        DROP POLICY IF EXISTS "Users can view offers they're involved in" ON public.marketplace_offers;
        DROP POLICY IF EXISTS "Users can insert offers" ON public.marketplace_offers;
        DROP POLICY IF EXISTS "Users can update offers they're involved in" ON public.marketplace_offers;

        CREATE POLICY "Users can view offers they're involved in" ON public.marketplace_offers
          FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

        CREATE POLICY "Users can insert offers" ON public.marketplace_offers
          FOR INSERT WITH CHECK (auth.uid() = buyer_id);

        CREATE POLICY "Users can update offers they're involved in" ON public.marketplace_offers
          FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
    END IF;
END $$;

-- Meets table policies (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'meets') THEN
        DROP POLICY IF EXISTS "Anyone can view meets" ON public.meets;
        DROP POLICY IF EXISTS "Users can insert their own meets" ON public.meets;
        DROP POLICY IF EXISTS "Users can update their own meets" ON public.meets;
        DROP POLICY IF EXISTS "Users can delete their own meets" ON public.meets;

        CREATE POLICY "Anyone can view meets" ON public.meets
          FOR SELECT USING (true);

        CREATE POLICY "Users can insert their own meets" ON public.meets
          FOR INSERT WITH CHECK (auth.uid() = organizer_id);

        CREATE POLICY "Users can update their own meets" ON public.meets
          FOR UPDATE USING (auth.uid() = organizer_id);

        CREATE POLICY "Users can delete their own meets" ON public.meets
          FOR DELETE USING (auth.uid() = organizer_id);
    END IF;
END $$;

-- Meet participants policies (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'meet_participants') THEN
        DROP POLICY IF EXISTS "Users can view participants for meets they're in" ON public.meet_participants;
        DROP POLICY IF EXISTS "Users can insert themselves as participants" ON public.meet_participants;
        DROP POLICY IF EXISTS "Users can update their own participation" ON public.meet_participants;
        DROP POLICY IF EXISTS "Users can delete their own participation" ON public.meet_participants;

        CREATE POLICY "Users can view participants for meets they're in" ON public.meet_participants
          FOR SELECT USING (
            auth.uid() = user_id OR 
            EXISTS (
              SELECT 1 FROM public.meets 
              WHERE meets.id = meet_participants.meet_id 
              AND meets.user_id = auth.uid()
            )
          );

        CREATE POLICY "Users can insert themselves as participants" ON public.meet_participants
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update their own participation" ON public.meet_participants
          FOR UPDATE USING (auth.uid() = user_id);

        CREATE POLICY "Users can delete their own participation" ON public.meet_participants
          FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Forum posts policies (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'forum_posts') THEN
        DROP POLICY IF EXISTS "Anyone can view forum posts" ON public.forum_posts;
        DROP POLICY IF EXISTS "Users can insert their own posts" ON public.forum_posts;
        DROP POLICY IF EXISTS "Users can update their own posts" ON public.forum_posts;
        DROP POLICY IF EXISTS "Users can delete their own posts" ON public.forum_posts;

        CREATE POLICY "Anyone can view forum posts" ON public.forum_posts
          FOR SELECT USING (true);

        CREATE POLICY "Users can insert their own posts" ON public.forum_posts
          FOR INSERT WITH CHECK (auth.uid() = author_id);

        CREATE POLICY "Users can update their own posts" ON public.forum_posts
          FOR UPDATE USING (auth.uid() = author_id);

        CREATE POLICY "Users can delete their own posts" ON public.forum_posts
          FOR DELETE USING (auth.uid() = author_id);
    END IF;
END $$;

-- Forum comments policies (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'forum_comments') THEN
        DROP POLICY IF EXISTS "Anyone can view forum comments" ON public.forum_comments;
        DROP POLICY IF EXISTS "Users can insert their own comments" ON public.forum_comments;
        DROP POLICY IF EXISTS "Users can update their own comments" ON public.forum_comments;
        DROP POLICY IF EXISTS "Users can delete their own comments" ON public.forum_comments;

        CREATE POLICY "Anyone can view forum comments" ON public.forum_comments
          FOR SELECT USING (true);

        CREATE POLICY "Users can insert their own comments" ON public.forum_comments
          FOR INSERT WITH CHECK (auth.uid() = author_id);

        CREATE POLICY "Users can update their own comments" ON public.forum_comments
          FOR UPDATE USING (auth.uid() = author_id);

        CREATE POLICY "Users can delete their own comments" ON public.forum_comments
          FOR DELETE USING (auth.uid() = author_id);
    END IF;
END $$;

-- ========================================
-- 6. CREATE TRIGGERS FOR UPDATED_AT
-- ========================================

-- Create triggers for tables that have updated_at column
DO $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I;
            CREATE TRIGGER update_%I_updated_at
                BEFORE UPDATE ON public.%I
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        ', table_record.table_name, table_record.table_name, 
           table_record.table_name, table_record.table_name);
    END LOOP;
END $$;

-- ========================================
-- 7. CREATE FOLLOW SYSTEM TRIGGER
-- ========================================

CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment follower count for followed user
        UPDATE public.users 
        SET follower_count = follower_count + 1 
        WHERE id = NEW.followed_id;
        
        -- Increment following count for follower
        UPDATE public.users 
        SET following_count = following_count + 1 
        WHERE id = NEW.follower_id;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement follower count for followed user
        UPDATE public.users 
        SET follower_count = follower_count - 1 
        WHERE id = OLD.followed_id;
        
        -- Decrement following count for follower
        UPDATE public.users 
        SET following_count = following_count - 1 
        WHERE id = OLD.follower_id;
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for follows table
DROP TRIGGER IF EXISTS trigger_update_follower_counts ON public.follows;
CREATE TRIGGER trigger_update_follower_counts
    AFTER INSERT OR DELETE ON public.follows
    FOR EACH ROW
    EXECUTE FUNCTION update_follower_counts();

-- ========================================
-- 8. VERIFY FIXES
-- ========================================

-- Check that all tables have RLS enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('cars', 'users', 'follows', 'marketplace_listings', 'meets', 'forum_posts')
ORDER BY tablename;

-- Check that policies exist
SELECT 
    schemaname,
    tablename,
    policyname
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Success message
SELECT 'Database fixes completed successfully!' as status; 