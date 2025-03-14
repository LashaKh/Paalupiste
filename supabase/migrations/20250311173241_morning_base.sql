/*
  # Fix lead history deletion constraints

  1. Changes
    - Add ON DELETE SET NULL to leads.history_id foreign key
    - This allows deleting history entries without violating constraints
    - Leads will keep existing but have their history_id set to null

  2. Security
    - Maintains existing RLS policies
    - No changes to access control
*/

-- First drop the existing foreign key constraint
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_history_id_fkey;

-- Re-create the foreign key with ON DELETE SET NULL
ALTER TABLE leads
  ADD CONSTRAINT leads_history_id_fkey
  FOREIGN KEY (history_id)
  REFERENCES lead_history(id)
  ON DELETE SET NULL;