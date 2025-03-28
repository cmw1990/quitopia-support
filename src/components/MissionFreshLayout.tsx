import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { cn } from '../lib/utils';
import {
  LayoutDashboard,
  LineChart,
  Users,
  Settings,
  Menu,
  X,
  Wrench,
  LogOut,
  Home,
  Book,
  Cigarette,
  Leaf,
  BarChart,
  BookOpen,
  Compass,
  Calendar,
  Ruler,
  Timer,
  PenSquare,
  BookText,
  FileText,
  ClipboardList,
  Cog,
  Trophy,
  Smile,
  Activity,
  Zap,
  BrainCircuit,
  Heart,
  ChevronLeft,
  Bell,
  User,
  Store,
  Hand,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Share2,
  Plus
} from 'lucide-react';
import { Button } from './ui';
import { Fragment } from 'react';
import { useAuth } from './AuthProvider';
import { OfflineStatusIndicator } from './OfflineStatusIndicator';
import { supabaseRestCall } from "../api/apiCompatibility";
import { isMobile } from '../utils/mobileIntegration';
import { motion, AnimatePresence } from 'framer-motion';
import QuickActions from './QuickActions';
import hapticFeedback from '../utils/hapticFeedback';

interface MissionFreshLayoutProps {
  children: React.ReactNode;
  session: Session | null;
}

// Simple Settings Popover component
const SettingsPopover: React.FC = () => {
  return (
    <Button variant="ghost" size="icon">
      <Settings className="h-5 w-5" />
      <span className="sr-only">Settings</span>
    </Button>
  );
};

// Simple User Menu component
interface UserMenuProps {
  session: Session | null;
  className?: string;
  onClick?: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ session, className, onClick }) => {
  return (
    <div className={cn("flex items-center", className)} onClick={onClick}>
      <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center text-green-800 dark:text-green-200">
        <Leaf className="h-4 w-4" />
      </div>
    </div>
  );
};

// Bottom Tab Bar for mobile navigation
interface BottomTabBarProps {
  session: Session | null;
  currentPath: string;
  onNavigate: (path: string) => void;
  onQuickActionsToggle: () => void;
  showQuickActions: boolean;
}

