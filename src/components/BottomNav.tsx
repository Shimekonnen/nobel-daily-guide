import { NavLink } from 'react-router-dom';
import { Calendar, LayoutGrid, Star, TrendingUp, BookOpen, Settings } from 'lucide-react';

// Mock badge data - in real app, these would come from context/state
const getBadges = () => ({
  today: false, // No badge when schedule exists
  assess: 2, // 2 assessments due
  books: 0, // No unread books badge
});

interface NavItem {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badgeKey?: keyof ReturnType<typeof getBadges>;
}

const navItems: NavItem[] = [
  { to: '/today', icon: Calendar, label: 'Today', badgeKey: 'today' },
  { to: '/week', icon: LayoutGrid, label: 'Week' },
  { to: '/assess', icon: Star, label: 'Assess', badgeKey: 'assess' },
  { to: '/progress', icon: TrendingUp, label: 'Progress' },
  { to: '/books', icon: BookOpen, label: 'Books', badgeKey: 'books' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function BottomNav() {
  const badges = getBadges();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border safe-area-pb">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map(({ to, icon: Icon, label, badgeKey }) => {
          const badgeValue = badgeKey ? badges[badgeKey] : null;
          const showBadge = badgeValue !== null && badgeValue !== false && badgeValue !== 0;

          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-primary'
                    : 'text-text-muted hover:text-text'
                }`
              }
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {showBadge && (
                  <>
                    {typeof badgeValue === 'number' ? (
                      // Numeric badge
                      <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 shadow-sm">
                        {badgeValue > 9 ? '9+' : badgeValue}
                      </span>
                    ) : (
                      // Dot badge for boolean indicators
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-surface shadow-sm" />
                    )}
                  </>
                )}
              </div>
              <span className="text-xs font-medium">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
