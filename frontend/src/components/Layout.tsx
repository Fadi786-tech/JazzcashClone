import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPictureUrl } from '../utils/pictureUrl';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [imageError, setImageError] = useState(false);

  // Reset image error when user or picture changes
  useEffect(() => {
    setImageError(false);
  }, [user?.picture]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="text-2xl font-bold">
              JazzCash
            </Link>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {user.picture && !imageError ? (
                  <img
                    src={getPictureUrl(user.picture)}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-400 flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="font-medium">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-primary-700 hover:bg-primary-800 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-64 bg-white rounded-lg shadow-md p-4 h-fit">
            <nav className="space-y-2">
              <Link
                to="/dashboard"
                className={`block px-4 py-3 rounded-lg transition ${
                  isActive('/dashboard')
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/transfer"
                className={`block px-4 py-3 rounded-lg transition ${
                  isActive('/transfer')
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Transfer Money
              </Link>
              <Link
                to="/bills"
                className={`block px-4 py-3 rounded-lg transition ${
                  isActive('/bills')
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Pay Bills
              </Link>
              <Link
                to="/load"
                className={`block px-4 py-3 rounded-lg transition ${
                  isActive('/load')
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Mobile Load
              </Link>
              <Link
                to="/bank-accounts"
                className={`block px-4 py-3 rounded-lg transition ${
                  isActive('/bank-accounts')
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Bank Accounts
              </Link>
              <Link
                to="/autopayments"
                className={`block px-4 py-3 rounded-lg transition ${
                  isActive('/autopayments')
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Autopayments
              </Link>
              <Link
                to="/profile"
                className={`block px-4 py-3 rounded-lg transition ${
                  isActive('/profile')
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Profile
              </Link>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default Layout;

