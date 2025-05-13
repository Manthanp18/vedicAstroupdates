import { Card, CardHeader, CardBody } from './ui/Card';
import { CalendarIcon, Clock, MapPin, Phone, User } from 'lucide-react';
import Button from './ui/Button';

interface ProfileSummaryProps {
  profile: {
    full_name: string;
    date_of_birth: string;
    time_of_birth: string;
    place_of_birth: string;
    phone_number: string;
    current_location: string;
  };
  onEditClick: () => void;
}

const ProfileSummary = ({ profile, onEditClick }: ProfileSummaryProps) => {
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };
  
  // Format time for display
  const formatTime = (timeString: string) => {
    const time = new Date(timeString);
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  return (
    <Card className="hover:shadow-md transition-shadow duration-300">
      <CardHeader className="flex flex-row justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Your Profile Details</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onEditClick}
        >
          Edit Profile
        </Button>
      </CardHeader>
      
      <CardBody>
        <div className="space-y-4">
          <div className="flex gap-3 items-center">
            <div className="bg-primary-100 p-2 rounded-full">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium">{profile.full_name}</p>
            </div>
          </div>
          
          <div className="flex gap-3 items-center">
            <div className="bg-secondary-100 p-2 rounded-full">
              <CalendarIcon className="w-5 h-5 text-secondary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Date of Birth</p>
              <p className="font-medium">{formatDate(profile.date_of_birth)}</p>
            </div>
          </div>
          
          <div className="flex gap-3 items-center">
            <div className="bg-accent-100 p-2 rounded-full">
              <Clock className="w-5 h-5 text-accent-700" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Time of Birth</p>
              <p className="font-medium">{formatTime(profile.time_of_birth)}</p>
            </div>
          </div>
          
          <div className="flex gap-3 items-center">
            <div className="bg-success-100 p-2 rounded-full">
              <MapPin className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Place of Birth</p>
              <p className="font-medium">{profile.place_of_birth}</p>
            </div>
          </div>
          
          <div className="flex gap-3 items-center">
            <div className="bg-warning-100 p-2 rounded-full">
              <Phone className="w-5 h-5 text-warning-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone Number</p>
              <p className="font-medium">{profile.phone_number}</p>
            </div>
          </div>
          
          <div className="flex gap-3 items-center">
            <div className="bg-error-100 p-2 rounded-full">
              <MapPin className="w-5 h-5 text-error-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Location</p>
              <p className="font-medium">{profile.current_location}</p>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default ProfileSummary;