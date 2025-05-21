/*
  # Create API Keys Table
  
  1. New Tables
    - `api_keys` 
      - `id` (uuid, primary key)
      - `label` (text, description of the key)
      - `token` (text, unique, the actual API token)
      - `created_at` (timestamptz, when the key was created)
      - `active` (boolean, whether the key is active)
  
  2. Security
    - Enable RLS on `api_keys` table
    - Add policy for service role only
    - Add policy for authenticated users with 'editor' role to view keys
*/

-- Create the api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  token text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  active boolean DEFAULT true
);

-- Enable Row Level Security on api_keys table
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Policy for service role to have full access
CREATE POLICY "Service can manage api_keys"
  ON api_keys
  USING (auth.jwt() ->> 'role' = 'service');

-- Policy to allow editors to view keys but not modify them
CREATE POLICY "Editors can view api_keys"
  ON api_keys
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'editor');