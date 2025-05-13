import { useState } from 'react';
import { Card, CardHeader, CardBody } from './ui/Card';
import { MessageSquare, Info } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import toast from 'react-hot-toast';
import 'react-phone-number-input/style.css';

interface WhatsAppSettingsProps {
  whatsappNotifications: boolean;
  whatsappNumber: string | null;
  onUpdate: (data: { whatsappNotifications: boolean; whatsappNumber: string | null }) => Promise<void>;
}

const WhatsAppSettings = ({ whatsappNotifications, whatsappNumber, onUpdate }: WhatsAppSettingsProps) => {
  const [isEnabled, setIsEnabled] = useState(whatsappNotifications);
  const [number, setNumber] = useState(whatsappNumber);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async () => {
    try {
      setError(null);
      setIsUpdating(true);
      
      const newEnabledState = !isEnabled;
      
      await onUpdate({
        whatsappNotifications: newEnabledState,
        whatsappNumber: newEnabledState ? number : null
      });
      
      setIsEnabled(newEnabledState);
      toast.success(newEnabledState ? 'WhatsApp notifications enabled' : 'WhatsApp notifications disabled');
    } catch (err) {
      setError('Failed to update WhatsApp settings');
      toast.error('Failed to update WhatsApp settings');
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNumberChange = async (value: string | undefined) => {
    setNumber(value || null);
    setError(null);
    
    if (!value) return;
    
    try {
      setIsUpdating(true);
      await onUpdate({
        whatsappNotifications: true,
        whatsappNumber: value
      });
      toast.success('WhatsApp number updated successfully');
    } catch (err) {
      setError('Failed to update WhatsApp number');
      toast.error('Failed to update WhatsApp number');
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-medium">WhatsApp Notifications</h3>
        </div>
      </CardHeader>
      <CardBody>
        {error && (
          <div className="mb-4 p-3 bg-error-50 border border-error-200 text-error-700 rounded-md flex items-start gap-2">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Daily Predictions on WhatsApp</p>
              <p className="text-sm text-gray-600">Receive your daily predictions at 7:30 AM IST</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isEnabled}
                onChange={handleToggle}
                disabled={isUpdating}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          {isEnabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp Number
              </label>
              <PhoneInput
                international
                value={number || ''}
                onChange={handleNumberChange}
                disabled={isUpdating}
                className={`
                  w-full px-0 py-0 bg-white rounded-md
                  focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent
                  ${error ? 'border-error-500 [&>input]:border-error-500 [&>div]:border-error-500' : 'border-gray-300 [&>*]:border-gray-300'}
                `}
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter your WhatsApp number with country code
              </p>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

export default WhatsAppSettings;