-- Enable RLS on users table for better security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public access" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own records" ON public.users;
DROP POLICY IF EXISTS "Users can update their own records" ON public.users;
DROP POLICY IF EXISTS "Service role has full access" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

-- Create policy to allow authenticated users to select their own records
CREATE POLICY "Users can view their own data"
ON public.users FOR SELECT
USING (auth.uid() = id);

-- Create policy to allow authenticated users to insert their own records
CREATE POLICY "Users can insert their own records"
ON public.users FOR INSERT
WITH CHECK (auth.uid() = id);

-- Create policy to allow authenticated users to update their own records
CREATE POLICY "Users can update their own records"
ON public.users FOR UPDATE
USING (auth.uid() = id);

-- Create policy to allow service role to access all records (for admin functions)
CREATE POLICY "Service role has full access"
ON public.users
USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- Create policy to allow users with admin role to view all records
CREATE POLICY "Admins can view all users"
ON public.users FOR SELECT
USING (
  -- Check if the current user has admin role
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);
