import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import BottomNav from './BottomNav';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const { signOut, user } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* User menu button - fixed to top right */}
      <div className="fixed top-3 right-3 z-50">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
          aria-label="User menu"
        >
          <User className="w-5 h-5 text-gray-600" />
        </button>

        {showUserMenu && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowUserMenu(false)}
            />
            {/* Dropdown */}
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs text-gray-500">Signed in as</p>
                <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  signOut();
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </>
        )}
      </div>

      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
