-- This migration fixes the RLS policy for the users table
-- The issue is that the current policy is too restrictive and doesn't allow users to read their own records

-- First, let's make sure RLS is enabled on the users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;

-- Create a policy that allows users to read their own records
CREATE POLICY "Users can view their own data"
ON public.users
FOR SELECT
USING (auth.uid() = id OR auth.jwt()->>'role' = 'service_role');

-- Create a policy that allows users to update their own records
CREATE POLICY "Users can update their own data"
ON public.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Create a policy that allows the service role to insert records
DROP POLICY IF EXISTS "Service role can insert" ON public.users;
CREATE POLICY "Service role can insert"
ON public.users
FOR INSERT
WITH CHECK (auth.jwt()->>'role' = 'service_role' OR auth.uid() = id);
