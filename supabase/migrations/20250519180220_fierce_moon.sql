/*
  # Create View Count Functions
  
  1. New Functions
    - `increment_post_view(post_slug)` - Increments the view count for a post
    - `increment_case_view(case_slug)` - Increments the view count for a case study
  
  2. Security
    - Functions available to the anonymous role
*/

-- Function to increment post views
CREATE OR REPLACE FUNCTION increment_post_view(post_slug TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE posts
  SET views = views + 1
  WHERE slug = post_slug;
END;
$$;

-- Function to increment case views
CREATE OR REPLACE FUNCTION increment_case_view(case_slug TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE cases
  SET views = views + 1
  WHERE slug = case_slug;
END;
$$;

-- Grant public access to these functions
GRANT EXECUTE ON FUNCTION increment_post_view(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION increment_case_view(TEXT) TO anon;