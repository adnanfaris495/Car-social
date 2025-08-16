-- Create meets table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.meets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location_address TEXT,
  location_city TEXT,
  location_state TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  max_attendees INTEGER DEFAULT 0,
  type TEXT NOT NULL CHECK (type IN ('cars_and_coffee', 'track_day', 'car_show', 'cruise', 'other')),
  image_url TEXT,
  organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create indexes
CREATE INDEX IF NOT EXISTS meets_organizer_id_idx ON public.meets(organizer_id);
CREATE INDEX IF NOT EXISTS meets_date_idx ON public.meets(date);
CREATE INDEX IF NOT EXISTS meets_type_idx ON public.meets(type);

-- Enable RLS
ALTER TABLE public.meets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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

-- Create updated_at trigger
DROP TRIGGER IF EXISTS update_meets_updated_at ON public.meets;
CREATE TRIGGER update_meets_updated_at
  BEFORE UPDATE ON public.meets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
