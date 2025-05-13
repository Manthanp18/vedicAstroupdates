import { useSupabase } from '../contexts/SupabaseContext';

// Function to generate a prediction using the Edge Function
export const generatePrediction = async (token: string) => {
  try {
    // Get the Supabase URL from environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    
    if (!supabaseUrl) {
      throw new Error('Supabase URL is not defined');
    }
    
    const response = await fetch(`${supabaseUrl}/functions/v1/generate-prediction`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate prediction');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error generating prediction:', error);
    throw error;
  }
};

// Custom hook to use the prediction service
export const usePredictionService = () => {
  const { supabase } = useSupabase();
  
  const fetchLatestPrediction = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .eq('profile_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching prediction:', error);
      return null;
    }
  };
  
  return {
    generatePrediction,
    fetchLatestPrediction,
  };
};