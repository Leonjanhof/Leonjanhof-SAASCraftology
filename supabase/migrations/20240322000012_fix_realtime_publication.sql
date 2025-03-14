-- This migration safely adds the reviews table to the realtime publication only if it's not already a member

DO $$
BEGIN
  -- Check if the reviews table is already in the publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'reviews'
  ) THEN
    -- Only add it if it's not already there
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
  END IF;
END
$$;