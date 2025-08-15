-- Enable RLS on forum tables
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

-- Policies for forum_posts
CREATE POLICY "Users can view all forum posts" ON public.forum_posts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create forum posts" ON public.forum_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own forum posts" ON public.forum_posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own forum posts" ON public.forum_posts
  FOR DELETE USING (auth.uid() = author_id);

-- Policies for forum_comments
CREATE POLICY "Users can view all forum comments" ON public.forum_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create forum comments" ON public.forum_comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own forum comments" ON public.forum_comments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own forum comments" ON public.forum_comments
  FOR DELETE USING (auth.uid() = author_id); 