import { createClient } from "npm:@supabase/supabase-js@2.39.7";
import twilio from "npm:twilio@4.22.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json"
};

// Validate environment variables
const requiredEnvVars = [
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_WHATSAPP_NUMBER",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY"
];

for (const envVar of requiredEnvVars) {
  if (!Deno.env.get(envVar)) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Initialize Twilio client
const twilioClient = twilio(
  Deno.env.get("TWILIO_ACCOUNT_SID")!,
  Deno.env.get("TWILIO_AUTH_TOKEN")!
);

const TWILIO_WHATSAPP_NUMBER = Deno.env.get("TWILIO_WHATSAPP_NUMBER")!;

// Helper function to validate phone number format
const isValidPhoneNumber = (number: string): boolean => {
  return /^\+\d{10,15}$/.test(number);
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        {
          status: 401,
          headers: corsHeaders
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized or invalid token" }),
        {
          status: 401,
          headers: corsHeaders
        }
      );
    }

    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select()
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        {
          status: 404,
          headers: corsHeaders
        }
      );
    }

    const { data: predictions, error: predictionsError } = await supabaseClient
      .from("predictions")
      .select()
      .eq("profile_id", user.id)
      .eq("is_sent", false)
      .order("created_at", { ascending: false })
      .limit(1);

    if (predictionsError || !predictions || predictions.length === 0) {
      return new Response(
        JSON.stringify({ error: "No predictions available" }),
        {
          status: 400,
          headers: corsHeaders
        }
      );
    }

    const prediction = predictions[0];
    
    // Format the message with header and footer
    const message = `🌟 *Daily Vedic Astrology Prediction*\n\nDear ${profile.full_name},\n\n${prediction.prediction_text}\n\nView your full prediction on Astro Insights.\n\nNamaste 🙏`;

    try {
      const twilioMessage = await twilioClient.messages.create({
        from: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${profile.whatsapp_number || profile.phone_number}`,
        body: message
      });

      await supabaseClient
        .from("predictions")
        .update({
          is_sent: true,
          sent_at: new Date().toISOString(),
        })
        .eq("id", prediction.id);

      await supabaseClient
        .from("whatsapp_notification_logs")
        .insert({
          profile_id: profile.id,
          prediction_id: prediction.id,
          status: "success",
          sent_at: new Date().toISOString(),
        });

      return new Response(
        JSON.stringify({
          success: true,
          message: "WhatsApp notification sent successfully"
        }),
        {
          status: 200,
          headers: corsHeaders
        }
      );
    } catch (twilioError) {
      await supabaseClient
        .from("whatsapp_notification_logs")
        .insert({
          profile_id: profile.id,
          prediction_id: prediction.id,
          status: "error",
          error_message: twilioError.message,
        });

      throw twilioError;
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: "Failed to send WhatsApp message",
        details: error.message 
      }),
      {
        status: 500,
        headers: corsHeaders
      }
    );
  }
});