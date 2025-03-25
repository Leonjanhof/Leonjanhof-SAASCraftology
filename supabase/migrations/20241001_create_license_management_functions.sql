-- Function 1: Generate a license for a user
CREATE OR REPLACE FUNCTION generate_license(
  p_user_id UUID,
  p_product_name TEXT,
  p_expires_at TIMESTAMPTZ DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_license_key TEXT;
  v_product_code TEXT;
  v_license_data JSONB;
  v_license RECORD;
  v_timestamp TIMESTAMPTZ := NOW();
BEGIN
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_user_id) THEN
    RETURN jsonb_build_object('success', false, 'message', 'User not found');
  END IF;

  -- Extract product code from product name
  IF p_product_name IS NOT NULL AND LENGTH(p_product_name) > 0 THEN
    v_product_code := UPPER(SUBSTRING(REGEXP_REPLACE(p_product_name, '\s+', ''), 1, 3));
  ELSE
    v_product_code := 'UNK'; -- Unknown product
  END IF;

  -- Ensure product code is exactly 3 characters
  IF LENGTH(v_product_code) < 3 THEN
    v_product_code := RPAD(v_product_code, 3, 'X');
  ELSIF LENGTH(v_product_code) > 3 THEN
    v_product_code := SUBSTRING(v_product_code, 1, 3);
  END IF;

  -- Generate a license key
  SELECT generate_license_key(v_product_code) INTO v_license_key;

  -- Create the license in the database
  INSERT INTO licenses (
    user_id,
    product_name,
    license_key,
    active,
    created_at,
    updated_at,
    expires_at
  ) VALUES (
    p_user_id,
    p_product_name,
    v_license_key,
    TRUE,
    v_timestamp,
    v_timestamp,
    p_expires_at
  ) RETURNING * INTO v_license;

  -- Format the response
  v_license_data := jsonb_build_object(
    'success', true,
    'license', row_to_json(v_license)::jsonb,
    'message', 'License generated successfully'
  );

  -- Log the activity
  INSERT INTO webhook_events (
    event_type,
    type,
    data,
    created_at
  ) VALUES (
    'license_generated',
    'license',
    jsonb_build_object(
      'user_id', p_user_id,
      'details', CONCAT('License generated for product ', p_product_name),
      'metadata', jsonb_build_object(
        'license_id', v_license.id,
        'product_name', p_product_name,
        'expires_at', p_expires_at
      )
    ),
    v_timestamp
  );

  RETURN v_license_data;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;

