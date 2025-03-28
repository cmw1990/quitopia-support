import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Heart, 
  Brain, 
  Moon,
  Zap,
  LineChart,
  LayoutDashboard,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

export const HorizontalMenu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: '/app/health/holistic'
    },
    {
      label: 'Mood',
      icon: <Heart className="h-5 w-5" />,
      path: '/app/health/mood'
    },
    {
      label: 'Energy',
      icon: <Zap className="h-5 w-5" />,
      path: '/app/health/energy'
    },
    {
      label: 'Focus',
      icon: <Brain className="h-5 w-5" />,
      path: '/app/health/focus'
    },
    {
      label: 'Sleep',
      icon: <Moon className="h-5 w-5" />,
      path: '/app/health/sleep'
    },
    {
      label: 'Cravings',
      icon: <Activity className="h-5 w-5" />,
      path: '/app/health/cravings'
    },
    {
      label: 'Progress',
      icon: <LineChart className="h-5 w-5" />,
      path: '/app/progress'
    }
  ];
  
  const currentPath = location.pathname;
  
  return (
    <div className="w-full overflow-auto pb-2 mb-6">
      <div className="flex space-x-2 min-w-max">
        {menuItems.map((item) => {
          const isActive = currentPath === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center px-4 py-2 rounded-md transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-primary/10"
              )}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default HorizontalMenu; 