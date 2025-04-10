import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const capitalize = (str: string) => 
  str.charAt(0).toUpperCase() + str.slice(1).replace('-', ' ');

const ROUTE_LABELS: Record<string, string> = {
  'app': 'App',
  'dashboard': 'Dashboard',
  'tasks': 'Tasks',
  'pomodoro': 'Pomodoro Timer',
  'analytics': 'Analytics',
  'games': 'Games',
  'achievements': 'Achievements',
  'settings': 'Settings',
  'profile': 'Profile',
  'pattern-match': 'Pattern Match',
  'memory-cards': 'Memory Cards',
  'zen-drift': 'Zen Drift'
};

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  return (
    <nav 
      aria-label="Breadcrumb" 
      className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 mb-4"
    >
      <Link 
        to="/app/dashboard" 
        className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        aria-label="Home"
      >
        <Home className="h-4 w-4" />
      </Link>

      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const label = ROUTE_LABELS[name] || capitalize(name);

        return (
          <React.Fragment key={name}>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            {isLast ? (
              <span 
                className="font-semibold text-gray-800 dark:text-gray-200"
                aria-current="page"
              >
                {label}
              </span>
            ) : (
              <Link 
                to={routeTo} 
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};