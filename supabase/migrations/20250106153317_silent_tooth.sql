/*
  # Create lead generation history table

  1. New Tables
    - `lead_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `product_name` (text)
      - `product_description` (text)
      - `location` (text)
      - `status` (text)
      - `sheet_link` (text, nullable)
      - `error_message` (text, nullable)
      - `timestamp` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for authenticated users to manage their history
*/

CREATE TABLE IF NOT EXISTS lead_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  product_name text NOT NULL,
  product_description text NOT NULL,
  location text NOT NULL,
  status text NOT NULL,
  sheet_link text,
  error_message text,
  timestamp timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lead_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own lead history"
  ON lead_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lead history"
  ON lead_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);