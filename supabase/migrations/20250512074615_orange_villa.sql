/*
  # Initial Schema Setup

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - References auth.users
      - `created_at` (timestamptz)
      - `full_name` (text)
      - `date_of_birth` (timestamptz)
      - `time_of_birth` (timestamptz)
      - `place_of_birth` (text)
      - `phone_number` (text)
      - `current_location` (text)
      - `updated_at` (timestamptz)
      
    - `predictions`
      - `id` (uuid, primary key)
      - `created_at` (timestamptz)
      - `profile_id` (uuid) - References profiles.id
      - `prediction_text` (text)
      - `is_sent` (boolean)
      - `sent_at` (timestamptz)
      
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  full_name TEXT,
  date_of_birth TIMESTAMPTZ,
  time_of_birth TIMESTAMPTZ,
  place_of_birth TEXT,
  phone_number TEXT,
  current_location TEXT,
  updated_at TIMESTAMPTZ
);

-- Create predictions table
CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  prediction_text TEXT NOT NULL,
  is_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ
);

-- Enable RLS on tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create policies for predictions table
CREATE POLICY "Users can view their own predictions"
  ON predictions
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

-- Only service role can create predictions (for OpenAI integration)
CREATE POLICY "Service role can insert predictions"
  ON predictions
  FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

-- Only service role can update predictions (for WhatsApp notification status)
CREATE POLICY "Service role can update predictions"
  ON predictions
  FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid());

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS predictions_profile_id_idx ON predictions(profile_id);