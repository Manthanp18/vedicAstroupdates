import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-primary-900 to-secondary-900 flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 bg-accent-400 rounded-full animate-ping opacity-25"></div>
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="w-16 h-16 bg-accent-400 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-primary-900 rounded-full"></div>
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-serif font-medium text-white mb-2">Page Not Found</h2>
        <p className="text-white/70 mb-8">
          The cosmic alignment you're looking for seems to have moved to another dimension.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            as={Link}
            to="/"
            variant="accent"
            leftIcon={<Home className="w-5 h-5" />}
          >
            Go Home
          </Button>
          <Button
            as={Link}
            to="#"
            onClick={() => window.history.back()}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
            leftIcon={<ArrowLeft className="w-5 h-5" />}
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;