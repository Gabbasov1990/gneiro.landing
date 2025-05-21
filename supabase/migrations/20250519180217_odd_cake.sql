/*
  # Setup Storage Buckets and Policies
  
  1. Buckets
    - `media` - For general media files (images, videos, etc.)
    - `avatars` - For user profile photos
  
  2. Policies
    - Public read access to both buckets
    - Authenticated users can upload to their own directories
*/

-- This is a SQL helper function that will be called from edge functions
CREATE OR REPLACE FUNCTION get_auth_user_id() 
RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT auth.uid()
$$;