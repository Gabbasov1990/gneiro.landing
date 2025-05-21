/*
  # Admin Access Setup
  
  1. Setup
    - Ensure proper user role management through triggers
    - Configure storage permissions
    - Set up role checking functions

  2. Security
    - Create proper role management for authentication
*/

-- First, make sure we're not duplicating policies
DO $$
BEGIN
  -- Clean up any existing duplicate policies to avoid errors
  DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated Users Can Upload" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated Users Can Update" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated Users Can Delete" ON storage.objects;
  DROP POLICY IF EXISTS "Public can view media" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own media" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own media" ON storage.objects;
  
  -- Drop existing trigger if it exists
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
END $$;

-- Create a trigger function to properly set up user metadata when a user is created
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Set up proper role in both user_metadata and app_metadata
  UPDATE auth.users
  SET 
    raw_app_meta_data = 
      CASE 
        WHEN raw_app_meta_data IS NULL THEN 
          jsonb_build_object('role', 'editor')
        ELSE 
          jsonb_set(COALESCE(raw_app_meta_data, '{}'::jsonb), '{role}', '"editor"')
      END,
    raw_user_meta_data = 
      CASE 
        WHEN raw_user_meta_data IS NULL THEN 
          jsonb_build_object('role', 'editor')
        ELSE 
          jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{role}', '"editor"')
      END
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply the trigger to auth.users for new registrations
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create the media bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for media files
CREATE POLICY "Public Media Access" 
ON storage.objects
FOR SELECT
USING (bucket_id = 'media');

CREATE POLICY "Auth Upload Media" 
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'media' AND
  (auth.role() = 'authenticated' OR auth.role() = 'anon')
);

CREATE POLICY "Auth Update Media" 
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'media' AND
  (auth.role() = 'authenticated' OR auth.role() = 'anon')
);

CREATE POLICY "Auth Delete Media" 
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'media' AND
  (auth.role() = 'authenticated' OR auth.role() = 'anon')
);

-- Create helper functions for role checking
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE 
      id = auth.uid() AND
      (
        (raw_app_meta_data->>'role' = 'admin') OR
        (raw_user_meta_data->>'role' = 'admin')
      )
  );
$$;

CREATE OR REPLACE FUNCTION is_editor()
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE 
      id = auth.uid() AND
      (
        (raw_app_meta_data->>'role' = 'editor') OR
        (raw_user_meta_data->>'role' = 'editor') OR
        (raw_app_meta_data->>'role' = 'admin') OR
        (raw_user_meta_data->>'role' = 'admin')
      )
  );
$$;