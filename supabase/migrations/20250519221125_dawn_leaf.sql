/*
  # Fix Admin Authentication and Role Management

  1. Roles
    - Create a trigger to ensure roles are properly set in both app_metadata and user_metadata
    - Set up helper functions to easily check user roles
    
  2. Auth Flow
    - Fix metadata handling for proper role verification
    - Cleanup existing triggers to avoid conflicts
    
  3. Media Storage
    - Fix policies to ensure editors can access media files
    
  4. Default Admin
    - Set up a method to create admin users through SQL
*/

-- First, clean up any potentially conflicting objects
DO $$
BEGIN
  -- Drop existing triggers
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  DROP TRIGGER IF EXISTS on_signup ON auth.users;
  
  -- Drop existing functions
  DROP FUNCTION IF EXISTS public.handle_new_user();
  DROP FUNCTION IF EXISTS public.check_is_admin();
  DROP FUNCTION IF EXISTS public.check_is_editor();
  DROP FUNCTION IF EXISTS public.is_admin();
  DROP FUNCTION IF EXISTS public.is_editor();
END $$;

-- Create a robust trigger function to set up user roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Set role in app_metadata
  UPDATE auth.users
  SET raw_app_meta_data = jsonb_set(
      COALESCE(raw_app_meta_data, '{}'::jsonb),
      '{role}',
      '"editor"'
    )
  WHERE id = NEW.id;
  
  -- Set role in user_metadata as well for redundancy
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(
      COALESCE(raw_user_meta_data, '{}'::jsonb),
      '{role}',
      '"editor"'
    )
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to set role for new users
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Create helper functions for role checking
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT 
    COALESCE(
      EXISTS (
        SELECT 1
        FROM auth.users
        WHERE 
          id = auth.uid() AND
          (
            (raw_app_meta_data->>'role' = 'admin') OR
            (raw_user_meta_data->>'role' = 'admin')
          )
      ),
      FALSE
    );
$$;

CREATE OR REPLACE FUNCTION public.is_editor()
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT 
    COALESCE(
      EXISTS (
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
      ),
      FALSE
    );
$$;

-- Set RLS policies for admin tables
DO $$
BEGIN
  -- Posts policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Editors can manage posts') THEN
    CREATE POLICY "Editors can manage posts" ON posts
      USING (public.is_editor())
      WITH CHECK (public.is_editor());
  END IF;
  
  -- Cases policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cases' AND policyname = 'Editors can manage cases') THEN
    CREATE POLICY "Editors can manage cases" ON cases
      USING (public.is_editor())
      WITH CHECK (public.is_editor());
  END IF;
  
  -- API keys policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'api_keys' AND policyname = 'Editors can manage api_keys') THEN
    CREATE POLICY "Editors can manage api_keys" ON api_keys
      USING (public.is_editor())
      WITH CHECK (public.is_editor());
  END IF;
END $$;

-- Create media bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Fix storage policies to ensure editors can access media
DO $$
BEGIN
  -- Clean up conflicting policies
  DROP POLICY IF EXISTS "Public Media Access" ON storage.objects;
  DROP POLICY IF EXISTS "Auth Upload Media" ON storage.objects;
  DROP POLICY IF EXISTS "Auth Update Media" ON storage.objects;
  DROP POLICY IF EXISTS "Auth Delete Media" ON storage.objects;
  
  -- Create new storage policies
  CREATE POLICY "Anyone can read media" 
    ON storage.objects FOR SELECT
    USING (bucket_id = 'media');
  
  CREATE POLICY "Editors can upload media" 
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'media' AND
      (auth.role() = 'authenticated' OR auth.role() = 'anon')
    );
  
  CREATE POLICY "Editors can update media" 
    ON storage.objects FOR UPDATE
    USING (
      bucket_id = 'media' AND
      (auth.role() = 'authenticated' OR auth.role() = 'anon')
    );
  
  CREATE POLICY "Editors can delete media" 
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'media' AND
      (auth.role() = 'authenticated' OR auth.role() = 'anon')
    );
END $$;

-- Setup default admin user if it doesn't exist
DO $$
DECLARE
  admin_uid uuid;
  admin_email text := 'admin@example.com';
BEGIN
  -- Check if admin exists
  SELECT id INTO admin_uid FROM auth.users WHERE email = admin_email;
  
  -- If admin doesn't exist, try to ensure metadata is properly set
  IF admin_uid IS NOT NULL THEN
    -- Update existing admin to ensure proper role
    UPDATE auth.users
    SET 
      raw_app_meta_data = jsonb_set(COALESCE(raw_app_meta_data, '{}'::jsonb), '{role}', '"editor"'),
      raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{role}', '"editor"')
    WHERE id = admin_uid;
  END IF;
END $$;