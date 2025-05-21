/*
  # Admin Functions
  
  1. Create Functions
    - `check_is_admin` - Function to check if a user has admin role
    - `check_is_editor` - Function to check if a user has editor role
*/

-- Function to check if the current user has admin role
CREATE OR REPLACE FUNCTION check_is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  SELECT 
    COALESCE(
      auth.jwt() ->> 'role' = 'admin' OR 
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
      FALSE
    ) INTO is_admin;
  
  RETURN is_admin;
END;
$$;

-- Function to check if the current user has editor role
CREATE OR REPLACE FUNCTION check_is_editor()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_editor BOOLEAN;
BEGIN
  SELECT 
    COALESCE(
      auth.jwt() ->> 'role' = 'editor' OR 
      auth.jwt() ->> 'role' = 'admin' OR
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'editor' OR
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
      FALSE
    ) INTO is_editor;
  
  RETURN is_editor;
END;
$$;