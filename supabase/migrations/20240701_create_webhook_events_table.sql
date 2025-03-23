-- Create webhook_events table to track all client-server activity
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR NOT NULL,
  type VARCHAR NOT NULL,
  stripe_event_id VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  modified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB,
  user_id UUID REFERENCES auth.users(id)
);

-- Enable row level security
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Create policy to allow admins to read all webhook events
DROP POLICY IF EXISTS "Admins can read all webhook events" ON webhook_events;
CREATE POLICY "Admins can read all webhook events"
  ON webhook_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role_name = 'admin'
    )
  );

-- Create policy to allow users to read their own webhook events
DROP POLICY IF EXISTS "Users can read their own webhook events" ON webhook_events;
CREATE POLICY "Users can read their own webhook events"
  ON webhook_events FOR SELECT
  USING (user_id = auth.uid());

-- Create policy to allow system to insert webhook events
DROP POLICY IF EXISTS "System can insert webhook events" ON webhook_events;
CREATE POLICY "System can insert webhook events"
  ON webhook_events FOR INSERT
  WITH CHECK (true);

-- Enable realtime subscriptions for this table
alter publication supabase_realtime add table webhook_events;
