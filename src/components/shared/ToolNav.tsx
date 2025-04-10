import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocation } from 'react-router-dom';
import {
  Volume2,
  Clock,
  Moon,
  Waves,
  Wind,
  BookOpen,
  Home
} from 'lucide-react';

const toolNavItems = [
  {
    title: 'White Noise',
    href: '/tool/white-noise',
    icon: Volume2,
    description: 'Ambient sounds for focus',
  },
  {
    title: 'Pomodoro',
    href: '/tool/pomodoro',
    icon: Clock,
    description: 'Time management technique',
  },
  {
    title: 'Sleep Sounds',
    href: '/tool/sleep-sounds',
    icon: Moon,
    description: 'Sounds for better sleep',
  },
  {
    title: 'Meditation',
    href: '/tool/meditation',
    icon: Waves,
    description: 'Guided meditation sessions',
  },
  {
    title: 'Breathwork',
    href: '/tool/breathwork',
    icon: Wind,
    description: 'Breathing exercises',
  },
  {
    title: 'Journal',
    href: '/tool/journal',
    icon: BookOpen,
    description: 'Digital wellness journal',
  },
];

export function ToolNav() {
  const location = useLocation();

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wellness Tools</h1>
          <p className="text-muted-foreground">
            Tools and resources to support your wellness journey
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/webapp/dashboard">
            <Home className="mr-2 h-4 w-4" />
            Back to App
          </Link>
        </Button>
      </div>
      
      <ScrollArea className="w-full">
        <div className="flex space-x-4 pb-4">
          {toolNavItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex min-w-[200px] flex-col items-center rounded-lg border p-4 hover:bg-accent",
                location.pathname === item.href && "bg-accent"
              )}
            >
              <item.icon className="mb-2 h-6 w-6" />
              <h3 className="text-sm font-medium">{item.title}</h3>
              <p className="text-xs text-muted-foreground text-center">
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
