-- This migration ensures the webhook can properly access the database

-- Add a comment to explain the issue
COMMENT ON TABLE licenses IS 'Stores license keys for products. Make sure webhook has proper access.';  

-- Ensure the webhook_events table exists
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  type TEXT NOT NULL,
  stripe_event_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  modified_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  data JSONB
);

-- Enable row level security
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to insert
DROP POLICY IF EXISTS "Allow service role full access" ON public.webhook_events;
CREATE POLICY "Allow service role full access"
  ON public.webhook_events
  USING (true);

-- Enable realtime for webhook_events
ALTER PUBLICATION supabase_realtime ADD TABLE webhook_events;
