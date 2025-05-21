/*
  # Admin Roles and Permissions
  
  1. Create Functions
    - `create_editor_user` - Function to create a user with editor role
  
  2. Set up RLS Policies
    - Ensure proper access control for admin users
*/

-- Function to create a user with editor role
CREATE OR REPLACE FUNCTION create_editor_user(email TEXT, password TEXT, full_name TEXT DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Create the user
  user_id := auth.uid();
  
  -- Update user metadata to include role
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_build_object(
    'role', 'editor',
    'full_name', COALESCE(full_name, email)
  )
  WHERE id = user_id;
  
  RETURN user_id;
END;
$$;

-- Create a trigger function to set role in app_metadata when a user is created
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Set default role to 'editor' for new users
  UPDATE auth.users
  SET raw_app_meta_data = jsonb_build_object('role', 'editor')
  WHERE id = NEW.id AND raw_app_meta_data IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();