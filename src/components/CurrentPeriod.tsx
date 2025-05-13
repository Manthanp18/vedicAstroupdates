import { Card, CardBody } from './ui/Card';
import { Clock } from 'lucide-react';
import { Choghadiya } from '../utils/choghadiya';
import { format } from 'date-fns';

interface CurrentPeriodProps {
  currentPeriod: Choghadiya | null;
}

const CurrentPeriod = ({ currentPeriod }: CurrentPeriodProps) => {
  if (!currentPeriod) return null;
  
  const getNatureColor = (nature: Choghadiya['nature']) => {
    switch (nature) {
      case 'Favorable':
        return 'bg-success-50 text-success-700 border-success-200';
      case 'Unfavorable':
        return 'bg-error-50 text-error-700 border-error-200';
      case 'Mixed':
        return 'bg-warning-50 text-warning-700 border-warning-200';
    }
  };
  
  return (
    <Card>
      <CardBody className="p-6">
        <div className="flex items-center gap-4">
          <div className="bg-primary-100 p-3 rounded-full">
            <Clock className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Current Period</h3>
            <p className="text-sm text-gray-500">
              {format(currentPeriod.startTime, 'hh:mm a')} - {format(currentPeriod.endTime, 'hh:mm a')}
            </p>
          </div>
        </div>
        
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Period Name</span>
            <span className="font-medium">{currentPeriod.name}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Nature</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getNatureColor(currentPeriod.nature)}`}>
              {currentPeriod.nature}
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default CurrentPeriod;