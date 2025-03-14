/*
  # Add status column to leads table

  1. Changes
    - Add status column with default value and check constraint
*/

-- Add status column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'status'
  ) THEN
    ALTER TABLE leads ADD COLUMN status text CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')) DEFAULT 'new';
  END IF;
END $$;