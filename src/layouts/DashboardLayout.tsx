import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Sun, User, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const DashboardLayout = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  // Navigation items
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Profile', path: '/profile', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm z-20">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sun className="text-primary-600 w-7 h-7" />
            <h1 className="text-xl md:text-2xl font-serif text-gray-900 font-medium">Astro Insights</h1>
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          {/* Desktop menu */}
          <nav className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-6 mr-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-md transition-colors ${
                      isActive 
                        ? 'bg-primary-50 text-primary-700' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`
                  }
                >
                  {item.icon}
                  {item.name}
                </NavLink>
              ))}
            </div>
            
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </nav>
        </div>
      </header>
      
      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-gray-900/50 z-10 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute top-16 right-0 bottom-0 w-64 bg-white shadow-lg" onClick={e => e.stopPropagation()}>
            <nav className="flex flex-col p-4 gap-2">
              <div className="mb-2 p-4 border-b">
                <p className="text-sm text-gray-500">Signed in as</p>
                <p className="font-medium truncate">{user?.email}</p>
              </div>
              
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => 
                    `flex items-center gap-2 px-4 py-3 rounded-md transition-colors ${
                      isActive 
                        ? 'bg-primary-50 text-primary-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  {item.icon}
                  {item.name}
                </NavLink>
              ))}
              
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-3 rounded-md text-gray-700 hover:bg-gray-100 mt-auto"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </nav>
          </div>
        </div>
      )}
      
      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t py-4">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>Astro Insights &copy; {new Date().getFullYear()} | Your Personal Vedic Astrology Guide</p>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;