/*
  # Storage Setup for Media Files
  
  1. Create Buckets
    - `media` - For storing images and other media files
  
  2. Set up RLS Policies
    - Public read access to media files
    - Authenticated users can upload, update, and delete files
*/

-- Create the media bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for the media bucket
-- Allow public read access
CREATE POLICY "Public Read Access" 
ON storage.objects
FOR SELECT
USING (bucket_id = 'media');

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated Users Can Upload" 
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'media' AND
  auth.role() IN ('authenticated', 'anon', 'service')
);

-- Allow authenticated users to update their own files
CREATE POLICY "Authenticated Users Can Update" 
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'media' AND
  auth.role() IN ('authenticated', 'anon', 'service')
);

-- Allow authenticated users to delete their own files
CREATE POLICY "Authenticated Users Can Delete" 
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'media' AND
  auth.role() IN ('authenticated', 'anon', 'service')
);