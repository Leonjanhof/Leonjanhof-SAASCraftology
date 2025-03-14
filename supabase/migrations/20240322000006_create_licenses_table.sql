-- Create licenses table
CREATE TABLE IF NOT EXISTS licenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  license_key TEXT NOT NULL UNIQUE,
  hwid TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active BOOLEAN DEFAULT true
);

-- Enable realtime
alter publication supabase_realtime add table licenses;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their own licenses" ON licenses;
CREATE POLICY "Users can view their own licenses"
ON licenses FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create function to automatically generate license key
CREATE OR REPLACE FUNCTION generate_license_key(product_code TEXT)
RETURNS TEXT AS $$
DECLARE
  random_key TEXT;
BEGIN
  -- Generate a random key in format XX-XXXX-XXXX-XXXX
  random_key := product_code || '-' ||
                array_to_string(ARRAY(
                  SELECT substring('0123456789ABCDEF' FROM (ceil(random()*16))::int FOR 1)
                  FROM generate_series(1,12)
                ), '');
  RETURN random_key;
END;
$$ LANGUAGE plpgsql;