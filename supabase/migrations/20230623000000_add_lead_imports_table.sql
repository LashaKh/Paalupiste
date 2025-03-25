/*
  # Create lead imports management schema

  1. New Tables
    - `lead_imports`
      - `id` (uuid, primary key)
      - `name` (text) - The name of the import campaign
      - `source` (text) - Where the leads came from
      - `source_details` (jsonb) - Additional details about the source
      - `import_date` (timestamptz) - When the import happened
      - `lead_count` (integer) - Number of leads in this import
      - `notes` (text) - Any notes about this import
      - `tags` (text[]) - Tags for categorizing imports
      - `user_id` (uuid, references auth.users) - Who created this import
      - `history_id` (uuid, references lead_history) - Link to lead generation history if applicable
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Changes to `leads` table
    - Add `import_id` column referencing lead_imports table
    - Add index for improved query performance
    - Keep existing history_id for backward compatibility  

  3. Security
    - Enable RLS on `lead_imports` table
    - Add policies for users to manage their own imports
*/

-- Create lead_imports table
CREATE TABLE IF NOT EXISTS lead_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  source text NOT NULL,
  source_details jsonb DEFAULT '{}'::jsonb,
  import_date timestamptz DEFAULT now(),
  lead_count integer DEFAULT 0,
  notes text,
  tags text[] DEFAULT '{}',
  user_id uuid REFERENCES auth.users NOT NULL,
  history_id uuid REFERENCES lead_history(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add import_id column to leads table
ALTER TABLE leads 
ADD COLUMN import_id uuid REFERENCES lead_imports(id);

-- Add index for better query performance
CREATE INDEX leads_import_id_idx ON leads(import_id);

-- Enable RLS on lead_imports
ALTER TABLE lead_imports ENABLE ROW LEVEL SECURITY;

-- Create policies for lead_imports
CREATE POLICY "Users can read own lead imports"
  ON lead_imports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create lead imports"
  ON lead_imports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lead imports"
  ON lead_imports
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own lead imports"
  ON lead_imports
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger for lead_imports
CREATE OR REPLACE FUNCTION update_lead_imports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_lead_imports_updated_at
  BEFORE UPDATE ON lead_imports
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_imports_updated_at();

 