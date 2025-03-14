/*
  # Add company description field to leads table

  1. Changes
    - Add company_description column to leads table
    - Ensure RLS policies are preserved
*/

-- Add company_description column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'company_description'
  ) THEN
    ALTER TABLE leads ADD COLUMN company_description text;
  END IF;
END $$;