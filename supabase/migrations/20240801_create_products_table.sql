-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  price_id VARCHAR NOT NULL,
  features TEXT[] NOT NULL DEFAULT '{}',
  is_subscription BOOLEAN NOT NULL DEFAULT TRUE,
  is_popular BOOLEAN NOT NULL DEFAULT FALSE,
  icon_name VARCHAR NOT NULL DEFAULT 'Package',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Allow admins full access" ON products;
CREATE POLICY "Allow admins full access"
  ON products
  USING (
    (SELECT role_name FROM user_roles WHERE user_id = auth.uid()) = 'admin'
  );

DROP POLICY IF EXISTS "Allow public read access" ON products;
CREATE POLICY "Allow public read access"
  ON products FOR SELECT
  USING (true);

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE products;
