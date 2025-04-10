import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Timer, Brain, Settings, User, Activity, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const location = useLocation();
  
  const navItems = [
    {
      name: 'Home',
      icon: Home,
      path: '/app/dashboard',
    },
    {
      name: 'Focus',
      icon: Timer,
      path: '/app/focus-timer',
    },
    {
      name: 'ADHD',
      icon: Brain,
      path: '/app/adhd-support',
    },
    {
      name: 'Energy',
      icon: Zap,
      path: '/app/energy-management',
    },
    {
      name: 'Profile',
      icon: User,
      path: '/app/profile',
    },
  ];

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border"
    >
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
                          (item.path !== '/app/dashboard' && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center gap-1"
            >
              <Icon
                size={24}
                className={cn(
                  'transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              />
              <span
                className={cn(
                  'text-xs',
                  isActive ? 'text-primary font-medium' : 'text-muted-foreground'
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
} 