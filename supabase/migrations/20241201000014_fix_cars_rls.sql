-- Fix Cars Table RLS Policies
-- This migration ensures the cars table has proper RLS policies for search functionality

-- Enable RLS on cars table if not already enabled
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all cars" ON public.cars;
DROP POLICY IF EXISTS "Users can insert their own cars" ON public.cars;
DROP POLICY IF EXISTS "Users can update their own cars" ON public.cars;
DROP POLICY IF EXISTS "Users can delete their own cars" ON public.cars;

-- Create RLS policies for cars table

-- Allow users to view all cars (for search functionality)
CREATE POLICY "Users can view all cars" ON public.cars
  FOR SELECT USING (true);

-- Allow authenticated users to create their own cars
CREATE POLICY "Users can insert their own cars" ON public.cars
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own cars
CREATE POLICY "Users can update their own cars" ON public.cars
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own cars
CREATE POLICY "Users can delete their own cars" ON public.cars
  FOR DELETE USING (auth.uid() = user_id);

-- Success message
SELECT 'Cars table RLS policies created successfully!' as status; 