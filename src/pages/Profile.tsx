import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../contexts/SupabaseContext';
import { useAuth } from '../contexts/AuthContext';
import ProfileForm from '../components/ProfileForm';
import ProfileSummary from '../components/ProfileSummary';
import WhatsAppSettings from '../components/WhatsAppSettings';
import { Card, CardBody } from '../components/ui/Card';
import { AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';

type ProfileFormValues = {
  fullName: string;
  dateOfBirth: Date;
  timeOfBirth: Date;
  placeOfBirth: string;
  phoneNumber: string;
  whatsappNumber: string;
  currentLocation: string;
};

type ProfileData = {
  id: string;
  full_name: string;
  date_of_birth: string;
  time_of_birth: string;
  place_of_birth: string;
  phone_number: string;
  whatsapp_number: string | null;
  whatsapp_notifications: boolean;
  current_location: string;
};

const Profile = () => {
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);

  // Generate new prediction
  const handleGeneratePrediction = async () => {
    try {
      setPredictionLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-prediction`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to generate prediction');
      }

      const data = await response.json();
      console.log('Generated Prediction:', data);
      
      toast.success('New prediction generated successfully');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Error generating prediction:', err);
      toast.error(err.message || 'Failed to generate prediction');
    } finally {
      setPredictionLoading(false);
    }
  };

  // Send WhatsApp message
  const handleSendWhatsApp = async () => {
    try {
      setSendingWhatsApp(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-whatsapp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to send WhatsApp message');
      }

      const data = await response.json();
      console.log('WhatsApp Response:', data);
      
      toast.success('WhatsApp message sent successfully');
    } catch (err: any) {
      console.error('Error sending WhatsApp message:', err);
      
      if (err.message.includes('No unsent predictions')) {
        toast.error('No new predictions to send');
      } else if (err.message.includes('WhatsApp number')) {
        toast.error('Please set up your WhatsApp number first');
      } else {
        toast.error(err.message || 'Failed to send WhatsApp message');
      }
    } finally {
      setSendingWhatsApp(false);
    }
  };
  
  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!user?.id) {
          setLoading(false);
          return;
        }
        
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select()
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          console.error('Error fetching profile:', profileError);
          if (profileError.code !== 'PGRST116') {
            setError('Failed to load profile data');
          }
          setIsEditing(true);
        } else {
          setProfile(data);
          setIsEditing(!data);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user, supabase]);
  
  // Handle WhatsApp settings update
  const handleWhatsAppUpdate = async (data: { 
    whatsappNotifications: boolean; 
    whatsappNumber: string | null;
  }) => {
    try {
      if (!user) return;
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          whatsapp_notifications: data.whatsappNotifications,
          whatsapp_number: data.whatsappNumber || profile?.phone_number || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      // Update local state
      setProfile(prev => prev ? {
        ...prev,
        whatsapp_notifications: data.whatsappNotifications,
        whatsapp_number: data.whatsappNumber || prev.phone_number || null,
      } : null);
      
      toast.success('WhatsApp settings updated successfully');
    } catch (err) {
      console.error('Error updating WhatsApp settings:', err);
      toast.error('Failed to update WhatsApp settings');
      throw err;
    }
  };
  
  // Handle form submission
  const handleProfileSubmit = async (formData: ProfileFormValues) => {
    try {
      if (!user) return;
      
      // Prepare profile data for Supabase
      const profileData = {
        id: user.id,
        full_name: formData.fullName,
        date_of_birth: formData.dateOfBirth.toISOString(),
        time_of_birth: formData.timeOfBirth.toISOString(),
        place_of_birth: formData.placeOfBirth,
        phone_number: formData.phoneNumber,
        whatsapp_number: formData.whatsappNumber || formData.phoneNumber,
        current_location: formData.currentLocation,
        updated_at: new Date().toISOString(),
        whatsapp_notifications: true, // Enable by default
      };
      
      // Save profile data
      const { data, error: saveError } = await supabase
        .from('profiles')
        .upsert(profileData)
        .select()
        .single();
      
      if (saveError) {
        throw saveError;
      }
      
      setProfile(data);
      toast.success('Profile updated successfully');
      
      // If this is a new profile, generate first prediction
      if (!profile) {
        await handleGeneratePrediction();
      } else {
        // Switch to summary view after successful save
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      toast.error('Failed to save profile');
      throw err;
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (predictionLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardBody className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Generating Your Prediction</h3>
            <p className="text-gray-600">
              We're analyzing the cosmic alignment based on your profile data...
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif text-gray-900 font-semibold mb-2">
            Your Astrology Profile
          </h1>
          <p className="text-gray-600">
            Manage your personal details used for generating Vedic astrology predictions
          </p>
        </div>
        
        {profile && !isEditing && (
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleSendWhatsApp}
              isLoading={sendingWhatsApp}
              disabled={!profile.whatsapp_notifications || sendingWhatsApp}
            >
              Send WhatsApp
            </Button>
            <Button
              variant="primary"
              onClick={handleGeneratePrediction}
              isLoading={predictionLoading}
            >
              Generate Prediction
            </Button>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mb-6 bg-error-50 border border-error-200 text-error-700 p-4 rounded-md flex gap-3 items-center">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      {isEditing ? (
        <ProfileForm 
          onProfileSubmit={handleProfileSubmit} 
          existingData={profile ? {
            fullName: profile.full_name,
            dateOfBirth: new Date(profile.date_of_birth),
            timeOfBirth: new Date(profile.time_of_birth),
            placeOfBirth: profile.place_of_birth,
            phoneNumber: profile.phone_number,
            whatsappNumber: profile.whatsapp_number || profile.phone_number || '',
            currentLocation: profile.current_location,
          } : undefined}
          isProfileComplete={!!profile}
        />
      ) : profile && (
        <>
          <ProfileSummary 
            profile={profile} 
            onEditClick={() => setIsEditing(true)} 
          />
          <WhatsAppSettings
            whatsappNotifications={profile.whatsapp_notifications}
            whatsappNumber={profile.whatsapp_number || profile.phone_number}
            onUpdate={handleWhatsAppUpdate}
          />
        </>
      )}
    </div>
  );
};

export default Profile;