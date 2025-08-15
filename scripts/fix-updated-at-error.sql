-- Fix Updated At Error
-- Run this in your Supabase Dashboard SQL Editor

-- ========================================
-- 1. DROP ALL PROBLEMATIC TRIGGERS AND FUNCTIONS
-- ========================================

-- Drop all triggers that use handle_updated_at function
DROP TRIGGER IF EXISTS handle_cars_updated_at ON public.cars;
DROP TRIGGER IF EXISTS handle_modifications_updated_at ON public.modifications;
DROP TRIGGER IF EXISTS handle_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS handle_meets_updated_at ON public.meets;
DROP TRIGGER IF EXISTS handle_meet_attendees_updated_at ON public.meet_attendees;
DROP TRIGGER IF EXISTS handle_meet_comments_updated_at ON public.meet_comments;
DROP TRIGGER IF EXISTS set_updated_at ON public.follows;

-- Drop the problematic function
DROP FUNCTION IF EXISTS handle_updated_at();

-- ========================================
-- 2. CREATE A SAFE UPDATED_AT FUNCTION
-- ========================================

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    -- Only set updated_at if the table has that column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = TG_TABLE_NAME 
        AND column_name = 'updated_at'
    ) THEN
        NEW.updated_at = now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 3. RECREATE TRIGGERS ONLY FOR TABLES WITH UPDATED_AT
-- ========================================

-- Check which tables have updated_at column and create triggers only for those
DO $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format('
            CREATE TRIGGER handle_%s_updated_at
                BEFORE UPDATE ON public.%I
                FOR EACH ROW
                EXECUTE FUNCTION handle_updated_at();
        ', table_record.table_name, table_record.table_name);
    END LOOP;
END $$;

-- ========================================
-- 4. VERIFY THE FIX
-- ========================================

-- Check which triggers were created
SELECT 'CREATED TRIGGERS:' as info;
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND trigger_name LIKE 'handle_%_updated_at';

-- Check which tables have updated_at column
SELECT 'TABLES WITH UPDATED_AT:' as info;
SELECT table_name 
FROM information_schema.columns 
WHERE column_name = 'updated_at' 
AND table_schema = 'public';

SELECT 'Fix completed successfully!' as status; 