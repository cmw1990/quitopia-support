import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocation } from 'react-router-dom';
import {
  BarChart,
  Moon,
  Dumbbell,
  Target,
  Brain,
  Battery,
  HeartPulse,
  MessageSquare,
  Utensils,
  Settings,
  User
} from 'lucide-react';

const sidebarNavItems = [
  {
    title: 'Dashboard',
    href: '/app/dashboard',
    icon: BarChart,
  },
  {
    title: 'Sleep',
    href: '/app/sleep',
    icon: Moon,
  },
  {
    title: 'Exercise',
    href: '/app/exercise',
    icon: Dumbbell,
  },
  {
    title: 'Focus',
    href: '/app/focus',
    icon: Target,
  },
  {
    title: 'Mental Health',
    href: '/app/mental-health',
    icon: Brain,
  },
  {
    title: 'Energy',
    href: '/app/energy',
    icon: Battery,
  },
  {
    title: 'Recovery',
    href: '/app/recovery',
    icon: HeartPulse,
  },
  {
    title: 'Consultation',
    href: '/app/consultation',
    icon: MessageSquare,
  },
  {
    title: 'Recipes',
    href: '/app/recipes',
    icon: Utensils,
  },
];

const bottomNavItems = [
  {
    title: 'Settings',
    href: '/app/settings',
    icon: Settings,
  },
  {
    title: 'Profile',
    href: '/app/profile',
    icon: User,
  },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <ScrollArea className="h-full py-6">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Overview
            </h2>
            {sidebarNavItems.map((item) => (
              <Link key={item.href} to={item.href}>
                <Button
                  variant={location.pathname === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <item.icon className="size-4 mr-2" />
                  {item.title}
                </Button>
              </Link>
            ))}
          </div>
        </div>
        <div className="px-3 py-2">
          <div className="space-y-1">
            {bottomNavItems.map((item) => (
              <Link key={item.href} to={item.href}>
                <Button
                  variant={location.pathname === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <item.icon className="size-4 mr-2" />
                  {item.title}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
