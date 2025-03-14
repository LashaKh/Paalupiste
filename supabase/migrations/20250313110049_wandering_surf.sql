/*
  # Add editing capabilities to social posts table

  1. Changes
    - Add trigger for updating timestamps
    - Add trigger for approval toggle
    - Add index for approval status
*/

-- Create function to update updated_at on toggle
CREATE OR REPLACE FUNCTION update_content_table_social_posts_toggle_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_approved IS DISTINCT FROM NEW.is_approved THEN
    NEW.updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for approval toggle
CREATE TRIGGER update_content_table_social_posts_toggle
  BEFORE UPDATE OF is_approved ON content_table_social_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_content_table_social_posts_toggle_timestamp();

-- Add index for is_approved column
CREATE INDEX IF NOT EXISTS content_table_social_posts_is_approved_idx 
  ON content_table_social_posts(is_approved);

-- Add comment explaining is_approved column
COMMENT ON COLUMN content_table_social_posts.is_approved IS 
  'Indicates whether the social post has been approved for publishing';