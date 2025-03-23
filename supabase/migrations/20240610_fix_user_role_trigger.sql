-- First, let's check if the function exists and recreate it with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert a role for the new user
  INSERT INTO public.user_roles (id, user_id, role_name, created_at, updated_at)
  VALUES (
    gen_random_uuid(),  -- Generate a UUID for the id column
    NEW.id,             -- NEW.id contains the user id from the auth.users table
    'user',             -- Default role
    NOW(),              -- Current timestamp for created_at
    NOW()               -- Current timestamp for updated_at
  )
  ON CONFLICT (user_id) 
  DO NOTHING;  -- If entry already exists, do nothing
  
  -- Log the action (optional, good for debugging)
  RAISE LOG 'New user role created for user ID: %', NEW.id;
  
  RETURN NEW;
EXCEPTION 
  WHEN OTHERS THEN
    -- Log any errors but don't stop the auth process
    RAISE LOG 'Error creating user role: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the trigger with proper configuration
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Add a manual function to create user roles for existing users
CREATE OR REPLACE FUNCTION public.create_missing_user_roles()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  auth_user RECORD;
BEGIN
  FOR auth_user IN 
    SELECT id FROM auth.users WHERE id NOT IN (SELECT user_id FROM public.user_roles)
  LOOP
    INSERT INTO public.user_roles (id, user_id, role_name, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      auth_user.id,
      'user',
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    RAISE LOG 'Created missing user role for user ID: %', auth_user.id;
  END LOOP;
END;
$$;
