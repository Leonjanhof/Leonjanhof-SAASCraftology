-- Create or replace the manage_user_role function
CREATE OR REPLACE FUNCTION manage_user_role(admin_user_id UUID, target_user_email TEXT, new_role TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_role TEXT;
  target_user_id UUID;
  result BOOLEAN;
BEGIN
  -- Check if the admin user has admin role
  SELECT role_name INTO admin_role FROM user_roles WHERE user_id = admin_user_id;
  
  IF admin_role IS NULL OR admin_role != 'admin' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Unauthorized: Only admins can manage user roles');
  END IF;
  
  -- Validate the new role
  IF new_role != 'user' AND new_role != 'admin' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid role: must be ''user'' or ''admin''');
  END IF;
  
  -- Get the target user ID from email
  SELECT id INTO target_user_id FROM users WHERE email = target_user_email;
  
  IF target_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'User with email ' || target_user_email || ' not found');
  END IF;
  
  -- Update or create the user role
  SELECT create_user_role(target_user_id, new_role) INTO result;
  
  IF result THEN
    RETURN jsonb_build_object('success', true, 'message', 'User ' || target_user_email || ' role updated to ' || new_role);
  ELSE
    RETURN jsonb_build_object('success', false, 'message', 'Failed to update user role');
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION manage_user_role(UUID, TEXT, TEXT) TO authenticated;
