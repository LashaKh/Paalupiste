/*
  # Add Brochures Table

  1. New Tables
    - `brochures`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `description` (text)
      - `template_id` (text)
      - `pdf_url` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `brochures` table
    - Add policies for authenticated users to manage their own brochures
*/

-- Create brochures table
CREATE TABLE IF NOT EXISTS brochures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  template_id text NOT NULL,
  pdf_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE brochures ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_brochures_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_brochures_updated_at
  BEFORE UPDATE ON brochures
  FOR EACH ROW
  EXECUTE FUNCTION update_brochures_updated_at();

-- Create policies
CREATE POLICY "Users can read own brochures"
  ON brochures
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create brochures"
  ON brochures
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brochures"
  ON brochures
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own brochures"
  ON brochures
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);