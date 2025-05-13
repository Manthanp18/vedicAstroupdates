import { createClient } from "npm:@supabase/supabase-js@2.39.7";
import OpenAI from "npm:openai@4.28.0";
import { moon, sidereal, julian } from "npm:astronomia@4.1.1";

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const getCoordinates = async (location: string) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`
    );
    const data = await response.json();
    if (data && data[0]) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }
    throw new Error('Location not found');
  } catch (error) {
    console.error('Error getting coordinates:', error);
    return { latitude: 28.6139, longitude: 77.2090 }; // Default to New Delhi
  }
};

const calculateVedicElements = (date: Date, latitude: number, longitude: number) => {
  const jd = julian.DateToJD(date);
  const moonPos = moon.geocentric(jd);
  const moonLongitudeDeg = moonPos.lon * (180 / Math.PI);
  const moonLatitudeDeg = moonPos.lat * (180 / Math.PI);

  const nakshatraIndex = Math.floor(moonLongitudeDeg * 27 / 360);
  const nakshatras = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
    'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
    'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
  ];

  const siderealTime = sidereal.apparent(jd);
  const latRad = latitude * Math.PI / 180;
  const decRad = moonPos.lat;
  const H = Math.acos(-Math.tan(latRad) * Math.tan(decRad));
  const hourAngle = H * 12 / Math.PI;

  const sunrise = new Date(date);
  sunrise.setHours(6 - hourAngle);

  const sunset = new Date(date);
  sunset.setHours(18 + hourAngle);

  return {
    nakshatra: nakshatras[nakshatraIndex],
    nakshatraIndex,
    moonLongitude: moonLongitudeDeg.toFixed(2),
    moonLatitude: moonLatitudeDeg.toFixed(2),
    siderealTime: siderealTime.toFixed(2),
    sunrise,
    sunset
  };
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
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
          headers: { ...corsHeaders, "Content-Type": "application/json" },
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
          headers: { ...corsHeaders, "Content-Type": "application/json" },
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
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 🌅 Prevent duplicate prediction for the same day
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setUTCHours(0, 0, 0, 0);

    const todayEnd = new Date(now);
    todayEnd.setUTCHours(23, 59, 59, 999);

    const { data: existingPrediction, error: existingError } = await supabaseClient
      .from("predictions")
      .select()
      .eq("profile_id", user.id)
      .gte("created_at", todayStart.toISOString())
      .lte("created_at", todayEnd.toISOString())
      .limit(1)
      .single();

    if (existingPrediction && !existingError) {
      return new Response(
        JSON.stringify({
          success: true,
          alreadyExists: true,
          prediction: existingPrediction,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const currentCoords = await getCoordinates(profile.current_location);
    const birthCoords = await getCoordinates(profile.place_of_birth);

    const currentVedicElements = calculateVedicElements(
      now,
      currentCoords.latitude,
      currentCoords.longitude
    );

    const birthDate = new Date(profile.date_of_birth);
    const birthVedicElements = calculateVedicElements(
      birthDate,
      birthCoords.latitude,
      birthCoords.longitude
    );

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };

    const astroData = {
      current: {
        location: currentCoords,
        vedicElements: currentVedicElements
      },
      birth: {
        location: birthCoords,
        vedicElements: birthVedicElements
      },
      timestamp: now.toISOString()
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert Vedic astrologer. Generate a personalized daily prediction using the exact birth details and astronomical calculations provided.`,
        },
        {
          role: "user",
          content: `Generate a Vedic astrology prediction using these calculations:

Birth Details:
- Name: ${profile.full_name}
- Birth Date: ${birthDate.toISOString()}
- Birth Location: ${profile.place_of_birth}
- Birth Nakshatra: ${birthVedicElements.nakshatra}

Current Astronomical Data:
- Date: ${now.toISOString()}
- Location: ${profile.current_location}
- Sunrise: ${formatTime(currentVedicElements.sunrise)}
- Sunset: ${formatTime(currentVedicElements.sunset)}
- Current Nakshatra: ${currentVedicElements.nakshatra}
- Moon Position: ${currentVedicElements.moonLongitude}° longitude, ${currentVedicElements.moonLatitude}° latitude

Use these exact calculations for the prediction.`
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const predictionText = completion.choices[0].message.content;

    const { data: prediction, error: predictionError } = await supabaseClient
      .from("predictions")
      .insert({
        profile_id: user.id,
        prediction_text: predictionText,
        is_sent: false,
        astro_data: astroData
      })
      .select()
      .single();

    if (predictionError) {
      return new Response(
        JSON.stringify({ error: "Failed to save prediction" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        prediction,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
