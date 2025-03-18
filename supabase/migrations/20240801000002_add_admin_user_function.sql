-- Function to set a user as admin
CREATE OR REPLACE FUNCTION set_user_as_admin(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  -- Check if user exists
  SELECT EXISTS(SELECT 1 FROM users WHERE email = user_email) INTO user_exists;
  
  IF NOT user_exists THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  -- Update user role to admin
  UPDATE users
  SET role = 'admin',
      updated_at = NOW()
  WHERE email = user_email;
  
  RETURN TRUE;
END;
$$;

-- Example of how to use this function:
-- SELECT set_user_as_admin('admin@example.com');
