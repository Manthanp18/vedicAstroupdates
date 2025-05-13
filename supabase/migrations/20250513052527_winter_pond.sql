/*
  # Add astronomical data storage
  
  1. Changes
    - Add astro_data JSONB column to predictions table to store astronomical calculations
    
  2. Security
    - Maintain existing RLS policies
*/

-- Add astro_data column to predictions table
ALTER TABLE predictions 
ADD COLUMN IF NOT EXISTS astro_data JSONB DEFAULT '{}'::jsonb;

-- Add comment to explain column usage
COMMENT ON COLUMN predictions.astro_data IS 'Stores astronomical calculations used for generating predictions';