import { Outlet } from 'react-router-dom';
import { Moon, Stars, Sun } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-primary-900 to-secondary-900 bg-stars bg-[length:30px_30px]">
      {/* Animated celestial elements */}
      <div className="fixed w-full h-full overflow-hidden pointer-events-none">
        <Moon className="text-white/20 absolute top-[20%] right-[15%] w-16 h-16 animate-float" />
        <Sun className="text-accent-400/30 absolute bottom-[15%] left-[10%] w-20 h-20 animate-float" style={{ animationDelay: '2s' }} />
        <Stars className="text-white/30 absolute top-[40%] left-[25%] w-12 h-12 animate-twinkle" style={{ animationDelay: '1s' }} />
        <Stars className="text-white/20 absolute bottom-[30%] right-[25%] w-8 h-8 animate-twinkle" style={{ animationDelay: '3s' }} />
      </div>
      
      {/* Logo and header */}
      <header className="py-6 px-4 z-10">
        <div className="container mx-auto flex justify-center">
          <div className="flex items-center gap-2">
            <Sun className="text-accent-400 w-8 h-8" />
            <h1 className="text-2xl font-serif text-white font-medium">Astro Insights</h1>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-4 text-center text-white/70 text-sm z-10">
        <div className="container mx-auto">
          <p>Astro Insights &copy; {new Date().getFullYear()} | Your Personal Vedic Astrology Guide</p>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;