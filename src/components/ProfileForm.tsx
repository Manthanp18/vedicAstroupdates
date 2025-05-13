import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ReactDatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useState, useEffect } from 'react';
import { useSupabase } from '../contexts/SupabaseContext';
import { useAuth } from '../contexts/AuthContext';
import Input from './ui/Input';
import Button from './ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from './ui/Card';
import { Info, MapPin, User } from 'lucide-react';

// Form validation schema
const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  dateOfBirth: z.date({
    required_error: 'Date of birth is required',
  }),
  timeOfBirth: z.date({
    required_error: 'Time of birth is required',
  }),
  placeOfBirth: z.string().min(2, 'Place of birth is required'),
  phoneNumber: z.string().min(5, 'Valid phone number is required'),
  whatsappNumber: z.string().min(5, 'Valid WhatsApp number is required'),
  currentLocation: z.string().min(2, 'Current location is required'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

type ProfileFormProps = {
  onProfileSubmit: (data: ProfileFormValues) => Promise<void>;
  existingData?: Partial<ProfileFormValues>;
  isProfileComplete?: boolean;
};

const ProfileForm = ({ onProfileSubmit, existingData, isProfileComplete = false }: ProfileFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  
  // Set defaults from existing data if available
  const defaultValues: Partial<ProfileFormValues> = {
    fullName: existingData?.fullName || '',
    dateOfBirth: existingData?.dateOfBirth ? new Date(existingData.dateOfBirth) : undefined,
    timeOfBirth: existingData?.timeOfBirth ? new Date(existingData.timeOfBirth) : undefined,
    placeOfBirth: existingData?.placeOfBirth || '',
    phoneNumber: existingData?.phoneNumber || '',
    whatsappNumber: existingData?.whatsappNumber || '',
    currentLocation: existingData?.currentLocation || '',
  };
  
  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });
  
  // Detect current location
  const detectLocation = async () => {
    setLocationLoading(true);
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLocationLoading(false);
      return;
    }
    
    try {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
            );
            const data = await response.json();
            
            if (data && data.display_name) {
              setValue('currentLocation', data.display_name);
            } else {
              setValue('currentLocation', `${latitude}, ${longitude}`);
            }
          } catch (err) {
            console.error('Error fetching location name:', err);
            setValue('currentLocation', `${latitude}, ${longitude}`);
          }
          setLocationLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to retrieve your location. Please enter it manually.');
          setLocationLoading(false);
        }
      );
    } catch (err) {
      console.error('Error accessing geolocation:', err);
      setError('Failed to access location services. Please enter your location manually.');
      setLocationLoading(false);
    }
  };
  
  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await onProfileSubmit(data);
    } catch (err) {
      console.error('Error submitting profile:', err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold text-gray-900">Your Astrology Profile</h2>
        <p className="text-gray-600 text-sm mt-1">
          We'll use this information to generate your personalized Vedic astrology predictions
        </p>
      </CardHeader>
      
      <CardBody>
        {error && (
          <div className="mb-4 p-3 bg-error-50 border border-error-200 text-error-700 rounded-md flex items-start">
            <Info className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        <form id="profileForm" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Input
              id="fullName"
              label="Full Name"
              placeholder="Enter your full name"
              error={errors.fullName?.message}
              leftIcon={<User className="w-5 h-5 text-gray-400" />}
              {...register('fullName')}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <Controller
                control={control}
                name="dateOfBirth"
                render={({ field }) => (
                  <div className="relative">
                    <ReactDatePicker
                      selected={field.value}
                      onChange={(date) => field.onChange(date)}
                      className={`
                        w-full px-3 py-2 bg-white border rounded-md
                        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                        ${errors.dateOfBirth ? 'border-error-500' : 'border-gray-300'}
                      `}
                      placeholderText="Select date"
                      dateFormat="dd/MM/yyyy"
                    />
                  </div>
                )}
              />
              {errors.dateOfBirth && (
                <p className="mt-1 text-sm text-error-600">{errors.dateOfBirth.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time of Birth
              </label>
              <Controller
                control={control}
                name="timeOfBirth"
                render={({ field }) => (
                  <ReactDatePicker
                    selected={field.value}
                    onChange={(date) => field.onChange(date)}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="h:mm aa"
                    className={`
                      w-full px-3 py-2 bg-white border rounded-md
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                      ${errors.timeOfBirth ? 'border-error-500' : 'border-gray-300'}
                    `}
                    placeholderText="Select time"
                  />
                )}
              />
              {errors.timeOfBirth && (
                <p className="mt-1 text-sm text-error-600">{errors.timeOfBirth.message}</p>
              )}
            </div>
          </div>
          
          <div>
            <Input
              id="placeOfBirth"
              label="Place of Birth"
              placeholder="City, Country"
              error={errors.placeOfBirth?.message}
              leftIcon={<MapPin className="w-5 h-5 text-gray-400" />}
              {...register('placeOfBirth')}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number (with country code)
            </label>
            <Controller
              control={control}
              name="phoneNumber"
              render={({ field }) => (
                <PhoneInput
                  international
                  value={field.value}
                  onChange={field.onChange}
                  className={`
                    w-full px-0 py-0 bg-white rounded-md
                    focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent
                    ${errors.phoneNumber ? 'border-error-500 [&>input]:border-error-500 [&>div]:border-error-500' : 'border-gray-300 [&>*]:border-gray-300'}
                  `}
                />
              )}
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-error-600">{errors.phoneNumber.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp Number (with country code)
            </label>
            <Controller
              control={control}
              name="whatsappNumber"
              render={({ field }) => (
                <PhoneInput
                  international
                  value={field.value}
                  onChange={field.onChange}
                  className={`
                    w-full px-0 py-0 bg-white rounded-md
                    focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent
                    ${errors.whatsappNumber ? 'border-error-500 [&>input]:border-error-500 [&>div]:border-error-500' : 'border-gray-300 [&>*]:border-gray-300'}
                  `}
                />
              )}
            />
            {errors.whatsappNumber && (
              <p className="mt-1 text-sm text-error-600">{errors.whatsappNumber.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              This number will receive your daily predictions via WhatsApp
            </p>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="currentLocation" className="block text-sm font-medium text-gray-700">
                Current Location
              </label>
              <button
                type="button"
                onClick={detectLocation}
                className="text-xs text-primary-600 hover:text-primary-500 font-medium flex items-center"
                disabled={locationLoading}
              >
                {locationLoading ? (
                  <>
                    <span className="mr-1">Detecting...</span>
                    <span className="animate-spin h-3 w-3 border-t-2 border-l-2 border-primary-600 rounded-full"></span>
                  </>
                ) : (
                  <>Detect my location</>
                )}
              </button>
            </div>
            <Input
              id="currentLocation"
              placeholder="City, Country"
              error={errors.currentLocation?.message}
              leftIcon={<MapPin className="w-5 h-5 text-gray-400" />}
              {...register('currentLocation')}
            />
          </div>
        </form>
      </CardBody>
      
      <CardFooter className="flex justify-end">
        <Button
          form="profileForm"
          type="submit"
          variant="primary"
          isLoading={isLoading}
        >
          {isProfileComplete ? 'Update Profile' : 'Save Profile'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProfileForm;