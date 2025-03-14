/*
  # Add history_id to leads table

  1. Changes
    - Add history_id column to leads table to track which generation history entry the lead came from
    - Add foreign key constraint to ensure referential integrity
*/

-- Add history_id column
ALTER TABLE leads 
ADD COLUMN history_id uuid REFERENCES lead_history(id);

-- Add index for better query performance
CREATE INDEX leads_history_id_idx ON leads(history_id);