-- Fix the delete_hosting_profile function to resolve the ambiguous user_id reference
CREATE OR REPLACE FUNCTION public.delete_hosting_profile(profile_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_exists BOOLEAN;
BEGIN
  -- Check if the profile exists and belongs to the user
  SELECT EXISTS (
    SELECT 1 FROM profile_hosting ph
    WHERE ph.id = profile_id AND ph.user_id = user_id
  ) INTO profile_exists;
  
  IF NOT profile_exists THEN
    RETURN FALSE;
  END IF;
  
  -- Delete the profile
  DELETE FROM profile_hosting
  WHERE id = profile_id AND user_id = user_id;
  
  RETURN TRUE;
END;
$$;

-- Fix the delete_voting_profile function to resolve the ambiguous user_id reference
CREATE OR REPLACE FUNCTION public.delete_voting_profile(profile_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_exists BOOLEAN;
BEGIN
  -- Check if the profile exists and belongs to the user
  SELECT EXISTS (
    SELECT 1 FROM profile_voting pv
    WHERE pv.id = profile_id AND pv.user_id = user_id
  ) INTO profile_exists;
  
  IF NOT profile_exists THEN
    RETURN FALSE;
  END IF;
  
  -- Delete associated Microsoft accounts first
  DELETE FROM minecraft_accounts
  WHERE profile_id = profile_id AND user_id = user_id;
  
  -- Delete the profile
  DELETE FROM profile_voting
  WHERE id = profile_id AND user_id = user_id;
  
  RETURN TRUE;
END;
$$;