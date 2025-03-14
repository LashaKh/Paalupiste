/*
  # Add content table newsletters schema

  1. New Tables
    - `content_table_newsletters`
      - `id` (uuid, primary key)
      - `title` (text)
      - `subject_line` (text)
      - `preview_text` (text)
      - `content` (text)
      - `status` (text)
      - `scheduled_for` (timestamptz)
      - `is_approved` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `user_id` (uuid, references auth.users)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS content_table_newsletters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subject_line text NOT NULL,
  preview_text text,
  content text NOT NULL,
  status text CHECK (status IN ('Draft', 'Ready', 'Sent')) DEFAULT 'Draft',
  scheduled_for timestamptz,
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL,
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE content_table_newsletters ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own newsletters"
  ON content_table_newsletters
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create newsletters"
  ON content_table_newsletters
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own newsletters"
  ON content_table_newsletters
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own newsletters"
  ON content_table_newsletters
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS content_table_newsletters_user_id_idx ON content_table_newsletters(user_id);
CREATE INDEX IF NOT EXISTS content_table_newsletters_is_approved_idx ON content_table_newsletters(is_approved);

-- Add comment
COMMENT ON COLUMN content_table_newsletters.is_approved IS 'Indicates whether the newsletter has been approved for sending';

-- Create toggle timestamp function
CREATE OR REPLACE FUNCTION update_content_table_newsletters_toggle_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_approved IS DISTINCT FROM NEW.is_approved THEN
    NEW.updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create toggle trigger
CREATE TRIGGER update_content_table_newsletters_toggle
  BEFORE UPDATE OF is_approved ON content_table_newsletters
  FOR EACH ROW
  EXECUTE FUNCTION update_content_table_newsletters_toggle_timestamp();