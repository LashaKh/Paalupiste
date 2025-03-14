/*
  # Add priority column to leads table

  1. Changes
    - Add priority column with default value and check constraint
*/

-- Add priority column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'priority'
  ) THEN
    ALTER TABLE leads ADD COLUMN priority text CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium';
  END IF;
END $$;