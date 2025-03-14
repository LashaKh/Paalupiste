/*
  # Add notes column to leads table

  1. Changes
    - Add `notes` column to `leads` table for storing lead-related notes
    - Column is nullable and defaults to empty string
    - Add index on notes column for faster searching
*/

-- Add notes column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'notes'
  ) THEN
    ALTER TABLE leads ADD COLUMN notes text DEFAULT '';
  END IF;
END $$;

-- Add index for notes column
CREATE INDEX IF NOT EXISTS leads_notes_idx ON leads USING gin(to_tsvector('english', notes));