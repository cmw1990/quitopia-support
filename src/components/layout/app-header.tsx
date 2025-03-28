import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Bell, Search, User, Sun, Moon, CheckCircle2 } from 'lucide-react';
import { hapticFeedback } from '../../utils/hapticFeedback';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { useAuth } from '../AuthProvider';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../ui/tooltip';

export function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  const [showSearch, setShowSearch] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(() => 
    document.documentElement.classList.contains('dark')
  );
  const [notificationCount, setNotificationCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Update online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Simulate notification fetch - in a real app this would come from a backend
  useEffect(() => {
    // Simulate random notifications for demo purposes
    setNotificationCount(Math.floor(Math.random() * 5));
  }, []);
  
  // Find page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/app' || path === '/app/dashboard') return 'Dashboard';
    if (path.includes('/guides')) return 'Guides';
    if (path.includes('/progress')) return 'Progress';
    if (path.includes('/stats')) return 'Statistics';
    if (path.includes('/profile')) return 'Profile';
    if (path.includes('/settings')) return 'Settings';
    if (path.includes('/health')) return 'Health Tracking';
    if (path.includes('/products')) return 'Products';
    if (path.includes('/community')) return 'Community';
    if (path.includes('/journal')) return 'Journal';
    if (path.includes('/tasks')) return 'Tasks';
    if (path.includes('/cravings')) return 'Cravings';
    
    return 'Mission Fresh';
  };
  
  const toggleSearch = () => {
    hapticFeedback.light();
    setShowSearch(!showSearch);
  };
  
  const toggleTheme = () => {
    hapticFeedback.light();
    setIsDarkTheme(!isDarkTheme);
    
    // Toggle theme class on document
    document.documentElement.classList.toggle('dark');
  };
  
  const handleSignOut = async () => {
    hapticFeedback.medium();
    try {
      // Use the logout method from auth context
      if (typeof auth.logout === 'function') {
        await auth.logout();
      } else {
        // Fallback to navigating to auth page
        navigate('/auth');
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo and menu button */}
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => hapticFeedback.light()}>
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link 
                  to="/app/dashboard" 
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    location.pathname === '/app/dashboard' ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                  )}
                  onClick={() => hapticFeedback.selectionChanged()}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/app/guides" 
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    location.pathname.includes('/guides') ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                  )}
                  onClick={() => hapticFeedback.selectionChanged()}
                >
                  Guides
                </Link>
                <Link 
                  to="/app/progress" 
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    location.pathname.includes('/progress') ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                  )}
                  onClick={() => hapticFeedback.selectionChanged()}
                >
                  Progress
                </Link>
                <Link 
                  to="/app/stats" 
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    location.pathname.includes('/stats') ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                  )}
                  onClick={() => hapticFeedback.selectionChanged()}
                >
                  Statistics
                </Link>
                
                <Link 
                  to="/app/health" 
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    location.pathname.includes('/health') ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                  )}
                  onClick={() => hapticFeedback.selectionChanged()}
                >
                  Health Tracking
                </Link>
                
                <Link 
                  to="/app/journal" 
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    location.pathname.includes('/journal') ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                  )}
                  onClick={() => hapticFeedback.selectionChanged()}
                >
                  Journal
                </Link>
                
                <Link 
                  to="/app/community" 
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    location.pathname.includes('/community') ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                  )}
                  onClick={() => hapticFeedback.selectionChanged()}
                >
                  Community
                </Link>
                
                <div className="mt-4 pt-4 border-t">
                  <p className="px-3 text-xs uppercase text-muted-foreground mb-2">User</p>
                  <Link 
                    to="/app/profile" 
                    className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      location.pathname.includes('/profile') ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                    )}
                    onClick={() => hapticFeedback.selectionChanged()}
                  >
                    Profile
                  </Link>
                  <Link 
                    to="/app/settings" 
                    className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      location.pathname.includes('/settings') ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                    )}
                    onClick={() => hapticFeedback.selectionChanged()}
                  >
                    Settings
                  </Link>
                  <Button 
                    variant="ghost" 
                    onClick={handleSignOut}
                    className="w-full justify-start px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                  >
                    Sign Out
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
          
          <div className="flex items-center gap-1">
            <Link to="/app" className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80" onClick={() => hapticFeedback.light()}>
              Mission Fresh
            </Link>
          </div>
        </div>
        
        {/* Center section - Page title with online indicator */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          <motion.h1 
            key={getPageTitle()}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-medium"
          >
            {getPageTitle()}
          </motion.h1>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <AnimatePresence mode="wait">
                    {isOnline ? (
                      <motion.div
                        key="online"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="text-green-500"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="offline"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="h-3 w-3 rounded-full bg-red-500 animate-pulse"
                      />
                    )}
                  </AnimatePresence>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {isOnline ? 'Online - All changes will sync immediately' : 'Offline - Changes will sync when you reconnect'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Right side icons */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleSearch}>
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
          
          <div className="relative">
            <Button variant="ghost" size="icon" onClick={() => {
              hapticFeedback.light();
              setNotificationCount(0); // Clear notification count on click
            }}>
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-primary text-white text-xs items-center justify-center font-bold">
                  {notificationCount}
                </span>
              </span>
            )}
          </div>
          
          {/* Theme toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            <AnimatePresence mode="wait">
              {isDarkTheme ? (
                <motion.div 
                  key="moon"
                  initial={{ rotate: -30, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 30, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="sun"
                  initial={{ rotate: 30, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -30, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          <Button variant="ghost" size="icon" asChild>
            <Link to="/app/profile" onClick={() => hapticFeedback.light()}>
              <User className="h-5 w-5" />
              <span className="sr-only">Profile</span>
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Search bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="container py-3">
              <div className="flex items-center border rounded-md overflow-hidden bg-background shadow-sm">
                <Search className="h-4 w-4 mx-3 text-muted-foreground" />
                <input 
                  type="text" 
                  className="flex-1 py-2 outline-none bg-transparent" 
                  placeholder="Search..."
                  autoFocus
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="mr-1" 
                  onClick={toggleSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
} 