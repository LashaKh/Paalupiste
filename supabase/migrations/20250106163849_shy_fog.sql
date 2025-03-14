/*
  # Add sheet_id column to lead_history

  1. Changes
    - Add sheet_id column to lead_history table
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lead_history' AND column_name = 'sheet_id'
  ) THEN
    ALTER TABLE lead_history ADD COLUMN sheet_id text;
  END IF;
END $$;