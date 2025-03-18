-- First, drop all existing policies on the users table
DROP POLICY IF EXISTS "Admins can read all data" ON users;
DROP POLICY IF EXISTS "Admins can update all data" ON users;
DROP POLICY IF EXISTS "Allow insert during signup" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Temporarily disable RLS to ensure clean state
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create a simple policy for public read access
-- This avoids the circular reference by not using a subquery that references the users table
CREATE POLICY "Public read access"
ON users FOR SELECT
USING (true);

-- Create a policy for users to update their own data
CREATE POLICY "Users can update own data"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Create a policy for inserting new users (needed for signup)
CREATE POLICY "Allow insert during signup"
ON users FOR INSERT
WITH CHECK (true);
