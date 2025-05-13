/*
  # Add Twilio Integration

  1. Changes
    - Enable pg_cron and pg_net extensions
    - Create a scheduled job to send WhatsApp notifications
    - Add error handling and logging
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a table to log WhatsApp notification attempts
CREATE TABLE IF NOT EXISTS whatsapp_notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  profile_id uuid REFERENCES profiles(id),
  prediction_id uuid REFERENCES predictions(id),
  status text NOT NULL,
  error_message text,
  sent_at timestamptz
);

-- Enable RLS on the logs table
ALTER TABLE whatsapp_notification_logs ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for the logs table
CREATE POLICY "Users can view their own notification logs"
  ON whatsapp_notification_logs
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

-- Create the cron job to send WhatsApp notifications
SELECT cron.schedule(
  'send-whatsapp-predictions',  -- unique name for the schedule
  '30 2 * * *',                -- cron expression: 7:30 AM IST (2:30 AM UTC)
  $$
  -- Call the Edge Function to send WhatsApp notifications
  SELECT
    net.http_post(
      url := 'https://' || current_setting('request.headers')::json->>'host' || '/functions/v1/send-whatsapp',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('supabase.service_role_key'),
        'Content-Type', 'application/json'
      ),
      body := '{}'::jsonb
    ) as request_id;
  $$
);