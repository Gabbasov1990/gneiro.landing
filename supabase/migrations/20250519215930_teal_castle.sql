/*
  # Storage and Admin User Setup
  
  1. Storage Configuration
    - Creates 'media' bucket for storing images and files
    - Sets up proper RLS policies for public read and authenticated write
  
  2. Admin User Setup
    - Creates a trigger to auto-assign editor role to new users
    - Updates existing users to ensure they have proper metadata
*/

-- First, create the media bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies with IF NOT EXISTS to prevent duplicates
DO $$
BEGIN
  -- Allow public read access to media bucket
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Public Read Access'
  ) THEN
    CREATE POLICY "Public Read Access" 
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'media');
  END IF;

  -- Allow authenticated upload to media bucket
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Authenticated Users Can Upload'
  ) THEN
    CREATE POLICY "Authenticated Users Can Upload" 
    ON storage.objects
    FOR INSERT
    WITH CHECK (
      bucket_id = 'media' AND
      auth.role() = 'authenticated'
    );
  END IF;

  -- Allow authenticated update of media files
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Authenticated Users Can Update'
  ) THEN
    CREATE POLICY "Authenticated Users Can Update" 
    ON storage.objects
    FOR UPDATE
    USING (
      bucket_id = 'media' AND
      auth.role() = 'authenticated'
    );
  END IF;

  -- Allow authenticated deletion of media files
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Authenticated Users Can Delete'
  ) THEN
    CREATE POLICY "Authenticated Users Can Delete" 
    ON storage.objects
    FOR DELETE
    USING (
      bucket_id = 'media' AND
      auth.role() = 'authenticated'
    );
  END IF;
END $$;

-- Create a trigger function to set up proper metadata for new users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Set editor role in app_metadata for new users
  UPDATE auth.users
  SET raw_app_meta_data = 
    CASE 
      WHEN raw_app_meta_data IS NULL THEN 
        jsonb_build_object('role', 'editor')
      ELSE 
        jsonb_set(raw_app_meta_data, '{role}', '"editor"')
    END
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply the trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Setup initial admin user function - safe to call even if the user already exists
CREATE OR REPLACE FUNCTION setup_initial_admin() 
RETURNS void AS $$
DECLARE
  _email text := 'admin@example.com';
  _password text := 'admin123';
  _user_exists boolean;
  _user_id uuid;
BEGIN
  -- Check if the user already exists
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = _email
  ) INTO _user_exists;
  
  -- If user doesn't exist, try to create them through auth.users direct insertion
  -- Note: This is a fallback approach and might not work in all Supabase configurations
  IF NOT _user_exists THEN
    BEGIN
      INSERT INTO auth.users (
        email,
        raw_app_meta_data,
        raw_user_meta_data,
        encrypted_password,
        email_confirmed_at
      ) VALUES (
        _email,
        jsonb_build_object('role', 'editor'),
        jsonb_build_object('full_name', 'Admin User'),
        crypt(_password, gen_salt('bf')),
        now()
      )
      RETURNING id INTO _user_id;
    EXCEPTION WHEN OTHERS THEN
      -- Silently catch errors (user might already exist or be created during execution)
      NULL;
    END;
  END IF;
  
  -- Ensure existing admin user has the correct role
  UPDATE auth.users
  SET 
    raw_app_meta_data = jsonb_build_object('role', 'editor'),
    raw_user_meta_data = 
      CASE WHEN raw_user_meta_data IS NULL 
        THEN jsonb_build_object('full_name', 'Admin User')
        ELSE jsonb_set(raw_user_meta_data, '{full_name}', '"Admin User"')
      END
  WHERE email = _email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the setup admin function
SELECT setup_initial_admin();

-- Drop the temporary function
DROP FUNCTION setup_initial_admin();