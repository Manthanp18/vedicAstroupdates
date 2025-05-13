/*
  # Add cron job for WhatsApp notifications

  1. Changes
    - Enable pg_cron extension
    - Create cron job to trigger WhatsApp notifications daily at 7:30 AM IST (2:30 AM UTC)
*/

-- Enable the pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create the cron job
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
      body := '{}'
    ) as request_id;
  $$
);