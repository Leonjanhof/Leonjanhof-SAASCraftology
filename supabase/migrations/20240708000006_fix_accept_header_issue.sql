-- Disable RLS temporarily to fix any issues
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable update for users based on id" ON users;
DROP POLICY IF EXISTS "Enable delete for users based on id" ON users;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create simplified policies
CREATE POLICY "Public read access"
ON users FOR SELECT
USING (true);

CREATE POLICY "Public insert access"
ON users FOR INSERT
WITH CHECK (true);

CREATE POLICY "Owner update access"
ON users FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Owner delete access"
ON users FOR DELETE
USING (auth.uid() = id);
