/*
  # Add Newsletter Outlines Table
  
  1. New Tables
    - `newsletter_outlines`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `description` (text)
      - `content` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `newsletter_outlines` table
    - Add policies for authenticated users to manage their own newsletters
*/

CREATE TABLE IF NOT EXISTS newsletter_outlines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE newsletter_outlines ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_newsletter_outlines_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_newsletter_outlines_updated_at
  BEFORE UPDATE ON newsletter_outlines
  FOR EACH ROW
  EXECUTE FUNCTION update_newsletter_outlines_updated_at();

-- Create policies
CREATE POLICY "Users can read own newsletters"
  ON newsletter_outlines
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create newsletters"
  ON newsletter_outlines
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own newsletters"
  ON newsletter_outlines
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own newsletters"
  ON newsletter_outlines
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);