-- Ensure RLS is enabled on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Add a special policy to allow new users to create their initial record
-- This is needed for the signup flow
DROP POLICY IF EXISTS "Allow users to insert with matching auth.uid" ON public.users;
CREATE POLICY "Allow users to insert with matching auth.uid"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Ensure policy exists to allow users to view their own data
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
CREATE POLICY "Users can view their own data"
ON public.users FOR SELECT
USING (auth.uid() = id);

-- Ensure policy exists to allow users to update their own data
DROP POLICY IF EXISTS "Users can update their own records" ON public.users;
CREATE POLICY "Users can update their own records"
ON public.users FOR UPDATE
USING (auth.uid() = id);

-- Ensure policy exists for service role access
DROP POLICY IF EXISTS "Service role has full access" ON public.users;
CREATE POLICY "Service role has full access"
ON public.users
USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- Ensure policy exists for admin access
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users"
ON public.users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);
