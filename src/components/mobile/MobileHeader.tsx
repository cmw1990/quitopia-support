import React from 'react';
import { Bell, ChevronLeft, Brain } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileHeaderProps {
  title?: string;
  showBackButton?: boolean;
  showNotifications?: boolean;
  className?: string;
}

export function MobileHeader({
  title,
  showBackButton = false,
  showNotifications = true,
  className,
}: MobileHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine title based on route if not provided
  const getRouteTitle = () => {
    if (title) return title;
    
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Dashboard';
    if (path.includes('focus-timer')) return 'Focus Timer';
    if (path.includes('enhanced-focus')) return 'Enhanced Focus';
    if (path.includes('adhd-support')) return 'ADHD Support';
    if (path.includes('body-doubling')) return 'Body Doubling';
    if (path.includes('distraction-blocker')) return 'Distraction Blocker';
    if (path.includes('anti-googlitis')) return 'Anti-Googlitis';
    if (path.includes('flow-state')) return 'Flow State';
    if (path.includes('energy-management')) return 'Energy Management';
    if (path.includes('games')) return 'Games';
    if (path.includes('settings')) return 'Settings';
    
    return 'EasierFocus';
  };
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const handleNotifications = () => {
    navigate('/app/notifications');
  };
  
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-40 h-16 flex items-center justify-between bg-background border-b border-border px-4",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {showBackButton ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="text-foreground"
            aria-label="Go back"
          >
            <ChevronLeft size={24} />
          </Button>
        ) : (
          <Brain size={24} className="text-primary" />
        )}
        <h1 className="text-lg font-medium">{getRouteTitle()}</h1>
      </div>
      
      {showNotifications && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNotifications}
          className="text-foreground"
          aria-label="Notifications"
        >
          <Bell size={20} />
        </Button>
      )}
    </motion.header>
  );
} 