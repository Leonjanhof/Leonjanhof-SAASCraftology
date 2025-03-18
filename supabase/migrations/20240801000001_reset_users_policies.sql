-- Drop all existing policies on the users table
DROP POLICY IF EXISTS "Public access" ON users;
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Admins can view all data" ON users;
DROP POLICY IF EXISTS "Admins can update all data" ON users;

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create simple policies for users table
-- Allow users to read their own data
CREATE POLICY "Users can read own data"
ON users FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "Users can update own data"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Allow admins to read all data
CREATE POLICY "Admins can read all data"
ON users FOR SELECT
USING (auth.uid() IN (
  SELECT id FROM users WHERE role = 'admin'
));

-- Allow admins to update all data
CREATE POLICY "Admins can update all data"
ON users FOR UPDATE
USING (auth.uid() IN (
  SELECT id FROM users WHERE role = 'admin'
));

-- Allow new user creation during signup
CREATE POLICY "Allow insert during signup"
ON users FOR INSERT
WITH CHECK (true);

-- Ensure role column has a default value of 'user'
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user';
