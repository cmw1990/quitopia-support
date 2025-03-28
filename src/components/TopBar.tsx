import React from 'react';
import { Bell, User, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { OfflineStatusIndicator } from './OfflineStatusIndicator';

interface TopBarProps {
  className?: string;
}

const TopBar: React.FC<TopBarProps> = ({ className = '' }) => {
  return (
    <header className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}>
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/app" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <span className="font-bold text-primary-foreground">MF</span>
            </div>
            <span className="font-semibold text-lg hidden md:inline-block">Mission Fresh</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <OfflineStatusIndicator variant="compact" />
          </div>
          
          <button className="rounded-full h-8 w-8 flex items-center justify-center bg-background border hover:bg-accent transition-colors">
            <Bell className="h-4 w-4" />
          </button>
          
          <Link to="/app/profile" className="rounded-full h-8 w-8 flex items-center justify-center bg-background border hover:bg-accent transition-colors">
            <User className="h-4 w-4" />
          </Link>
          
          <div className="md:hidden">
            <OfflineStatusIndicator variant="minimal" />
          </div>
          
          <button className="md:hidden rounded-full h-8 w-8 flex items-center justify-center bg-background border hover:bg-accent transition-colors">
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar; 