/*
  # Add connected_at timestamp to agents table
  
  1. Updates
    - Add connected_at timestamptz to agents table
    - Update the agents table to track when the agent is connected to WhatsApp
*/

-- Add connected_at column to agents table
ALTER TABLE agents ADD COLUMN IF NOT EXISTS connected_at timestamptz;

-- Modify fn_prepare_agent function to include chat_demo_token in metadata
CREATE OR REPLACE FUNCTION fn_prepare_agent()
RETURNS TRIGGER AS $$
BEGIN
  -- In a real implementation, this would call an external service
  -- For now, we'll simulate by setting values directly
  
  -- Generate a demo QR code and chat token
  UPDATE agents
  SET 
    whatsapp_qr = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAABRRIOnAAAAAXNSR0IArs4c6QAAA5FJREFUeF7t3UFuwzAMBVDm/oeePUBXXRAw3JpfSlYWfR2aFKX42GKmr+/v7+8vfwgQCAJCBAISECISkQCEiEQlIEQkIgEhIhEJQIhIVAJCRCISgBCRqASEiEQkACEiUQkIEYlIAEJEohIQIhKRAISIRCUgRCQiAQgRiUpAiEhEAhAiEpXAZYiv53OvX6/Xn/+pSthP/ZYC+7z3j99r27a0XrpOuo8PASEEwZEAhOAIByE4wkEIjnAQgiMchOAIByE4wkEIjnAQgiMchOAIByE4wkEIjnAQgiMchOAIByE4wkEIjnAQgiMchOAIByE4wjkshPbSUWBX/Frf7Vq6V7pOWq3d9/U+9/ps17nik54fAmtwQuSHRQghMlIjI1pBCCFEJCBEJCoBISIRCUCISFQCQkQiEoAQkagEhIhEJAAhIlEJCBGJSABCRKISkBuL6VuLy08Z7XvfleL4f3vPVwgZQmiHhBB9HwjRZ3Xpld8yLsW3aGMZomcVIXqsLr0CIXr4ZYgeq0uvQIgefiF6rC69ct5vGVqItTOh1u+npXV6/v7R0d5Tu8r9z/cRQogMASEiUQkIEYlIAEJEohIQIhKRAISIRCUgRCQiAQgRiUpAiEhEAhAiEpWAEJGIBCBEJCoBISIRCUCISFQCQkQiEoAQkagEhIhEJCCf3zsiHYEtWIXdz+v5R0dbxNvnav9Zvvb8KwYZQrSHPkIgRCQiAQgRiUpAiEhEAhAiEpWAEJGIBCBEJCoBISIRCUCISFQCQkQiEoAQkagEhIhEJAAhIlEJCBGJSABCRKISkCGE9g+npX9qv9o92/UunyHSYE+7jhA9shCix+rSKxCih1+GiKzu+i0DIbSHRIYQIpKUgBCRpASEiCQlIEQkKQEhIkkJCBFJSkCISFICQkSSEhAikpSAEJGkBISIJCUgRCQpASEiSQkIEUlKQIhIUgJCRJISECKSlMDjkb6V1f6h0pHr3bCUDCFaKAjR92FZCIToD8FyhixD9KhCiB6rS6+cN0O0i7b/zDtdJ83e6Z/l7/tI9z1vhkiGEEJkCEIIjsNDCI5wEIIjHITgCAchOMJBCI5wEIIjHITgCAchOMJBCI5wEIIjHITgCAchOMJBCI5wEIIjHITgCAchOMJBCI5wDgsRHbNvIpD+EwYhckQgQERJhsgQGUJwHB5CcISTITjCQQiOcBCCIxyE4AgHITjC+QEAAf8A6GcogAAAAABJRU5ErkJggg==',
    status = 'ready',
    metadata = jsonb_build_object(
      'chat_demo_token', encode(gen_random_bytes(16), 'hex')
    )
  WHERE id = NEW.id;
  
  -- In a real implementation, you would call an Edge Function here
  -- PERFORM http.post(
  --   url := 'https://gneiro.com/functions/prepare-agent',
  --   body := json_build_object('agent_id', NEW.id)
  -- );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;