-- Add expires_at column to licenses table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'licenses'
        AND column_name = 'expires_at'
    ) THEN
        ALTER TABLE licenses ADD COLUMN expires_at TIMESTAMPTZ;
    END IF;
END
$$;