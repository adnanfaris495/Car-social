-- Create marketplace_listings table
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  condition TEXT NOT NULL,
  location TEXT,
  image_urls TEXT[] DEFAULT '{}',
  compatible_makes TEXT[] DEFAULT '{}',
  compatible_models TEXT[] DEFAULT '{}',
  compatible_years INTEGER[] DEFAULT '{}',
  is_trade_available BOOLEAN DEFAULT false,
  is_sold BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create RLS policies for marketplace_listings
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

-- Allow users to view all listings
CREATE POLICY "Anyone can view listings" ON public.marketplace_listings
  FOR SELECT USING (true);

-- Allow authenticated users to create listings
CREATE POLICY "Authenticated users can create listings" ON public.marketplace_listings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own listings
CREATE POLICY "Users can update their own listings" ON public.marketplace_listings
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own listings
CREATE POLICY "Users can delete their own listings" ON public.marketplace_listings
  FOR DELETE USING (auth.uid() = user_id);

-- Create an index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS marketplace_listings_user_id_idx ON public.marketplace_listings(user_id);

-- Create an index on created_at for sorting
CREATE INDEX IF NOT EXISTS marketplace_listings_created_at_idx ON public.marketplace_listings(created_at DESC);

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_marketplace_listings_updated_at
  BEFORE UPDATE ON public.marketplace_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 