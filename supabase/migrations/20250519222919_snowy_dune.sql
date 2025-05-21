/*
  # Create agents table for AI assistant onboarding

  1. New Table
    - `agents`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `company_name` (text)
      - `bot_name` (text)
      - `tone` (text)
      - `no_answer_phrase` (text)
      - `goal` (text)
      - `dialog_flow` (jsonb)
      - `ig_url` (text)
      - `website_url` (text)
      - `docs_paths` (text[])
      - `status` (text, default 'configuring')
      - `whatsapp_qr` (text)
      - `created_at` (timestamp with time zone)
   
  2. Security
    - Enable RLS on the agents table
    - Add policy for authenticated users to manage their own agents
*/

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  bot_name text NOT NULL,
  tone text,
  no_answer_phrase text,
  goal text,
  dialog_flow jsonb DEFAULT '[]'::jsonb,
  ig_url text,
  website_url text,
  docs_paths text[],
  status text DEFAULT 'configuring',
  whatsapp_qr text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to manage their own agents
CREATE POLICY "Users can manage their own agents"
  ON agents
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Function that triggers agent setup after creation
CREATE OR REPLACE FUNCTION fn_prepare_agent()
RETURNS TRIGGER AS $$
BEGIN
  -- This would normally call an external service or edge function
  -- For now, we'll simulate the setup process with a delayed status update
  
  -- In a real implementation, this would start a background process
  -- to prepare the agent (ingest data, configure AI, etc.)
  -- and later update the status to 'ready'
  
  -- For demo purposes, we'll just set a QR code placeholder
  UPDATE agents
  SET whatsapp_qr = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAABRRIOnAAAAAXNSR0IArs4c6QAAA5FJREFUeF7t3UFuwzAMBVDm/oeePUBXXRAw3JpfSlYWfR2aFKX42GKmr+/v7+8vfwgQCAJCBAISECISkQCEiEQlIEQkIgEhIhEJQIhIVAJCRCISgBCRqASEiEQkACEiUQkIEYlIAEJEohIQIhKRAISIRCUgRCQiAQgRiUpAiEhEAhAiEpXAZYiv53OvX6/Xn/+pSthP/ZYC+7z3j99r27a0XrpOuo8PASEEwZEAhOAIByE4wkEIjnAQgiMchOAIByE4wkEIjnAQgiMchOAIByE4wkEIjnAQgiMchOAIByE4wkEIjnAQgiMchOAIByE4wjkshPbSUWBX/Frf7Vq6V7pOWq3d9/U+9/ps17nik54fAmtwQuSHRQghMlIjI1pBCCFEJCBEJCoBISIRCUCISFQCQkQiEoAQkagEhIhEJAAhIlEJCBGJSABCRKISkBuL6VuLy08Z7XvfleL4f3vPVwgZQmiHhBB9HwjRZ3Xpld8yLsW3aGMZomcVIXqsLr0CIXr4ZYgeq0uvQIgefiF6rC69ct5vGVqItTOh1u+npXV6/v7R0d5Tu8r9z/cRQogMASEiUQkIEYlIAEJEohIQIhKRAISIRCUgRCQiAQgRiUpAiEhEAhAiEpWAEJGIBCBEJCoBISIRCUCISFQCQkQiEoAQkagEhIhEJCCf3zsiHYEtWIXdz+v5R0dbxNvnav9Zvvb8KwYZQrSHPkIgRCQiAQgRiUpAiEhEAhAiEpWAEJGIBCBEJCoBISIRCUCISFQCQkQiEoAQkagEhIhEJAAhIlEJCBGJSABCRKISkCGE9g+npX9qv9o92/UunyHSYE+7jhA9shCix+rSKxCih1+GiKzu+i0DIbSHRIYQIpKUgBCRpASEiCQlIEQkKQEhIkkJCBFJSkCISFICQkSSEhAikpSAEJGkBISIJCUgRCQpASEiSQkIEUlKQIhIUgJCRJISECKSlMDjkb6V1f6h0pHr3bCUDCFaKAjR92FZCIToD8FyhixD9KhCiB6rS6+cN0O0i7b/zDtdJ83e6Z/l7/tI9z1vhkiGEEJkCEIIjsNDCI5wEIIjHITgCAchOMJBCI5wEIIjHITgCAchOMJBCI5wEIIjHITgCAchOMJBCI5wEIIjHITgCAchOMJBCI5wDgsRHbNvIpD+EwYhckQgQERJhsgQGUJwHB5CcISTITjCQQiOcBCCIxyE4AgHITjC+QEAAf8A6GcogAAAAABJRU5ErkJggg==',
      status = 'ready'
  WHERE id = NEW.id;
  
  -- For a real implementation, you would call an Edge Function here
  -- PERFORM http.post(
  --   url := 'https://gneiro.com/functions/prepare-agent',
  --   body := json_build_object('agent_id', NEW.id)
  -- );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call fn_prepare_agent after an agent is inserted
CREATE TRIGGER trigger_prepare_agent
  AFTER INSERT ON agents
  FOR EACH ROW
  EXECUTE FUNCTION fn_prepare_agent();