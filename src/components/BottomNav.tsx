import { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Calendar,
  LayoutGrid,
  Star,
  BookOpen,
  Heart,
  MoreHorizontal,
  Settings,
  TrendingUp,
  X,
} from 'lucide-react';

interface NavItem {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

// Main tabs shown in the bottom nav
const mainNavItems: NavItem[] = [
  { to: '/today', icon: Calendar, label: 'Today' },
  { to: '/books', icon: BookOpen, label: 'Books' },
  { to: '/coach', icon: Heart, label: 'Coach' },
];

// Items in the "More" menu
const moreNavItems: NavItem[] = [
  { to: '/week', icon: LayoutGrid, label: 'Week View' },
  { to: '/assess', icon: Star, label: 'Assessments' },
  { to: '/progress', icon: TrendingUp, label: 'Progress' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function BottomNav() {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Check if current path is in the "More" menu
  const isMoreActive = moreNavItems.some((item) => location.pathname === item.to);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    }
    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMoreMenu]);

  // Close menu on route change
  useEffect(() => {
    setShowMoreMenu(false);
  }, [location.pathname]);

  return (
    <>
      {/* More Menu Overlay */}
      {showMoreMenu && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setShowMoreMenu(false)} />
      )}

      {/* More Menu Sheet */}
      {showMoreMenu && (
        <div
          ref={menuRef}
          className="fixed bottom-16 right-2 left-2 sm:left-auto sm:right-4 sm:w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden animate-[slide-up_0.2s_ease-out]"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <span className="font-medium text-gray-700">More Options</span>
            <button
              onClick={() => setShowMoreMenu(false)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-2">
            {moreNavItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setShowMoreMenu(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border safe-area-pb z-30">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          {mainNavItems.map(({ to, icon: Icon, label }) => {
            const isCoach = to === '/coach';

            return (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? isCoach
                        ? 'text-coach'
                        : 'text-primary'
                      : 'text-text-muted hover:text-text'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{label}</span>
              </NavLink>
            );
          })}

          {/* More Button */}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              isMoreActive || showMoreMenu
                ? 'text-primary'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-xs font-medium">More</span>
          </button>
        </div>
      </nav>

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
