import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  Timer,
  ListChecks,
  Settings,
  BookOpen,
  BarChart2,
  User,
  BellRing,
  Zap,
  Brain,
  Activity,
  Coffee,
  PersonStanding,
  Users,
  CloudOff,
  Menu,
  X,
  Gamepad2,
  Bolt,
  MessageCircle,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthProvider';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  
  const sidebarWidth = isOpen ? 'w-64' : 'w-20';
  
  const navItems = [
    {
      name: 'Dashboard',
      icon: <Home size={20} />,
      path: '/app/dashboard',
    },
    {
      name: 'Focus Timer',
      icon: <Timer size={20} />,
      path: '/app/focus-timer',
    },
    {
      name: 'Enhanced Focus',
      icon: <Bolt size={20} />,
      path: '/app/enhanced-focus',
    },
    {
      name: 'Focus Journal',
      icon: <BookOpen size={20} />,
      path: '/app/focus-journal',
    },
    {
      name: 'Focus Stats',
      icon: <BarChart2 size={20} />,
      path: '/app/focus-stats',
    },
    {
      name: 'Todo List',
      icon: <ListChecks size={20} />,
      path: '/app/todo',
    },
    {
      name: 'ADHD Support',
      icon: <Brain size={20} />,
      path: '/app/adhd-support',
    },
    {
      name: 'Distraction Blocker',
      icon: <CloudOff size={20} />,
      path: '/app/distraction-blocker',
    },
    {
      name: 'Anti-Googlitis',
      icon: <Activity size={20} />,
      path: '/app/anti-googlitis',
    },
    {
      name: 'Flow State',
      icon: <Zap size={20} />,
      path: '/app/flow-state',
    },
    {
      name: 'Body Doubling',
      icon: <Users size={20} />,
      path: '/app/body-doubling',
    },
    {
      name: 'Energy Management',
      icon: <Coffee size={20} />,
      path: '/app/energy-management',
    },
    {
      name: 'Community',
      icon: <MessageCircle size={20} />,
      path: '/app/community',
    },
    {
      name: 'Strategies',
      icon: <Target size={20} />,
      path: '/app/strategies',
    },
    {
      name: 'Analytics',
      icon: <BarChart2 size={20} />,
      path: '/app/analytics',
    },
    {
      name: 'Games',
      icon: <Gamepad2 size={20} />,
      path: '/app/games',
    },
    {
      name: 'Profile',
      icon: <User size={20} />,
      path: '/app/profile',
    },
    {
      name: 'Notifications',
      icon: <BellRing size={20} />,
      path: '/app/notifications',
    },
    {
      name: 'Settings',
      icon: <Settings size={20} />,
      path: '/app/settings',
    },
  ];

  return (
    <motion.aside
      initial={{ width: isOpen ? 256 : 80 }}
      animate={{ width: isOpen ? 256 : 80 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "h-screen fixed top-0 left-0 z-40 flex flex-col border-r border-border bg-card text-card-foreground",
        sidebarWidth
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          {isOpen && <span className="font-semibold">EasierFocus</span>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
                            (item.path !== '/app/dashboard' && location.pathname.startsWith(item.path));
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )
                }
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {isOpen && <span>{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {isOpen && user && (
        <div className="mt-auto border-t border-border p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </motion.aside>
  );
} 