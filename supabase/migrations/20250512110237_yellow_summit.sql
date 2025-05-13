/*
  # Add WhatsApp notification settings
  
  1. Changes
    - Add whatsapp_notifications boolean column to profiles table with DEFAULT true
    - Add whatsapp_number text column to profiles table
  
  2. Security
    - Maintain existing RLS policies
*/

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS whatsapp_notifications boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS whatsapp_number text;