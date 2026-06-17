import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColors = {
    employee: 'bg-blue-600',
    manager:  'bg-green-600',
    vendor:   'bg-purple-600',
    admin:    'bg-red-600',
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg 
            flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="font-bold text-gray-800 text-lg">
            Procurement Platform
          </span>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full 
              ${roleColors[user?.role]} flex items-center 
              justify-center`}>
              <User size={16} className="text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700 
              capitalize">
              {user?.role}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-sm 
              text-gray-500 hover:text-red-600 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;