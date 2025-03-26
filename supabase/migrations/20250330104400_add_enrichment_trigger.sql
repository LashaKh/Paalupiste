/*
  # Add trigger for updating enrichment count

  1. Changes
    - Add a trigger function to increment the enrichment_count when enrichment_status is updated
    - Add a trigger to call the function on update
*/

-- Create the trigger function
CREATE OR REPLACE FUNCTION update_enrichment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.enrichment_status IS DISTINCT FROM NEW.enrichment_status) AND NEW.enrichment_status = 'in_progress' THEN
    NEW.enrichment_count = COALESCE(OLD.enrichment_count, 0) + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER trigger_update_enrichment_count
BEFORE UPDATE ON lead_history
FOR EACH ROW
EXECUTE FUNCTION update_enrichment_count(); 