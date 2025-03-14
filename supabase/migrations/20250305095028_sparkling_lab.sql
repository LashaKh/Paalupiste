/*
  # Update leads table columns and constraints

  1. Changes
    - Add any missing columns with proper constraints
    - Update existing column constraints if needed
    - Skip columns that already exist
*/

-- Add or update status constraints
DO $$ 
BEGIN
  -- Status column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'status'
  ) THEN
    ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;
    ALTER TABLE leads ADD CONSTRAINT leads_status_check 
      CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost'));
  ELSE
    ALTER TABLE leads ADD COLUMN status text 
      CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')) 
      DEFAULT 'new';
  END IF;

  -- Priority column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'priority'
  ) THEN
    ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_priority_check;
    ALTER TABLE leads ADD CONSTRAINT leads_priority_check 
      CHECK (priority IN ('low', 'medium', 'high'));
  ELSE
    ALTER TABLE leads ADD COLUMN priority text 
      CHECK (priority IN ('low', 'medium', 'high')) 
      DEFAULT 'medium';
  END IF;

  -- Optional columns that might be missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'companyAddress'
  ) THEN
    ALTER TABLE leads ADD COLUMN "companyAddress" text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'companyDescription'
  ) THEN
    ALTER TABLE leads ADD COLUMN "companyDescription" text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'decisionMakerName'
  ) THEN
    ALTER TABLE leads ADD COLUMN "decisionMakerName" text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'decisionMakerTitle'
  ) THEN
    ALTER TABLE leads ADD COLUMN "decisionMakerTitle" text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'decisionMakerEmail'
  ) THEN
    ALTER TABLE leads ADD COLUMN "decisionMakerEmail" text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'decisionMakerLinkedIn'
  ) THEN
    ALTER TABLE leads ADD COLUMN "decisionMakerLinkedIn" text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'lastContactDate'
  ) THEN
    ALTER TABLE leads ADD COLUMN "lastContactDate" timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'notes'
  ) THEN
    ALTER TABLE leads ADD COLUMN notes text;
  END IF;
END $$;