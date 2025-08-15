-- Add missing tables that might not exist
CREATE TABLE IF NOT EXISTS public.marketplace_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  UNIQUE(user_id, listing_id)
);

CREATE TABLE IF NOT EXISTS public.marketplace_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rater_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rated_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.marketplace_offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.meet_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meet_id UUID NOT NULL REFERENCES public.meets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'maybe', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  UNIQUE(meet_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.forums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.forum_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  forum_id UUID NOT NULL REFERENCES public.forums(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.forum_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.forum_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Add missing indexes
CREATE INDEX IF NOT EXISTS marketplace_favorites_user_id_idx ON public.marketplace_favorites(user_id);
CREATE INDEX IF NOT EXISTS marketplace_favorites_listing_id_idx ON public.marketplace_favorites(listing_id);
CREATE INDEX IF NOT EXISTS marketplace_ratings_rated_user_id_idx ON public.marketplace_ratings(rated_user_id);
CREATE INDEX IF NOT EXISTS marketplace_offers_listing_id_idx ON public.marketplace_offers(listing_id);
CREATE INDEX IF NOT EXISTS marketplace_offers_buyer_id_idx ON public.marketplace_offers(buyer_id);
CREATE INDEX IF NOT EXISTS marketplace_offers_seller_id_idx ON public.marketplace_offers(seller_id);
CREATE INDEX IF NOT EXISTS meet_participants_meet_id_idx ON public.meet_participants(meet_id);
CREATE INDEX IF NOT EXISTS meet_participants_user_id_idx ON public.meet_participants(user_id);
CREATE INDEX IF NOT EXISTS forum_posts_forum_id_idx ON public.forum_posts(forum_id);
CREATE INDEX IF NOT EXISTS forum_posts_created_at_idx ON public.forum_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS forum_comments_post_id_idx ON public.forum_comments(post_id);
CREATE INDEX IF NOT EXISTS forum_comments_parent_id_idx ON public.forum_comments(parent_id);

-- Add missing triggers (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_marketplace_offers_updated_at') THEN
    CREATE TRIGGER update_marketplace_offers_updated_at
      BEFORE UPDATE ON public.marketplace_offers
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_meets_updated_at') THEN
    CREATE TRIGGER update_meets_updated_at
      BEFORE UPDATE ON public.meets
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_forum_posts_updated_at') THEN
    CREATE TRIGGER update_forum_posts_updated_at
      BEFORE UPDATE ON public.forum_posts
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_forum_comments_updated_at') THEN
    CREATE TRIGGER update_forum_comments_updated_at
      BEFORE UPDATE ON public.forum_comments
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE public.marketplace_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meet_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

-- Add missing policies (only if they don't exist)
DO $$
BEGIN
  -- Marketplace favorites policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketplace_favorites' AND policyname = 'Users can view their own favorites') THEN
    CREATE POLICY "Users can view their own favorites" ON public.marketplace_favorites
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketplace_favorites' AND policyname = 'Users can insert their own favorites') THEN
    CREATE POLICY "Users can insert their own favorites" ON public.marketplace_favorites
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketplace_favorites' AND policyname = 'Users can delete their own favorites') THEN
    CREATE POLICY "Users can delete their own favorites" ON public.marketplace_favorites
      FOR DELETE USING (auth.uid() = user_id);
  END IF;

  -- Marketplace ratings policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketplace_ratings' AND policyname = 'Anyone can view ratings') THEN
    CREATE POLICY "Anyone can view ratings" ON public.marketplace_ratings
      FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketplace_ratings' AND policyname = 'Users can insert ratings') THEN
    CREATE POLICY "Users can insert ratings" ON public.marketplace_ratings
      FOR INSERT WITH CHECK (auth.uid() = rater_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketplace_ratings' AND policyname = 'Users can update their own ratings') THEN
    CREATE POLICY "Users can update their own ratings" ON public.marketplace_ratings
      FOR UPDATE USING (auth.uid() = rater_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketplace_ratings' AND policyname = 'Users can delete their own ratings') THEN
    CREATE POLICY "Users can delete their own ratings" ON public.marketplace_ratings
      FOR DELETE USING (auth.uid() = rater_id);
  END IF;

  -- Marketplace offers policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketplace_offers' AND policyname = 'Users can view offers they''re involved in') THEN
    CREATE POLICY "Users can view offers they're involved in" ON public.marketplace_offers
      FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketplace_offers' AND policyname = 'Users can insert offers') THEN
    CREATE POLICY "Users can insert offers" ON public.marketplace_offers
      FOR INSERT WITH CHECK (auth.uid() = buyer_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketplace_offers' AND policyname = 'Users can update offers they''re involved in') THEN
    CREATE POLICY "Users can update offers they're involved in" ON public.marketplace_offers
      FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
  END IF;

  -- Meet participants policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meet_participants' AND policyname = 'Users can view participants for meets they''re in') THEN
    CREATE POLICY "Users can view participants for meets they're in" ON public.meet_participants
      FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
          SELECT 1 FROM public.meets 
          WHERE meets.id = meet_participants.meet_id 
          AND meets.organizer_id = auth.uid()
        )
      );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meet_participants' AND policyname = 'Users can insert themselves as participants') THEN
    CREATE POLICY "Users can insert themselves as participants" ON public.meet_participants
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meet_participants' AND policyname = 'Users can update their own participation') THEN
    CREATE POLICY "Users can update their own participation" ON public.meet_participants
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meet_participants' AND policyname = 'Users can delete their own participation') THEN
    CREATE POLICY "Users can delete their own participation" ON public.meet_participants
      FOR DELETE USING (auth.uid() = user_id);
  END IF;

  -- Forums policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'forums' AND policyname = 'Anyone can view forums') THEN
    CREATE POLICY "Anyone can view forums" ON public.forums
      FOR SELECT USING (true);
  END IF;

  -- Forum posts policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'forum_posts' AND policyname = 'Anyone can view forum posts') THEN
    CREATE POLICY "Anyone can view forum posts" ON public.forum_posts
      FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'forum_posts' AND policyname = 'Users can insert their own posts') THEN
    CREATE POLICY "Users can insert their own posts" ON public.forum_posts
      FOR INSERT WITH CHECK (auth.uid() = author_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'forum_posts' AND policyname = 'Users can update their own posts') THEN
    CREATE POLICY "Users can update their own posts" ON public.forum_posts
      FOR UPDATE USING (auth.uid() = author_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'forum_posts' AND policyname = 'Users can delete their own posts') THEN
    CREATE POLICY "Users can delete their own posts" ON public.forum_posts
      FOR DELETE USING (auth.uid() = author_id);
  END IF;

  -- Forum comments policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'forum_comments' AND policyname = 'Anyone can view forum comments') THEN
    CREATE POLICY "Anyone can view forum comments" ON public.forum_comments
      FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'forum_comments' AND policyname = 'Users can insert their own comments') THEN
    CREATE POLICY "Users can insert their own comments" ON public.forum_comments
      FOR INSERT WITH CHECK (auth.uid() = author_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'forum_comments' AND policyname = 'Users can update their own comments') THEN
    CREATE POLICY "Users can update their own comments" ON public.forum_comments
      FOR UPDATE USING (auth.uid() = author_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'forum_comments' AND policyname = 'Users can delete their own comments') THEN
    CREATE POLICY "Users can delete their own comments" ON public.forum_comments
      FOR DELETE USING (auth.uid() = author_id);
  END IF;
END $$;

-- Insert default forums
INSERT INTO public.forums (name, description, category) VALUES
  ('BMW', 'BMW enthusiasts forum', 'Brand'),
  ('Mercedes-Benz', 'Mercedes-Benz enthusiasts forum', 'Brand'),
  ('Audi', 'Audi enthusiasts forum', 'Brand'),
  ('Porsche', 'Porsche enthusiasts forum', 'Brand'),
  ('General Discussion', 'General car discussion', 'General'),
  ('Modifications', 'Car modifications and upgrades', 'Technical'),
  ('Events & Meets', 'Car events and meetups', 'Events'),
  ('Buy/Sell/Trade', 'Marketplace discussions', 'Marketplace')
ON CONFLICT (name) DO NOTHING; 