const BottomTabBar: React.FC<BottomTabBarProps> = ({ 
  session, 
  currentPath, 
  onNavigate, 
  onQuickActionsToggle,
  showQuickActions
}) => {
  // Main tabs for quick access
  const mainTabs = [
    { name: 'Home', path: '/app', icon: Home },
    { name: 'Progress', path: '/app/progress', icon: BarChart },
    { name: 'Guides', path: '/app/guides', icon: BookOpen },
    { name: 'Journal', path: '/app/journal', icon: PenSquare }
  ];
  
  // Handle navigation with haptic feedback
  const handleTabPress = (path: string) => {
    // Provide haptic feedback
    hapticFeedback.light();
    onNavigate(path);
  };
  
  // Handle quick action button press
  const handleQuickActionPress = () => {
    hapticFeedback.medium();
    onQuickActionsToggle();
  };
  
  return (
    <>
      {/* Floating Action Button */}
      <motion.div 
        className="fixed bottom-20 right-4 z-50 lg:hidden"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        <Button 
          size="icon" 
          className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg"
          onClick={handleQuickActionPress}
        >
          <AnimatePresence mode="wait">
            {showQuickActions ? (
              <motion.div
                key="close"
                initial={{ rotate: 0 }}
                animate={{ rotate: 45 }}
                exit={{ rotate: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="plus"
                initial={{ rotate: 45 }}
                animate={{ rotate: 0 }}
                exit={{ rotate: 45 }}
                transition={{ duration: 0.2 }}
              >
                <Plus className="h-6 w-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>
      
      {/* Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg lg:hidden z-50">
        <div className="flex justify-around items-center h-16">
          {mainTabs.map((tab) => {
            const isActive = currentPath === tab.path || 
                            (tab.path === '/app' && currentPath === '/') ||
                            currentPath.startsWith(tab.path + '/');
            return (
              <button
                key={tab.path}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full transition-colors duration-200 relative",
                  isActive 
                    ? "text-primary" 
                    : "text-gray-500 hover:text-primary/80 dark:text-gray-400 dark:hover:text-primary/80"
                )}
                onClick={() => handleTabPress(tab.path)}
              >
                {isActive ? (
                  <motion.div 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="relative"
                  >
                    <tab.icon className="h-6 w-6" />
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" 
                    />
                  </motion.div>
                ) : (
                  <tab.icon className="h-5 w-5" />
                )}
                <span className="text-xs mt-1 font-medium">{tab.name}</span>
                
                {/* Touch ripple effect */}
                {isActive && (
                  <motion.div
                    layoutId="tabHighlight"
                    className="absolute -bottom-0 w-full h-0.5 bg-primary"
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export const MissionFreshLayout: React.FC<MissionFreshLayoutProps> = ({ children, session }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [pageTransition, setPageTransition] = useState({
    from: '',
    to: location.pathname
  });
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  
  // Detect mobile device on mount
  useEffect(() => {
    setIsMobileDevice(isMobile());
  }, []);
  
  // Update page transition on route change
  useEffect(() => {
    setPageTransition(prev => ({
      from: prev.to,
      to: location.pathname
    }));
  }, [location.pathname]);
  
  // Track location history for swipe navigation
  const historyStack = useRef<string[]>([]);
  
  useEffect(() => {
    historyStack.current.push(location.pathname);
    // Limit history stack size
    if (historyStack.current.length > 10) {
      historyStack.current.shift();
    }
  }, [location.pathname]);

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      if (!session?.user?.id) {
        console.log('No authenticated user, skipping notification fetch');
        return;
      }

      const withSymptoms = await supabaseRestCall(
        `/rest/v1/withdrawal_symptoms8?user_id=eq.${session.user.id}&order=created_at.desc`,
        { method: "GET" },
        session
      );

      // Process notifications
      if (Array.isArray(withSymptoms) && withSymptoms.length > 0) {
        setNotifications(withSymptoms);
        const hasUnread = withSymptoms.some(n => !n.read);
        setHasUnreadNotifications(hasUnread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };
  
  // Fetch notifications on mount and when session changes
  useEffect(() => {
    if (session) {
      fetchNotifications();
      
      // Set up polling for new notifications (every 5 minutes)
      const intervalId = setInterval(fetchNotifications, 5 * 60 * 1000);
      return () => clearInterval(intervalId);
    }
  }, [session]);

  // Enhanced swipe gesture handling for navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
    setSwipeDirection(null);
    setSwipeProgress(0);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const x = e.targetTouches[0].clientX;
    const y = e.targetTouches[0].clientY;
    
    setTouchEnd({
      x: x,
      y: y
    });
    
    // Calculate horizontal distance
    const xDistance = touchStart.x - x;
    
    // Determine swipe direction
    if (Math.abs(xDistance) > 20) {
      if (xDistance > 0) {
        setSwipeDirection('left');
      } else {
        setSwipeDirection('right');
      }
      
      // Calculate swipe progress (0-100)
      const progress = Math.min(Math.abs(xDistance) / 150, 1) * 100;
      setSwipeProgress(progress);
    }
  };
  
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const xDistance = touchStart.x - touchEnd.x;
    const yDistance = touchStart.y - touchEnd.y;
    
    // Only consider horizontal swipes (ignore diagonal)
    if (Math.abs(xDistance) > Math.abs(yDistance)) {
      const isLeftSwipe = xDistance > 80;
      const isRightSwipe = xDistance < -80;
      
      if (isRightSwipe && historyStack.current.length > 1) {
        // Provide haptic feedback
        if (window.navigator && 'vibrate' in window.navigator) {
          window.navigator.vibrate(10);
        }
        
        navigate(-1);
      } else if (isLeftSwipe) {
        // Potentially navigate forward or show quick actions
        if (window.navigator && 'vibrate' in window.navigator) {
          window.navigator.vibrate(10);
        }
        
        setShowQuickActions(true);
        setTimeout(() => setShowQuickActions(false), 3000);
      }
    }
    
    // Reset touch coordinates and progress
    setTouchStart(null);
    setTouchEnd(null);
    setSwipeProgress(0);
    setSwipeDirection(null);
  };

  // Navigation links with absolute paths
  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Track Progress', href: '/progress', icon: BarChart },
    { name: 'Analytics', href: '/analytics', icon: LineChart },
    { name: 'Log Consumption', href: '/consumption-logger', icon: Timer },
    { name: 'Simple Logger', href: '/simple-logger', icon: PenSquare },
    
    // Health tracking section
    { name: 'Holistic Health', href: '/health/dashboard', icon: Activity },
    { name: 'Mood Tracker', href: '/health/mood', icon: Smile },
    { name: 'Energy Tracker', href: '/health/energy', icon: Zap },
    { name: 'Focus Tracker', href: '/health/focus', icon: BrainCircuit },
    
    { name: 'Trigger Analysis', href: '/trigger-analysis', icon: FileText },
    { name: 'NRT Directory', href: '/nrt-directory', icon: Store },
    { name: 'Alternative Products', href: '/alternative-products', icon: Leaf },
    { name: 'Guides', href: '/guides', icon: BookOpen },
    { name: 'Web Tools', href: '/web-tools', icon: Wrench },
    { name: 'Community', href: '/community', icon: Users },
    { name: 'Tasks', href: '/task-manager', icon: ClipboardList },
    { name: 'Settings', href: '/settings', icon: Cog },
    { name: 'Challenges', href: '/challenges', icon: Trophy },
  ];

  // Quick action items
  const quickActions = [
    { name: 'Log Craving', icon: Hand, action: () => navigate('/craving-tracker') },
    { name: 'Track Mood', icon: Smile, action: () => navigate('/health/mood') },
    { name: 'Share Progress', icon: Share2, action: () => navigate('/progress/share') },
    { name: 'Quick Focus', icon: Sparkles, action: () => navigate('/focus/quick') }
  ];

  const MobileNav = () => {
    return (
      <div className="lg:hidden">
        <div className="flex items-center justify-between border-b px-4 py-3 bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
            
            {location.pathname !== '/' && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate(-1)}
                className="mr-1"
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Button>
            )}
            
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-green-400 to-emerald-600 rounded-full p-1 mr-2">
                <motion.div
                  animate={breathingAnimation}
                >
                  <Leaf className="h-4 w-4 text-white" />
                </motion.div>
              </div>
              <span className="text-lg font-semibold">Mission Fresh</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <OfflineStatusIndicator />
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/notifications')}
              className="relative"
            >
              <Bell className="h-5 w-5" />
              {hasUnreadNotifications && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full" />
              )}
              <span className="sr-only">Notifications</span>
            </Button>
            
            <UserMenu 
              session={session}
              onClick={() => navigate('/profile')}
            />
          </div>
        </div>
      </div>
    );
  };

  // Mobile sidebar
  const MobileSidebar = () => {
    return (
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 overflow-y-auto"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-gradient-to-br from-green-400 to-emerald-600 rounded-full p-1 mr-2">
                    <motion.div
                      animate={breathingAnimation}
                    >
                      <Leaf className="h-4 w-4 text-white" />
                    </motion.div>
                  </div>
                  <h2 className="text-xl font-semibold">Menu</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>
            
              <div className="p-2">
                {session && (
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-800 dark:text-green-200 font-medium text-lg">
                        <Leaf className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">{session.user?.email}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Signed in</div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 w-full justify-start"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </Button>
                  </div>
                )}
                
                <nav className="space-y-1">
                  {navigation.map((item) => {
                    const isCurrent = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={cn(
                          "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                          isCurrent
                            ? "bg-green-50 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                            : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <item.icon className={cn("h-4 w-4 mr-3", isCurrent ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400")} />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  };

  // Swipe indicator and quick actions
  const SwipeIndicator = () => {
    if (!swipeDirection || swipeProgress < 15) return null;
    
    return (
      <div className="fixed inset-0 pointer-events-none z-40 flex items-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: swipeProgress / 100 }}
          className={cn(
            "absolute top-1/2 transform -translate-y-1/2 bg-gray-800/70 rounded-full p-3",
            swipeDirection === 'right' ? "left-5" : "right-5"
          )}
        >
          {swipeDirection === 'right' ? (
            <ArrowLeft className="h-6 w-6 text-white" />
          ) : (
            <ArrowRight className="h-6 w-6 text-white" />
          )}
        </motion.div>
      </div>
    );
  };
  
  // Quick actions panel that appears on left swipe
  const QuickActionsPanel = () => {
    return (
      <AnimatePresence>
        {showQuickActions && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="fixed right-4 top-20 z-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 border border-gray-200 dark:border-gray-700"
          >
            <div className="p-2">
              <h3 className="text-sm font-medium mb-2">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="flex flex-col items-center justify-center h-16 text-xs p-1"
                    onClick={() => {
                      setShowQuickActions(false);
                      action.action();
                    }}
                  >
                    <action.icon className="h-4 w-4 mb-1" />
                    {action.name}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  // Determine if we should add bottom padding on mobile to account for tab bar
  const contentClass = cn(
    "flex-1",
    isMobileDevice ? "pb-16" : ""
  );

  // Define the breathing animation for the leaf
  const breathingAnimation = {
    scale: [1, 1.2, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <div 
      className="flex h-screen flex-col bg-gray-50 dark:bg-gray-950"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <MobileNav />
      <MobileSidebar />
      <SwipeIndicator />
      <QuickActionsPanel />
      
      <div className={contentClass}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {isMobileDevice && (
        <BottomTabBar 
          session={session}
          currentPath={location.pathname}
          onNavigate={(path) => navigate(path)}
          onQuickActionsToggle={() => setShowQuickActions(!showQuickActions)}
          showQuickActions={showQuickActions}
        />
      )}
      
      {/* Quick Actions Floating Button */}
      <QuickActions session={session} />
    </div>
  );
};
