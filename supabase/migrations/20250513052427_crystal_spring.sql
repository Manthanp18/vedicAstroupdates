/*
  # Add astronomical data column to predictions table

  1. Changes
    - Add astro_data JSONB column to predictions table to store astronomical calculations
    
  2. Security
    - Maintain existing RLS policies
*/

ALTER TABLE predictions 
ADD COLUMN IF NOT EXISTS astro_data JSONB DEFAULT '{}'::jsonb;

-- Update database types
DO $$ BEGIN
  PERFORM 
    pg_catalog.pg_refresh_view('graphql_public.graphql_schema');
END $$;