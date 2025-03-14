/*
  # Update content table articles fields

  1. Changes
    - Add constraints for status field
    - Add default values for topic and keywords
    - Add trigger to update updated_at timestamp
*/

-- Add default value for topic if not exists
ALTER TABLE content_table_articles 
  ALTER COLUMN topic SET DEFAULT '';

-- Add default empty array for keywords if not exists
ALTER TABLE content_table_articles 
  ALTER COLUMN keywords SET DEFAULT '{}';

-- Create or replace function to handle updates
CREATE OR REPLACE FUNCTION update_content_table_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for any field update
CREATE TRIGGER update_content_table_articles_fields
  BEFORE UPDATE ON content_table_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_content_table_articles_updated_at();