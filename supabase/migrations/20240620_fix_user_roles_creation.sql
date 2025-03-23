-- Fix the user_roles table to avoid ambiguous column references

-- Create a function to safely create user roles
CREATE OR REPLACE FUNCTION public.create_user_role(user_id_param UUID, role_name_param TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if role already exists for this user
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = user_id_param) THEN
    -- Insert the role with explicit column references
    INSERT INTO public.user_roles (user_id, role_name, created_at, updated_at)
    VALUES (user_id_param, role_name_param, NOW(), NOW());
  END IF;
  
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$;

-- Fix the set_user_role function to use proper parameter names
CREATE OR REPLACE FUNCTION public.set_user_role(user_email TEXT, new_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Find the user ID from the email
  SELECT id INTO target_user_id FROM public.users WHERE email = user_email;
  
  -- If user found, set the role
  IF target_user_id IS NOT NULL THEN
    -- Delete existing role if any
    DELETE FROM public.user_roles WHERE user_id = target_user_id;
    
    -- Insert new role
    INSERT INTO public.user_roles (user_id, role_name, created_at, updated_at)
    VALUES (target_user_id, new_role, NOW(), NOW());
    
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$;

-- Improve the create_missing_user_roles function
CREATE OR REPLACE FUNCTION public.create_missing_user_roles()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Loop through all users without roles
  FOR user_record IN 
    SELECT u.id 
    FROM public.users u
    LEFT JOIN public.user_roles ur ON u.id = ur.user_id
    WHERE ur.id IS NULL
  LOOP
    -- Create a default user role
    INSERT INTO public.user_roles (user_id, role_name, created_at, updated_at)
    VALUES (user_record.id, 'user', NOW(), NOW());
  END LOOP;
END;
$$;
