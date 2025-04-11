-- Create functions for profile management

-- Function to get a single voting profile by ID
CREATE OR REPLACE FUNCTION get_voting_profile(profile_id UUID, user_id UUID)
RETURNS SETOF profile_voting AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM profile_voting
  WHERE id = profile_id AND user_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get a single hosting profile by ID
CREATE OR REPLACE FUNCTION get_hosting_profile(profile_id UUID, user_id UUID)
RETURNS SETOF profile_hosting AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM profile_hosting
  WHERE id = profile_id AND user_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a voting profile (without deleting Microsoft accounts)
CREATE OR REPLACE FUNCTION delete_voting_profile(profile_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  success BOOLEAN;
BEGIN
  -- First, update any Microsoft accounts to remove the profile_id reference
  UPDATE minecraft_accounts
  SET profile_id = NULL,
      profile_type = NULL,
      updated_at = NOW()
  WHERE profile_id = profile_id AND user_id = user_id;
  
  -- Then delete the profile
  DELETE FROM profile_voting
  WHERE id = profile_id AND user_id = user_id;
  
  -- Check if the deletion was successful
  GET DIAGNOSTICS success = ROW_COUNT;
  
  RETURN success > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a hosting profile
CREATE OR REPLACE FUNCTION delete_hosting_profile(profile_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  success BOOLEAN;
BEGIN
  -- Delete the profile
  DELETE FROM profile_hosting
  WHERE id = profile_id AND user_id = user_id;
  
  -- Check if the deletion was successful
  GET DIAGNOSTICS success = ROW_COUNT;
  
  RETURN success > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
