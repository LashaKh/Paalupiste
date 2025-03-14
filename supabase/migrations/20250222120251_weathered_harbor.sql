/*
  # Add HTML content field to brochures table
  
  1. Changes
    - Add html_content field to store the generated HTML
    - Make html_content field required with empty default
  
  2. Notes
    - Using IF NOT EXISTS to prevent duplicate column errors
    - Setting NOT NULL constraint with DEFAULT to handle existing rows
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'brochures' AND column_name = 'html_content'
  ) THEN
    ALTER TABLE brochures ADD COLUMN html_content text NOT NULL DEFAULT '';
  END IF;
END $$;