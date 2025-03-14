-- Add last_reset_date column to licenses table
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS last_reset_date TIMESTAMP WITH TIME ZONE;
