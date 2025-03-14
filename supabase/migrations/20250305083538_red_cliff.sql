/*
  # Create leads table with policy checks

  1. New Tables
    - `leads`
      - `id` (uuid, primary key)
      - `company_name` (text)
      - `company_address` (text)
      - `company_description` (text)
      - `decision_maker_name` (text)
      - `decision_maker_title` (text)
      - `decision_maker_email` (text)
      - `decision_maker_linkedin` (text)
      - `status` (text)
      - `priority` (text)
      - `last_contact_date` (timestamptz)
      - `notes` (text)
      - `user_id` (uuid, foreign key)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `leads` table if not already enabled
    - Add policies for authenticated users to manage their own leads
*/

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  company_address text,
  company_description text,
  decision_maker_name text,
  decision_maker_title text,
  decision_maker_email text,
  decision_maker_linkedin text,
  status text CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')) DEFAULT 'new',
  priority text CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  last_contact_date timestamptz,
  notes text,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can read own leads" ON leads;
  DROP POLICY IF EXISTS "Users can create leads" ON leads;
  DROP POLICY IF EXISTS "Users can update own leads" ON leads;
  DROP POLICY IF EXISTS "Users can delete own leads" ON leads;
END $$;

-- Create policies
CREATE POLICY "Users can read own leads"
  ON leads
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create leads"
  ON leads
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leads"
  ON leads
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own leads"
  ON leads
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create or replace updated_at trigger
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_leads_updated_at();