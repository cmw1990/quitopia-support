
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Home,
  LayoutDashboard,
  Clock,
  List,
  Focus,
  Brain,
  Activity,
  Coffee,
  Calendar,
  BarChart3,
  Users,
  Settings,
  ChevronRight,
  Shield,
  Zap,
  Wind,
  Moon,
  Layers
} from 'lucide-react';

interface SideNavProps {
  className?: string;
}

export function SideNav({ className }: SideNavProps) {
  const location = useLocation();
  
  const mainNav = [
    {
      title: 'Dashboard',
      href: '/app/dashboard',
      icon: LayoutDashboard
    },
    {
      title: 'Focus Timer',
      href: '/app/focus-timer',
      icon: Clock
    },
    {
      title: 'Tasks',
      href: '/app/tasks',
      icon: List
    },
    {
      title: 'Distraction Blocker',
      href: '/app/distraction-blocker',
      icon: Shield
    },
    {
      title: 'Energy',
      href: '/app/energy',
      icon: Zap
    },
    {
      title: 'Anti-Fatigue',
      href: '/app/anti-fatigue',
      icon: Coffee
    }
  ];
  
  const supportTools = [
    {
      title: 'ADHD Support',
      href: '/app/adhd-support',
      icon: Brain
    },
    {
      title: 'Body Doubling',
      href: '/app/body-doubling',
      icon: Users
    },
    {
      title: 'Breathing',
      href: '/app/breathing',
      icon: Wind
    },
    {
      title: 'Sleep Optimization',
      href: '/app/sleep',
      icon: Moon
    },
    {
      title: 'Analytics',
      href: '/app/analytics',
      icon: BarChart3
    }
  ];

  return (
    <div className={cn("border-r h-screen w-64 py-4 flex flex-col bg-background", className)}>
      <div className="px-4 py-2 mb-4">
        <Link to="/" className="flex items-center gap-2">
          <Focus className="h-6 w-6 text-primary" />
          <span className="font-semibold text-xl">EasierFocus</span>
        </Link>
      </div>
      
      <div className="flex-1 px-2 space-y-6 overflow-y-auto">
        <div className="space-y-1">
          <h3 className="px-4 text-xs font-semibold tracking-tight uppercase text-muted-foreground">
            Core
          </h3>
          {mainNav.map((item, index) => (
            <Link
              key={index}
              to={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                location.pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
        
        <div className="space-y-1">
          <h3 className="px-4 text-xs font-semibold tracking-tight uppercase text-muted-foreground">
            Support Tools
          </h3>
          {supportTools.map((item, index) => (
            <Link
              key={index}
              to={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                location.pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      </div>
      
      <div className="border-t mt-auto pt-2 px-2">
        <Link
          to="/app/settings"
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
            location.pathname === '/app/settings' ? "bg-accent text-accent-foreground" : "text-muted-foreground"
          )}
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </Link>
      </div>
    </div>
  );
}
