
import React from 'react';
import { Focus, Bell, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';
import { useLocation } from 'react-router-dom';

export const MobileHeader = () => {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  
  // Determine the page title based on the current path
  const getTitle = (path: string) => {
    const parts = path.split('/');
    const page = parts[parts.length - 1];
    
    switch (page) {
      case 'dashboard':
        return 'Dashboard';
      case 'focus':
        return 'Focus Timer';
      case 'tasks':
        return 'Tasks';
      case 'settings':
        return 'Settings';
      default:
        return 'EasierFocus';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b bg-background flex items-center justify-between px-4 z-10">
      <div className="flex items-center gap-2">
        <Focus className="h-5 w-5 text-primary" />
        <span className="font-semibold">{getTitle(location.pathname)}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header>
  );
};

export default MobileHeader;
