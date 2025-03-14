/*
  # Add delete policy for lead history

  1. Changes
    - Add policy to allow users to delete their own history entries
*/

CREATE POLICY "Users can delete own lead history"
  ON lead_history
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);