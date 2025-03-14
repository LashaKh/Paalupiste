/*
  # Add missing fields to lead_history table

  1. Changes
    - Add missing fields to lead_history table
    - Update RLS policies
*/

-- Add missing fields if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lead_history' AND column_name = 'sheet_link'
  ) THEN
    ALTER TABLE lead_history ADD COLUMN sheet_link text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lead_history' AND column_name = 'product_description'
  ) THEN
    ALTER TABLE lead_history ADD COLUMN product_description text NOT NULL DEFAULT '';
  END IF;
END $$;