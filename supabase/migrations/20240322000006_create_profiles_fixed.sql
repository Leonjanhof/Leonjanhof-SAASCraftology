-- Enable RLS
ALTER TABLE IF EXISTS profile_voting DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profile_hosting DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS minecraft_accounts DISABLE ROW LEVEL SECURITY;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS minecraft_accounts;
DROP TABLE IF EXISTS profile_voting;
DROP TABLE IF EXISTS profile_hosting;

-- Create profile_voting table
CREATE TABLE IF NOT EXISTS profile_voting (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    server TEXT NOT NULL,
    protocol TEXT NOT NULL DEFAULT 'auto',
    hub_settings JSONB DEFAULT '{"setting": "none", "commandInput": "", "gridSize": "none", "selectedSquare": null}'::JSONB,
    afk_settings JSONB DEFAULT '{"setting": "none"}'::JSONB,
    reconnect_settings JSONB DEFAULT '{"setting": "none"}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create profile_hosting table
CREATE TABLE IF NOT EXISTS profile_hosting (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    server TEXT NOT NULL,
    protocol TEXT NOT NULL DEFAULT 'auto',
    hub_settings JSONB DEFAULT '{"setting": "none", "commandInput": "", "gridSize": "none", "selectedSquare": null}'::JSONB,
    afk_settings JSONB DEFAULT '{"setting": "none"}'::JSONB,
    reconnect_settings JSONB DEFAULT '{"setting": "none"}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create minecraft_accounts table
CREATE TABLE IF NOT EXISTS minecraft_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    profile_id UUID NOT NULL,
    profile_type TEXT NOT NULL CHECK (profile_type IN ('voting', 'hosting')),
    username TEXT NOT NULL,
    microsoft_refresh_token TEXT NOT NULL,
    minecraft_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    last_refresh_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
    -- Foreign key constraints will be handled by triggers instead of direct constraints
);

-- Create indexes
CREATE INDEX IF NOT EXISTS profile_voting_user_id_idx ON profile_voting(user_id);
CREATE INDEX IF NOT EXISTS profile_hosting_user_id_idx ON profile_hosting(user_id);
CREATE INDEX IF NOT EXISTS minecraft_accounts_user_id_idx ON minecraft_accounts(user_id);
CREATE INDEX IF NOT EXISTS minecraft_accounts_profile_idx ON minecraft_accounts(profile_id, profile_type);
CREATE INDEX IF NOT EXISTS minecraft_accounts_token_expires_idx ON minecraft_accounts(token_expires_at);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profile_voting_updated_at
    BEFORE UPDATE ON profile_voting
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profile_hosting_updated_at
    BEFORE UPDATE ON profile_hosting
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_minecraft_accounts_updated_at
    BEFORE UPDATE ON minecraft_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to validate profile references
CREATE OR REPLACE FUNCTION validate_profile_reference()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.profile_type = 'voting' THEN
        IF NOT EXISTS (SELECT 1 FROM profile_voting WHERE id = NEW.profile_id) THEN
            RAISE EXCEPTION 'Invalid profile_id for voting profile';
        END IF;
    ELSIF NEW.profile_type = 'hosting' THEN
        IF NOT EXISTS (SELECT 1 FROM profile_hosting WHERE id = NEW.profile_id) THEN
            RAISE EXCEPTION 'Invalid profile_id for hosting profile';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_profile_reference_trigger
    BEFORE INSERT OR UPDATE ON minecraft_accounts
    FOR EACH ROW
    EXECUTE FUNCTION validate_profile_reference();

-- Create function to validate voting profiles have at least one account
CREATE OR REPLACE FUNCTION validate_voting_profile_accounts()
RETURNS TRIGGER AS $$
BEGIN
    -- Only check when deleting accounts
    IF TG_OP = 'DELETE' THEN
        -- Check if this was the last account for a voting profile
        IF OLD.profile_type = 'voting' AND NOT EXISTS (
            SELECT 1 FROM minecraft_accounts 
            WHERE profile_id = OLD.profile_id 
            AND profile_type = 'voting'
            AND id != OLD.id
        ) THEN
            -- If it was the last account, delete the voting profile
            DELETE FROM profile_voting WHERE id = OLD.profile_id;
        END IF;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_voting_profile_accounts
    AFTER DELETE ON minecraft_accounts
    FOR EACH ROW
    EXECUTE FUNCTION validate_voting_profile_accounts();

-- Create function to cascade deletes from profiles to accounts
CREATE OR REPLACE FUNCTION cascade_profile_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- When a profile is deleted, delete associated accounts
    IF TG_OP = 'DELETE' THEN
        IF TG_TABLE_NAME = 'profile_voting' THEN
            DELETE FROM minecraft_accounts 
            WHERE profile_id = OLD.id AND profile_type = 'voting';
        ELSIF TG_TABLE_NAME = 'profile_hosting' THEN
            DELETE FROM minecraft_accounts 
            WHERE profile_id = OLD.id AND profile_type = 'hosting';
        END IF;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cascade_profile_voting_delete
    AFTER DELETE ON profile_voting
    FOR EACH ROW
    EXECUTE FUNCTION cascade_profile_delete();

CREATE TRIGGER cascade_profile_hosting_delete
    AFTER DELETE ON profile_hosting
    FOR EACH ROW
    EXECUTE FUNCTION cascade_profile_delete();

-- Enable Row Level Security
ALTER TABLE profile_voting ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_hosting ENABLE ROW LEVEL SECURITY;
ALTER TABLE minecraft_accounts ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY profile_voting_user_policy ON profile_voting
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY profile_hosting_user_policy ON profile_hosting
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY minecraft_accounts_user_policy ON minecraft_accounts
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Enable realtime
alter publication supabase_realtime add table profile_voting;
alter publication supabase_realtime add table profile_hosting;
alter publication supabase_realtime add table minecraft_accounts;
