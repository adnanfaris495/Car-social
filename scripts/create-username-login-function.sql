-- Create function to get user email by ID for username login
-- Run this in your Supabase Dashboard SQL Editor

-- Create the function to get user email by ID
CREATE OR REPLACE FUNCTION get_user_email_by_id(user_id UUID)
RETURNS TABLE(email TEXT) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function allows us to get the email from auth.users
  -- It's marked as SECURITY DEFINER so it runs with elevated privileges
  RETURN QUERY
  SELECT au.email::TEXT
  FROM auth.users au
  WHERE au.id = user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_email_by_id(UUID) TO authenticated;

-- Test the function (optional)
-- SELECT * FROM get_user_email_by_id('your-user-id-here'); 