/*
  # Add content field to brochures table

  1. Changes
    - Add content field to brochures table if it doesn't exist
*/

-- Add content field if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'brochures' AND column_name = 'content'
  ) THEN
    ALTER TABLE brochures ADD COLUMN content text NOT NULL DEFAULT '';
  END IF;
END $$;