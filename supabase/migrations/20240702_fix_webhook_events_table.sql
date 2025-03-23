-- Fix webhook_events table to work with existing structure
-- This migration assumes the webhook_events table already exists but doesn't have user_id column

-- First, check if the table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'webhook_events') THEN
    -- Add any missing columns if needed
    BEGIN
      -- Only add event_type if it doesn't exist
      IF NOT EXISTS (SELECT FROM information_schema.columns 
                    WHERE table_name = 'webhook_events' AND column_name = 'event_type') THEN
        ALTER TABLE webhook_events ADD COLUMN event_type VARCHAR NOT NULL DEFAULT 'event';
      END IF;
      
      -- Only add type if it doesn't exist
      IF NOT EXISTS (SELECT FROM information_schema.columns 
                    WHERE table_name = 'webhook_events' AND column_name = 'type') THEN
        ALTER TABLE webhook_events ADD COLUMN type VARCHAR NOT NULL DEFAULT 'system';
      END IF;
      
      -- Only add data if it doesn't exist
      IF NOT EXISTS (SELECT FROM information_schema.columns 
                    WHERE table_name = 'webhook_events' AND column_name = 'data') THEN
        ALTER TABLE webhook_events ADD COLUMN data JSONB DEFAULT '{}'::jsonb;
      END IF;
      
      -- Only add created_at if it doesn't exist
      IF NOT EXISTS (SELECT FROM information_schema.columns 
                    WHERE table_name = 'webhook_events' AND column_name = 'created_at') THEN
        ALTER TABLE webhook_events ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
      END IF;
      
      -- Only add modified_at if it doesn't exist
      IF NOT EXISTS (SELECT FROM information_schema.columns 
                    WHERE table_name = 'webhook_events' AND column_name = 'modified_at') THEN
        ALTER TABLE webhook_events ADD COLUMN modified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
      END IF;
    EXCEPTION
      WHEN others THEN
        RAISE NOTICE 'Error adding columns: %', SQLERRM;
    END;
    
    -- Enable row level security if not already enabled
    ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
    
    -- Create policies (will replace if they exist)
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
    
    -- Create policy to allow system to insert webhook events
    DROP POLICY IF EXISTS "System can insert webhook events" ON webhook_events;
    CREATE POLICY "System can insert webhook events"
      ON webhook_events FOR INSERT
      WITH CHECK (true);
    
    -- Enable realtime subscriptions for this table
    BEGIN
      alter publication supabase_realtime add table webhook_events;
    EXCEPTION
      WHEN duplicate_object THEN
        RAISE NOTICE 'Table webhook_events already in realtime publication';
    END;
  END IF;
END $$;