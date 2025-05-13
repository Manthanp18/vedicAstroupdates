import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../contexts/SupabaseContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardBody } from '../components/ui/Card';
import PredictionCard from '../components/PredictionCard';
import { AlertTriangle } from 'lucide-react';

type Profile = {
  id: string;
  full_name: string;
};

type Prediction = {
  id: string;
  created_at: string;
  prediction_text: string;
};

const Dashboard = () => {
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileAndPrediction = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!user?.id) {
          setLoading(false);
          return;
        }

        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setError('Failed to load profile data');
          setLoading(false);
          return;
        }

        setProfile(profileData);

        // Fetch today's prediction
        const today = new Date().toISOString().split('T')[0];
        const { data: todayPrediction, error: predictionError } = await supabase
          .from('predictions')
          .select('*')
          .eq('profile_id', user.id)
          .gte('created_at', `${today}T00:00:00Z`)
          .lte('created_at', `${today}T23:59:59Z`)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (predictionError) {
          console.error('Error fetching prediction:', predictionError);
          setError('Failed to load prediction data');
        } else {
          setPrediction(todayPrediction || null);
        }
      } catch (err) {
        console.error('Error in data fetching:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndPrediction();
  }, [user, supabase]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardBody className="p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Complete Your Profile</h2>
            <p className="text-gray-600 mb-4">
              Please complete your profile to receive personalized predictions.
            </p>
            <button
              onClick={() => navigate('/profile')}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Complete Profile
            </button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-serif text-gray-900 font-semibold mb-2">
          Your Predictions
        </h1>
        <p className="text-gray-600">
          Here is your personalized Vedic astrology prediction for today
        </p>
      </div>

      {error && (
        <div className="bg-error-50 border border-error-200 text-error-700 p-4 rounded-md flex gap-3 items-center">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {prediction ? (
        <PredictionCard key={prediction.id} prediction={prediction} />
      ) : (
        <Card>
          <CardBody className="p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No prediction yet</h3>
            <p className="text-gray-600">
              Your first Vedic astrology prediction will appear here once it's generated.
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;