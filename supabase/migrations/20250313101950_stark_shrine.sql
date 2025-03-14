/*
  # Add content table articles schema

  1. New Tables
    - `content_table_articles`
      - `id` (uuid, primary key)
      - `title` (text)
      - `topic` (text)
      - `status` (text)
      - `link` (text)
      - `keywords` (text[])
      - `meta_description` (text)
      - `featured_image` (text)
      - `is_approved` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `user_id` (uuid, references auth.users)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS content_table_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  topic text,
  status text CHECK (status IN ('Draft', 'Ready', 'Published')) DEFAULT 'Draft',
  link text,
  keywords text[],
  meta_description text,
  featured_image text,
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users NOT NULL
);

-- Enable RLS
ALTER TABLE content_table_articles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own content table articles"
  ON content_table_articles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create content table articles"
  ON content_table_articles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own content table articles"
  ON content_table_articles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own content table articles"
  ON content_table_articles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_content_table_articles_updated_at
  BEFORE UPDATE ON content_table_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();