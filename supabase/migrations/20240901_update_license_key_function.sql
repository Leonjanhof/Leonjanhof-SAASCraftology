-- Update the generate_license_key function to ensure it works properly with product names

CREATE OR REPLACE FUNCTION generate_license_key(product_code TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  random_part TEXT;
  date_part TEXT;
  license_key TEXT;
BEGIN
  -- Ensure product_code is not empty, use a default if it is
  IF product_code IS NULL OR product_code = '' THEN
    product_code := 'PRD';
  END IF;
  
  -- Ensure product_code is exactly 3 characters
  product_code := UPPER(SUBSTRING(product_code, 1, 3));
  
  -- Generate a random alphanumeric string (6 characters)
  SELECT string_agg(substr('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', ceil(random() * 36)::integer, 1), '')
  FROM generate_series(1, 6) 
  INTO random_part;
  
  -- Get current date in YYYYMMDD format
  date_part := to_char(current_date, 'YYYYMMDD');
  
  -- Combine parts to form license key
  license_key := product_code || '-' || random_part || '-' || date_part;
  
  RETURN license_key;
END;
$$;