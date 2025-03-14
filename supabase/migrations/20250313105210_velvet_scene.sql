/*
  # Add social posts table to content management

  1. New Tables
    - `content_table_social_posts`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `platform` (text)
      - `media_type` (text)
      - `status` (text)
      - `scheduled_for` (timestamptz)
      - `is_approved` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `user_id` (uuid)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS content_table_social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  platform text NOT NULL CHECK (platform IN ('linkedin', 'facebook')),
  media_type text CHECK (media_type IN ('image', 'video', 'none')),
  status text CHECK (status IN ('Draft', 'Ready', 'Posted')) DEFAULT 'Draft',
  scheduled_for timestamptz,
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users NOT NULL
);

-- Enable RLS
ALTER TABLE content_table_social_posts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own social posts"
  ON content_table_social_posts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create social posts"
  ON content_table_social_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social posts"
  ON content_table_social_posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own social posts"
  ON content_table_social_posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_content_table_social_posts_updated_at
  BEFORE UPDATE ON content_table_social_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();