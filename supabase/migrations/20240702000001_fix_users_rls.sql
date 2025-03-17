-- Disable RLS on users table to allow inserts
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Create policy to allow public access to users table
DROP POLICY IF EXISTS "Public access" ON public.users;
CREATE POLICY "Public access"
ON public.users FOR SELECT
USING (true);

-- Create policy to allow authenticated users to insert their own records
DROP POLICY IF EXISTS "Users can insert their own records" ON public.users;
CREATE POLICY "Users can insert their own records"
ON public.users FOR INSERT
WITH CHECK (auth.uid() = id);

-- Create policy to allow authenticated users to update their own records
DROP POLICY IF EXISTS "Users can update their own records" ON public.users;
CREATE POLICY "Users can update their own records"
ON public.users FOR UPDATE
USING (auth.uid() = id);
