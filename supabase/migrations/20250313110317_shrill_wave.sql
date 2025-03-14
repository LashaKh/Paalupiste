/*
  # Add text search index and update social posts table

  1. Changes
    - Add text search index for content field
    - Add comment for content field
    - Add trigger for content updates
*/

-- Add text search index for content
CREATE INDEX IF NOT EXISTS content_table_social_posts_content_idx 
  ON content_table_social_posts USING gin(to_tsvector('english', content));

-- Add comment for content field
COMMENT ON COLUMN content_table_social_posts.content IS 
  'The main text content of the social media post';

-- Create function to handle content updates
CREATE OR REPLACE FUNCTION update_content_table_social_posts_content()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for content updates
CREATE TRIGGER update_content_table_social_posts_content
  BEFORE UPDATE OF content ON content_table_social_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_content_table_social_posts_content();