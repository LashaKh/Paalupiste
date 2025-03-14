/*
  # Update leads table columns

  1. Changes
    - Add missing columns
    - Rename columns to match frontend naming convention
    - Preserve existing data
*/

-- First add any missing columns with temporary names
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS company_address text,
  ADD COLUMN IF NOT EXISTS company_description text,
  ADD COLUMN IF NOT EXISTS decision_maker_name text,
  ADD COLUMN IF NOT EXISTS decision_maker_title text,
  ADD COLUMN IF NOT EXISTS decision_maker_email text,
  ADD COLUMN IF NOT EXISTS decision_maker_linkedin text,
  ADD COLUMN IF NOT EXISTS last_contact_date timestamptz,
  ADD COLUMN IF NOT EXISTS notes text;

-- Now rename columns to match frontend naming convention
ALTER TABLE leads 
  RENAME COLUMN company_name TO "companyName";

ALTER TABLE leads 
  RENAME COLUMN company_address TO "companyAddress";

ALTER TABLE leads 
  RENAME COLUMN company_description TO "companyDescription";

ALTER TABLE leads 
  RENAME COLUMN decision_maker_name TO "decisionMakerName";

ALTER TABLE leads 
  RENAME COLUMN decision_maker_title TO "decisionMakerTitle";

ALTER TABLE leads 
  RENAME COLUMN decision_maker_email TO "decisionMakerEmail";

ALTER TABLE leads 
  RENAME COLUMN decision_maker_linkedin TO "decisionMakerLinkedIn";

ALTER TABLE leads 
  RENAME COLUMN last_contact_date TO "lastContactDate";