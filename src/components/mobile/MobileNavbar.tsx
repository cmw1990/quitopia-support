
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Clock, List, User, Settings } from 'lucide-react';

export const MobileNavbar = () => {
  const location = useLocation();

  const navItems = [
    {
      icon: Home,
      label: 'Home',
      href: '/mobile/dashboard',
    },
    {
      icon: Clock,
      label: 'Focus',
      href: '/mobile/focus',
    },
    {
      icon: List,
      label: 'Tasks',
      href: '/mobile/tasks',
    },
    {
      icon: Settings,
      label: 'Settings',
      href: '/mobile/settings',
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background z-10">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              'flex flex-col items-center justify-center h-full text-sm gap-1 transition-colors',
              location.pathname === item.href
                ? 'text-primary'
                : 'text-muted-foreground'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileNavbar;
