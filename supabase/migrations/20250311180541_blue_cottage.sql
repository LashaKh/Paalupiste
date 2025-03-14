/*
  # Add notes column to leads table

  1. Changes
    - Add `notes` column to `leads` table for storing user comments and observations
    - Column is optional (nullable) and supports multiple lines of text
    - Add a text search index on the notes column for efficient searching

  2. Security
    - No changes to RLS policies needed as existing policies cover the new column
*/

-- Add notes column to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS notes text;

-- Create a text search index on the notes column for efficient searching
CREATE INDEX IF NOT EXISTS leads_notes_idx ON leads USING gin(to_tsvector('english', notes));

-- Add a comment to the column
COMMENT ON COLUMN leads.notes IS 'User comments and observations about the lead';