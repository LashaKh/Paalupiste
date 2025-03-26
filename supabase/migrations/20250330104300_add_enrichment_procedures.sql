/*
  # Add stored procedures for enrichment tracking

  1. Changes
    - Add increment_enrichment_count function to safely increment the count
*/

-- Create the stored procedure for incrementing enrichment count
CREATE OR REPLACE FUNCTION increment_enrichment_count(row_id UUID)
RETURNS INTEGER AS $$
DECLARE
  current_count INTEGER;
BEGIN
  SELECT COALESCE(enrichment_count, 0) INTO current_count
  FROM lead_history
  WHERE id = row_id;
  
  RETURN current_count + 1;
END;
$$ LANGUAGE plpgsql; 