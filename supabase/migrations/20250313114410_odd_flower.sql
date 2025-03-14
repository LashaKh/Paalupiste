/*
  # Add content field to content_table_newsletters

  1. Changes
    - Add content field to content_table_newsletters table
    - Make content field required with empty default
    - Add text search index for content field
    - Add trigger for content updates
*/

-- Add content field if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'content_table_newsletters' AND column_name = 'content'
  ) THEN
    ALTER TABLE content_table_newsletters ADD COLUMN content text NOT NULL DEFAULT '';
  END IF;
END $$;

-- Add text search index for content
CREATE INDEX IF NOT EXISTS content_table_newsletters_content_idx 
  ON content_table_newsletters USING gin(to_tsvector('english', content));

-- Add comment for content field
COMMENT ON COLUMN content_table_newsletters.content IS 
  'The main body content of the newsletter';

-- Create function to handle content updates
CREATE OR REPLACE FUNCTION update_content_table_newsletters_content()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for content updates
CREATE TRIGGER update_content_table_newsletters_content
  BEFORE UPDATE OF content ON content_table_newsletters
  FOR EACH ROW
  EXECUTE FUNCTION update_content_table_newsletters_content();