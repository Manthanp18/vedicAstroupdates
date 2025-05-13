import { Card, CardBody } from './ui/Card';
import { CloudMoon, Sun, Moon, Calendar, Clock } from 'lucide-react';

interface PredictionCardProps {
  prediction: {
    id: string;
    created_at: string;
    prediction_text: string;
  };
}

const PredictionCard = ({ prediction }: PredictionCardProps) => {
  // Format date to show day and date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Parse prediction sections
  const parsePrediction = (text: string) => {
    const sections = text.split('\n\n').filter(Boolean);
    return sections.map(section => {
      const [title, ...content] = section.split('\n');
      return {
        title: title.replace(/[*🌟☀️🕉⏰🌙💫✨🧘‍♂️]/g, '').trim(),
        content: content.filter(line => line.trim())
      };
    });
  };

  const sections = parsePrediction(prediction.prediction_text);

  // Get icon for section
  const getSectionIcon = (title: string) => {
    if (title.includes('Sun')) return <Sun className="w-5 h-5 text-warning-500" />;
    if (title.includes('Moon')) return <Moon className="w-5 h-5 text-accent-500" />;
    if (title.includes('Auspicious')) return <Calendar className="w-5 h-5 text-success-500" />;
    if (title.includes('Recommendations')) return <Clock className="w-5 h-5 text-secondary-500" />;
    return <CloudMoon className="w-5 h-5 text-primary-500" />;
  };

  return (
    <Card className="w-full transition-all duration-300 hover:shadow-lg overflow-hidden bg-gradient-to-br from-white to-gray-50">
      <CardBody className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="bg-primary-50 p-2 rounded-full">
            <CloudMoon className="w-10 h-10 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Daily Insights</h3>
            <p className="text-gray-600 text-sm">{formatDate(prediction.created_at)}</p>
          </div>
        </div>
        
        <div className="grid gap-4">
          {sections.map((section, index) => (
            <div 
              key={index}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:border-primary-100 transition-colors"
            >
              <div className="flex items-center gap-2 mb-3">
                {getSectionIcon(section.title)}
                <h4 className="font-medium text-gray-900">{section.title}</h4>
              </div>
              <div className="space-y-2 text-gray-700">
                {section.content.map((line, i) => (
                  <p key={i} className="leading-relaxed">
                    {line.startsWith('•') ? (
                      <span className="flex items-start gap-2">
                        <span className="text-primary-500">•</span>
                        <span>{line.substring(1).trim()}</span>
                      </span>
                    ) : (
                      line
                    )}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

export default PredictionCard;