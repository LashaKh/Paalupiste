/*
  # Add index for is_approved column

  1. Changes
    - Add index on is_approved column for faster filtering and sorting
    - Add comment to explain the column's purpose
    - Add trigger to update updated_at on toggle

  2. Notes
    - Index will improve performance when filtering by approval status
    - Comment helps document the column's intended use
*/

-- Add index for is_approved column
CREATE INDEX IF NOT EXISTS content_table_articles_is_approved_idx ON content_table_articles(is_approved);

-- Add comment to explain column purpose
COMMENT ON COLUMN content_table_articles.is_approved IS 'Indicates whether the article has been approved for publication';

-- Create function to update updated_at on toggle
CREATE OR REPLACE FUNCTION update_content_table_articles_toggle_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_approved IS DISTINCT FROM NEW.is_approved THEN
    NEW.updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update timestamp on toggle
CREATE TRIGGER update_content_table_articles_toggle
  BEFORE UPDATE OF is_approved ON content_table_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_content_table_articles_toggle_timestamp();