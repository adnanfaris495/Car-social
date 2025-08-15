-- Fix Marketplace Listings RLS Policies
-- This migration enables RLS and adds a select policy for marketplace_listings

ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
 
CREATE POLICY "Anyone can view listings" ON public.marketplace_listings
  FOR SELECT USING (true); 