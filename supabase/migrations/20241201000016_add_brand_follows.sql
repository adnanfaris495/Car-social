-- Add Brand Follows System
-- This migration creates a table for users to follow specific car brands

-- Create brand_follows table
CREATE TABLE IF NOT EXISTS public.brand_follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  UNIQUE(user_id, brand_name)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_brand_follows_user_id ON brand_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_follows_brand_name ON brand_follows(brand_name);
CREATE INDEX IF NOT EXISTS idx_brand_follows_created_at ON brand_follows(created_at DESC);

-- Enable RLS on brand_follows table
ALTER TABLE public.brand_follows ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for brand_follows table
CREATE POLICY "Users can view all brand follows" ON public.brand_follows
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own brand follows" ON public.brand_follows
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own brand follows" ON public.brand_follows
  FOR DELETE USING (auth.uid() = user_id);

-- Success message
SELECT 'Brand follows system added successfully!' as status; 