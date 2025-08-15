-- Fix Marketplace Listings RLS Policies
-- Run this in your Supabase Dashboard SQL Editor

-- Enable RLS on marketplace_listings table
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow anyone to view listings
CREATE POLICY "Anyone can view listings" ON public.marketplace_listings
  FOR SELECT USING (true);

-- Success message
SELECT 'Marketplace RLS policies created successfully!' as status; 