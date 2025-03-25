-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS manage_user_role;

-- Create the updated function
CREATE OR REPLACE FUNCTION manage_user_role(
  admin_user_id UUID,
  target_user_email TEXT,
  new_role TEXT
) RETURNS JSONB AS $$
DECLARE
  admin_role TEXT;
  target_user_id UUID;
  role_exists BOOLEAN;
  result JSONB;
BEGIN
  -- Validate input parameters
  IF admin_user_id IS NULL OR target_user_email IS NULL OR new_role IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Missing required parameters'
    );
  END IF;

  -- Validate role value
  IF new_role != 'user' AND new_role != 'admin' THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invalid role: must be "user" or "admin"'
    );
  END IF;

  -- Check if the admin user has admin privileges
  SELECT role_name INTO admin_role FROM user_roles WHERE user_id = admin_user_id;
  
  IF admin_role IS NULL OR admin_role != 'admin' THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Unauthorized: Only admins can manage user roles'
    );
  END IF;

  -- Find the user ID associated with the target email
  SELECT id INTO target_user_id FROM users WHERE email = target_user_email;
  
  IF target_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'User with email ' || target_user_email || ' not found'
    );
  END IF;

  -- Check if the user already has a role entry
  SELECT EXISTS(SELECT 1 FROM user_roles WHERE user_id = target_user_id) INTO role_exists;

  IF role_exists THEN
    -- Update existing role
    UPDATE user_roles
    SET role_name = new_role, updated_at = NOW()
    WHERE user_id = target_user_id;
    
    result := jsonb_build_object(
      'success', true,
      'message', 'User role updated to ' || new_role,
      'operation', 'update'
    );
  ELSE
    -- Create new role entry
    INSERT INTO user_roles (user_id, role_name, created_at, updated_at)
    VALUES (target_user_id, new_role, NOW(), NOW());
    
    result := jsonb_build_object(
      'success', true,
      'message', 'User role created as ' || new_role,
      'operation', 'insert'
    );
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
