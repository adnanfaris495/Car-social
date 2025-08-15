-- Add favorite_car_id column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS favorite_car_id UUID REFERENCES cars(id) ON DELETE SET NULL;

-- Add comment to explain the column
COMMENT ON COLUMN users.favorite_car_id IS 'References the car that the user has set as their avatar/profile picture'; 