-- Function 2: Extend a license's expiry date
CREATE OR REPLACE FUNCTION extend_license(
  p_license_id UUID,
  p_expires_at TIMESTAMPTZ
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_license RECORD;
  v_updated_license RECORD;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  -- Check if license exists
  SELECT * INTO v_license FROM licenses WHERE id = p_license_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'License not found');
  END IF;

  -- Validate expiry date is in the future
  IF p_expires_at <= v_now THEN
    RETURN jsonb_build_object('success', false, 'message', 'Expiry date must be in the future');
  END IF;

  -- Update the license with the new expiry date
  UPDATE licenses
  SET 
    expires_at = p_expires_at,
    updated_at = v_now,
    active = TRUE  -- If license was inactive, activate it
  WHERE id = p_license_id
  RETURNING * INTO v_updated_license;

  -- Log the activity
  INSERT INTO webhook_events (
    event_type,
    type,
    data,
    created_at
  ) VALUES (
    'license_extended',
    'license',
    jsonb_build_object(
      'user_id', v_license.user_id,
      'details', CONCAT('License for ', v_license.product_name, ' extended to ', TO_CHAR(p_expires_at, 'YYYY-MM-DD')),
      'metadata', jsonb_build_object(
        'license_id', p_license_id,
        'product_name', v_license.product_name,
        'previous_expiry', v_license.expires_at,
        'new_expiry', p_expires_at
      )
    ),
    v_now
  );

  RETURN jsonb_build_object(
    'success', true,
    'license', row_to_json(v_updated_license)::jsonb,
    'message', 'License extended successfully'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;

-- Function 3: Delete a license
CREATE OR REPLACE FUNCTION delete_license(
  p_license_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_license RECORD;
BEGIN
  -- Check if license exists and get its details for logging
  SELECT * INTO v_license FROM licenses WHERE id = p_license_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'License not found');
  END IF;

  -- Delete the license
  DELETE FROM licenses WHERE id = p_license_id;

  -- Log the activity
  INSERT INTO webhook_events (
    event_type,
    type,
    data,
    created_at
  ) VALUES (
    'license_deleted',
    'license',
    jsonb_build_object(
      'user_id', v_license.user_id,
      'details', CONCAT('License for ', v_license.product_name, ' deleted'),
      'metadata', jsonb_build_object(
        'license_id', p_license_id,
        'product_name', v_license.product_name,
        'license_key', v_license.license_key
      )
    ),
    NOW()
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'License deleted successfully'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;

-- Function 4: Get licenses with pagination and search
CREATE OR REPLACE FUNCTION get_licenses(
  p_page INT DEFAULT 1,
  p_page_size INT DEFAULT 10,
  p_search_query TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_offset INT;
  v_licenses JSONB;
  v_total_count INT;
  v_search_pattern TEXT;
BEGIN
  -- Calculate offset for pagination
  v_offset := (p_page - 1) * p_page_size;
  
  -- Prepare search pattern if search query is provided
  IF p_search_query IS NOT NULL AND LENGTH(p_search_query) > 0 THEN
    v_search_pattern := '%' || p_search_query || '%';
  ELSE
    v_search_pattern := NULL;
  END IF;

  -- Get total count for pagination
  IF v_search_pattern IS NULL THEN
    SELECT COUNT(*) INTO v_total_count FROM licenses;
  ELSE
    SELECT COUNT(*) INTO v_total_count 
    FROM licenses l
    LEFT JOIN users u ON l.user_id = u.id
    WHERE 
      l.license_key ILIKE v_search_pattern OR
      l.product_name ILIKE v_search_pattern OR
      u.email ILIKE v_search_pattern;
  END IF;

  -- Get licenses with user email
  IF v_search_pattern IS NULL THEN
    WITH license_data AS (
      SELECT 
        l.*,
        u.email as user_email
      FROM licenses l
      LEFT JOIN users u ON l.user_id = u.id
      ORDER BY l.created_at DESC
      LIMIT p_page_size OFFSET v_offset
    )
    SELECT json_agg(license_data)::jsonb INTO v_licenses FROM license_data;
  ELSE
    WITH license_data AS (
      SELECT 
        l.*,
        u.email as user_email
      FROM licenses l
      LEFT JOIN users u ON l.user_id = u.id
      WHERE 
        l.license_key ILIKE v_search_pattern OR
        l.product_name ILIKE v_search_pattern OR
        u.email ILIKE v_search_pattern
      ORDER BY l.created_at DESC
      LIMIT p_page_size OFFSET v_offset
    )
    SELECT json_agg(license_data)::jsonb INTO v_licenses FROM license_data;
  END IF;

  -- Handle empty result
  IF v_licenses IS NULL THEN
    v_licenses := '[]'::jsonb;
  END IF;

  RETURN jsonb_build_object(
    'data', v_licenses,
    'totalCount', v_total_count,
    'page', p_page,
    'pageSize', p_page_size
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('error', SQLERRM);
END;
$$;

-- Function 5: Reset a license's hardware ID
CREATE OR REPLACE FUNCTION reset_license_hwid(
  p_license_id UUID,
  p_user_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_license RECORD;
  v_updated_license RECORD;
  v_now TIMESTAMPTZ := NOW();
  v_one_week_ago TIMESTAMPTZ := v_now - INTERVAL '7 days';
  v_days_left INT;
BEGIN
  -- Check if the license exists and belongs to the user
  SELECT * INTO v_license 
  FROM licenses 
  WHERE id = p_license_id AND user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false, 
      'message', 'License not found or does not belong to the user'
    );
  END IF;

  -- Check if 7 days have passed since the last reset
  IF v_license.last_reset_date IS NOT NULL AND v_license.last_reset_date > v_one_week_ago THEN
    v_days_left := CEIL(EXTRACT(EPOCH FROM (v_license.last_reset_date + INTERVAL '7 days' - v_now)) / 86400);
    RETURN jsonb_build_object(
      'success', false,
      'message', CONCAT('You can only reset your HWID once every 7 days. Please try again in ', v_days_left, ' day(s).')
    );
  END IF;

  -- Reset the HWID and update the last_reset_date
  UPDATE licenses
  SET 
    hwid = NULL,
    last_reset_date = v_now,
    updated_at = v_now
  WHERE id = p_license_id
  RETURNING * INTO v_updated_license;

  -- Log the HWID reset activity
  INSERT INTO webhook_events (
    event_type,
    type,
    data,
    created_at
  ) VALUES (
    'hwid_reset',
    'license',
    jsonb_build_object(
      'user_id', p_user_id,
      'details', CONCAT('HWID reset for license ', p_license_id),
      'metadata', jsonb_build_object(
        'license_id', p_license_id,
        'product_name', v_license.product_name
      )
    ),
    v_now
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'HWID reset successfully',
    'data', row_to_json(v_updated_license)::jsonb
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION generate_license(UUID, TEXT, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION extend_license(UUID, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_license(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_licenses(INT, INT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION reset_license_hwid(UUID, UUID) TO authenticated;
