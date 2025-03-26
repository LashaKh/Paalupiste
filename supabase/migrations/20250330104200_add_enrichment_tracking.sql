/*
  # Add enrichment tracking to lead_history table

  1. Changes
    - Add enrichment_status column to track enrichment progress
    - Add enrichment_timestamp column to track when enrichment was performed
    - Add enrichment_count column to track how many times enrichment was attempted
*/

-- Add enrichment_status column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lead_history' AND column_name = 'enrichment_status'
  ) THEN
    ALTER TABLE lead_history ADD COLUMN enrichment_status text DEFAULT 'not_started';
  END IF;
END $$;

-- Add enrichment_timestamp column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lead_history' AND column_name = 'enrichment_timestamp'
  ) THEN
    ALTER TABLE lead_history ADD COLUMN enrichment_timestamp timestamptz;
  END IF;
END $$;

-- Add enrichment_count column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lead_history' AND column_name = 'enrichment_count'
  ) THEN
    ALTER TABLE lead_history ADD COLUMN enrichment_count integer DEFAULT 0;
  END IF;
END $$; 