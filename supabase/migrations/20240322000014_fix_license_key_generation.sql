-- Create the generate_license_key function if it doesn't exist
CREATE OR REPLACE FUNCTION generate_license_key(product_code TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    random_part TEXT;
    timestamp_part TEXT;
    license_key TEXT;
BEGIN
    -- Generate a random string (16 characters)
    random_part := array_to_string(ARRAY(
        SELECT substr('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', ceil(random() * 36)::integer, 1)
        FROM generate_series(1, 16)
    ), '');
    
    -- Get current timestamp in seconds since epoch
    timestamp_part := to_char(extract(epoch from now())::bigint, 'FM000000000');
    
    -- Combine parts to form license key: PRODUCT-RANDOM-TIMESTAMP
    license_key := product_code || '-' || random_part || '-' || timestamp_part;
    
    RETURN license_key;
END;
$$;

-- Enable RLS for licenses table
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;

-- Create policy for licenses table
DROP POLICY IF EXISTS "Users can view their own licenses" ON licenses;
CREATE POLICY "Users can view their own licenses"
    ON licenses
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Add publication for realtime
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime;
ALTER PUBLICATION supabase_realtime ADD TABLE licenses;
