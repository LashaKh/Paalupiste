/*
  # Add Additional Lead History Columns

  1. Changes
    - Add industries array column
    - Add company_size column
    - Add additional_industries column

  2. Details
    - industries: Stores array of target industries
    - company_size: Stores company size preference
    - additional_industries: Stores any additional industry notes
*/

-- Add industries array column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lead_history' AND column_name = 'industries'
  ) THEN
    ALTER TABLE lead_history ADD COLUMN industries text[] DEFAULT '{}';
  END IF;
END $$;

-- Add company_size column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lead_history' AND column_name = 'company_size'
  ) THEN
    -- Change type to text array
    ALTER TABLE lead_history ADD COLUMN company_size text[]; 
  ELSE
    -- If column exists, alter its type to text array
    ALTER TABLE lead_history ALTER COLUMN company_size TYPE text[] USING array[company_size];
  END IF;
END $$;

-- Add additional_industries column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lead_history' AND column_name = 'additional_industries'
  ) THEN
    ALTER TABLE lead_history ADD COLUMN additional_industries text;
  END IF;
END $$;