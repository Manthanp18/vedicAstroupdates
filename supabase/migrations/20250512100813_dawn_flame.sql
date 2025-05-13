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
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'whatsapp_notification_logs' 
    AND policyname = 'Users can view their own notification logs'
  ) THEN
    CREATE POLICY "Users can view their own notification logs"
      ON whatsapp_notification_logs
      FOR SELECT
      TO authenticated
      USING (profile_id = auth.uid());
  END IF;
END $$;

-- Drop existing schedule if it exists
SELECT cron.unschedule('send-whatsapp-predictions');

-- Create the cron job to send WhatsApp notifications
-- Run every minute for testing
SELECT cron.schedule(
  'send-whatsapp-predictions',
  '* * * * *',  -- Run every minute for testing
  $$
  BEGIN
    -- Log the execution
    INSERT INTO whatsapp_notification_logs (status, error_message)
    VALUES ('cron_triggered', 'Cron job started');
    
    -- Call the Edge Function
    PERFORM net.http_post(
      url := current_setting('app.settings.edge_function_url') || '/send-whatsapp',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('supabase.service_role_key'),
        'Content-Type', 'application/json'
      ),
      body := '{}'::jsonb
    );
    
    -- Log successful execution
    INSERT INTO whatsapp_notification_logs (status, error_message)
    VALUES ('cron_completed', 'Cron job completed successfully');
  EXCEPTION WHEN OTHERS THEN
    -- Log any errors
    INSERT INTO whatsapp_notification_logs (status, error_message)
    VALUES ('cron_error', SQLERRM);
  END;
  $$
);