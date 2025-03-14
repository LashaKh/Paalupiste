/*
  # Add article outlines table

  1. New Tables
    - `article_outlines`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `description` (text)
      - `content` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on `article_outlines` table
    - Add policies for authenticated users to manage their outlines
*/

CREATE TABLE IF NOT EXISTS article_outlines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE article_outlines ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_article_outlines_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_article_outlines_updated_at
  BEFORE UPDATE ON article_outlines
  FOR EACH ROW
  EXECUTE FUNCTION update_article_outlines_updated_at();

-- Create policies
CREATE POLICY "Users can read own outlines"
  ON article_outlines
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create outlines"
  ON article_outlines
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own outlines"
  ON article_outlines
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own outlines"
  ON article_outlines
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);