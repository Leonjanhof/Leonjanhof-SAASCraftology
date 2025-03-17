-- Add role column to users table with default value 'customer'
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'customer';
