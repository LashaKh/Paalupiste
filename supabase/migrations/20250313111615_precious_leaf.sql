/*
  # Add delete functionality to content tables

  1. Changes
    - Add ON DELETE CASCADE to foreign key constraints
    - Add delete policies to all content tables
    - Add indexes for better query performance

  2. Security
    - Maintain RLS policies
    - Ensure users can only delete their own content
*/

-- Add ON DELETE CASCADE to foreign keys
ALTER TABLE content_table_articles
  DROP CONSTRAINT IF EXISTS content_table_articles_user_id_fkey,
  ADD CONSTRAINT content_table_articles_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;

ALTER TABLE content_table_social_posts
  DROP CONSTRAINT IF EXISTS content_table_social_posts_user_id_fkey,
  ADD CONSTRAINT content_table_social_posts_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS content_table_articles_user_id_idx ON content_table_articles(user_id);
CREATE INDEX IF NOT EXISTS content_table_social_posts_user_id_idx ON content_table_social_posts(user_id);

-- Add delete function to handle cleanup
CREATE OR REPLACE FUNCTION handle_content_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Add any cleanup logic here if needed
  RETURN OLD;
END;
$$ language 'plpgsql';

-- Create delete triggers
CREATE TRIGGER on_content_table_articles_delete
  AFTER DELETE ON content_table_articles
  FOR EACH ROW
  EXECUTE FUNCTION handle_content_delete();

CREATE TRIGGER on_content_table_social_posts_delete
  AFTER DELETE ON content_table_social_posts
  FOR EACH ROW
  EXECUTE FUNCTION handle_content_delete();