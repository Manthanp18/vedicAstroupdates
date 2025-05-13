import { useState } from 'react';
import { Choghadiya } from '../utils/choghadiya';
import { format } from 'date-fns';
import { Card, CardHeader, CardBody } from './ui/Card';
import { Sun, Moon } from 'lucide-react';

interface ChoghadiyaTableProps {
  choghadiyas: Choghadiya[];
  currentPeriod: Choghadiya | null;
}

const ChoghadiyaTable = ({ choghadiyas, currentPeriod }: ChoghadiyaTableProps) => {
  const [showDayPeriods, setShowDayPeriods] = useState(true);
  const dayPeriods = choghadiyas.slice(0, 8);
  const nightPeriods = choghadiyas.slice(8);
  
  const getNatureColor = (nature: Choghadiya['nature']) => {
    switch (nature) {
      case 'Favorable':
        return 'text-success-600';
      case 'Unfavorable':
        return 'text-error-600';
      case 'Mixed':
        return 'text-warning-600';
    }
  };
  
  const PeriodRow = ({ period }: { period: Choghadiya }) => {
    const isCurrentPeriod = currentPeriod?.name === period.name && 
      currentPeriod?.startTime.getTime() === period.startTime.getTime();
    
    return (
      <tr className={`${isCurrentPeriod ? 'bg-primary-50' : ''}`}>
        <td className="px-4 py-3 text-sm">
          {format(period.startTime, 'hh:mm a')}
        </td>
        <td className="px-4 py-3 text-sm">
          {format(period.endTime, 'hh:mm a')}
        </td>
        <td className="px-4 py-3 font-medium">{period.name}</td>
        <td className={`px-4 py-3 ${getNatureColor(period.nature)}`}>
          {period.nature}
        </td>
      </tr>
    );
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <h3 className="text-lg font-medium">Choghadiya Periods</h3>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              showDayPeriods
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setShowDayPeriods(true)}
          >
            <Sun className="w-4 h-4" />
            Day
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              !showDayPeriods
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setShowDayPeriods(false)}
          >
            <Moon className="w-4 h-4" />
            Night
          </button>
        </div>
      </CardHeader>
      <CardBody>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Start</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">End</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Period</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Nature</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(showDayPeriods ? dayPeriods : nightPeriods).map((period, index) => (
                <PeriodRow key={index} period={period} />
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
};

export default ChoghadiyaTable;