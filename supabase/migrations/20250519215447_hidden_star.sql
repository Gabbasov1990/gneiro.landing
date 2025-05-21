-- Create the media bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Create access policies for the bucket
BEGIN;

-- Allow public to read files in the media bucket
CREATE POLICY "Public can view media" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'media');

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload media" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'media' AND 
  auth.role() = 'authenticated'
);

-- Allow users to update their own files
CREATE POLICY "Users can update their own media" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'media' AND 
  auth.role() = 'authenticated'
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own media" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'media' AND 
  auth.role() = 'authenticated'
);

COMMIT;