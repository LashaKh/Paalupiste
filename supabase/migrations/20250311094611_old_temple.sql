/*
  # Update leads table schema

  1. Changes
    - Remove duplicate company description columns
    - Standardize on company_description column name
*/

DO $$ 
BEGIN
  -- Check if companyDescription column exists and drop it
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'companydescription'
  ) THEN
    ALTER TABLE leads DROP COLUMN companyDescription;
  END IF;

  -- Ensure company_description column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'company_description'
  ) THEN
    ALTER TABLE leads ADD COLUMN company_description text;
  END IF;
END $$;