-- Fix Follow System Trigger Issue
-- This migration fixes the trigger function that's causing the updated_at error

-- Step 1: Drop the problematic trigger if it exists on follows table
DROP TRIGGER IF EXISTS handle_updated_at ON public.follows;

-- Step 2: Check if the handle_updated_at function exists and modify it to be more robust
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    -- Only set updated_at if the table has this column
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = TG_TABLE_NAME 
        AND column_name = 'updated_at'
    ) THEN
        NEW.updated_at = now();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Success message
SELECT 'Follow system trigger issue fixed successfully!' as status; 