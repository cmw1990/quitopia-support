import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, BarChart2, Calendar, Edit3, Zap, MessageSquare, Activity, Heart, BrainCircuit } from 'lucide-react';
import hapticFeedback from '../utils/hapticFeedback';

interface Tab {
  name: string;
  path: string;
  icon: React.ElementType;
  accessibilityLabel?: string;
}

interface BottomTabBarProps {
  tabs: Tab[];
  className?: string;
  onQuickActionToggle?: (isOpen: boolean) => void;
  showQuickActions?: boolean;
}

const BottomTabBar: React.FC<BottomTabBarProps> = ({ 
  tabs,
  className = '',
  onQuickActionToggle,
  showQuickActions: externalShowQuickActions
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [internalShowQuickActions, setInternalShowQuickActions] = useState(false);
  const [lastActiveTab, setLastActiveTab] = useState('');
  const [touchStartX, setTouchStartX] = useState(0);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [isSwipeInProgress, setIsSwipeInProgress] = useState(false);
  
  // Determine whether to use external or internal state
  const showQuickActions = externalShowQuickActions !== undefined 
    ? externalShowQuickActions 
    : internalShowQuickActions;
  
  // Track last active tab for animation purposes
  useEffect(() => {
    const currentPath = location.pathname;
    const currentTab = tabs.find(tab => 
      currentPath === tab.path || 
      (tab.path !== '/app' && currentPath.startsWith(tab.path)));
      
    if (currentTab && currentTab.path !== lastActiveTab) {
      setLastActiveTab(currentTab.path);
      
      // Announce screen change to screen readers
      const screenReaderAnnounce = document.createElement('div');
      screenReaderAnnounce.setAttribute('aria-live', 'assertive');
      screenReaderAnnounce.setAttribute('role', 'status');
      screenReaderAnnounce.className = 'sr-only';
      screenReaderAnnounce.textContent = `Navigated to ${currentTab.name}`;
      document.body.appendChild(screenReaderAnnounce);
      
      // Remove the element after announcement
      setTimeout(() => {
        document.body.removeChild(screenReaderAnnounce);
      }, 1000);
    }
  }, [location.pathname, tabs, lastActiveTab]);
  
  // Handle navigation with enhanced haptic feedback
  const handleTabPress = (path: string) => {
    // Different haptic pattern based on the tab being navigated to
    if (path === '/app') {
      hapticFeedback.light(); // Home - light tap
    } else if (path.includes('progress')) {
      hapticFeedback.medium(); // Progress - medium tap (slightly stronger)
    } else if (path.includes('consumption')) {
      hapticFeedback.success(); // Logging - success pattern
    } else if (path.includes('community')) {
      hapticFeedback.notification(); // Community - notification pattern
    } else {
      hapticFeedback.light(); // Default pattern
    }
    
    // Animate before navigation
    setTimeout(() => navigate(path), 60);
  };
  
  // Handle quick action button press with stronger feedback
  const handleQuickActionPress = () => {
    // Stronger feedback for opening/closing action menu
    hapticFeedback.heavy();
    
    const newState = !showQuickActions;
    
    // If external control is provided, use that
    if (externalShowQuickActions !== undefined && onQuickActionToggle) {
      onQuickActionToggle(newState);
    } else {
      // Otherwise use internal state
      setInternalShowQuickActions(newState);
      if (onQuickActionToggle) {
        onQuickActionToggle(newState);
      }
    }
  };

  // Handle quick action selection with success feedback
  const handleQuickAction = (path: string) => {
    hapticFeedback.success();
    
    // Update state based on whether it's externally or internally controlled
    if (externalShowQuickActions !== undefined && onQuickActionToggle) {
      onQuickActionToggle(false);
    } else {
      setInternalShowQuickActions(false);
      if (onQuickActionToggle) {
        onQuickActionToggle(false);
      }
    }
    
    navigate(path);
  };
  
  // Enhanced quick actions for the floating menu with more holistic options
  const quickActions = [
    { 
      name: 'Log Progress', 
      path: '/app/progress/new', 
      icon: BarChart2, 
      color: 'bg-green-100 text-green-600',
      accessibilityLabel: 'Log your progress to track your quit journey'
    },
    { 
      name: 'Track Craving', 
      path: '/app/consumption-logger', 
      icon: Activity, 
      color: 'bg-amber-100 text-amber-600',
      accessibilityLabel: 'Log and analyze a nicotine craving' 
    },
    { 
      name: 'Journal Entry', 
      path: '/app/journal/new', 
      icon: Edit3, 
      color: 'bg-emerald-100 text-emerald-600',
      accessibilityLabel: 'Write a new journal entry'
    },
    { 
      name: 'Log Mood', 
      path: '/app/health/mood', 
      icon: Heart, 
      color: 'bg-pink-100 text-pink-600',
      accessibilityLabel: 'Record your current mood'
    },
    { 
      name: 'Energy Check', 
      path: '/app/health/energy', 
      icon: Zap, 
      color: 'bg-yellow-100 text-yellow-600',
      accessibilityLabel: 'Check and log your energy levels' 
    },
    { 
      name: 'Focus Tracker', 
      path: '/app/health/focus', 
      icon: BrainCircuit, 
      color: 'bg-purple-100 text-purple-600',
      accessibilityLabel: 'Track your focus and concentration'
    }
  ];
  
  // Calculate safe area with improved detection
  const safeAreaBottom = React.useMemo(() => {
    // Default safe area value
    let safeBottom = 0;
    
    // Check if the environment supports the safe area
    if (typeof window !== 'undefined') {
      // Try to detect iOS safe area
      const hasHomeIndicator = 
        // Check for iPhone X and newer (which have home indicator)
        /iPhone X/.test(navigator.userAgent) || 
        // Check if viewport height is less than screen height (indicates home indicator)
        (window.innerHeight < window.screen.height) ||
        // Check for CSS environment variables support
        (window.CSS && CSS.supports('padding-bottom: env(safe-area-inset-bottom)'));
      
      if (hasHomeIndicator) {
        safeBottom = 34; // Standard safe area for devices with home indicator
      } else if ('visualViewport' in window) {
        const viewport = window.visualViewport;
        if (viewport) {
          const viewportBottom = viewport.height;
          const documentBottom = document.documentElement.clientHeight;
          
          if (documentBottom > viewportBottom) {
            safeBottom = documentBottom - viewportBottom;
            // Cap at reasonable value to avoid extreme cases
            safeBottom = Math.min(safeBottom, 34);
          }
        }
      }
    }
    
    return safeBottom;
  }, []);

  // Tab indicator animation variants
  const tabIndicatorVariants = {
    initial: { opacity: 0, scale: 0 },
    animate: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 500, damping: 30 } },
    exit: { opacity: 0, scale: 0, transition: { duration: 0.2 } }
  };
  
  // Swipe handling for tab navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setIsSwipeInProgress(true);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwipeInProgress) return;
    const touchX = e.touches[0].clientX;
    const distance = touchX - touchStartX;
    setSwipeDistance(distance);
  };
  
  const handleTouchEnd = () => {
    if (!isSwipeInProgress) return;
    
    setIsSwipeInProgress(false);
    setSwipeDistance(0);
    
    // Minimum swipe distance to trigger navigation
    const minSwipeDistance = 80;
    
    if (Math.abs(swipeDistance) >= minSwipeDistance) {
      // Find current tab index
      const currentPath = location.pathname;
      const currentTabIndex = tabs.findIndex(tab => 
        currentPath === tab.path || 
        (tab.path !== '/app' && currentPath.startsWith(tab.path))
      );
      
      if (currentTabIndex >= 0) {
        // Determine direction and navigate
        const targetIndex = swipeDistance > 0 
          ? Math.max(0, currentTabIndex - 1) 
          : Math.min(tabs.length - 1, currentTabIndex + 1);
          
        if (targetIndex !== currentTabIndex) {
          hapticFeedback.light();
          navigate(tabs[targetIndex].path);
        }
      }
    }
  };
  
  return (
    <>
      {/* Bottom Navigation Bar */}
      <motion.div 
        className={`fixed bottom-0 left-0 right-0 bg-background backdrop-blur-md bg-opacity-95 border-t border-gray-200 dark:border-gray-800 z-30 ${className}`}
        style={{ 
          paddingBottom: `${safeAreaBottom}px`,
          boxShadow: '0 -1px 4px rgba(0, 0, 0, 0.05)'
        }}
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 400 }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path || 
                            (tab.path !== '/app' && location.pathname.startsWith(tab.path));
            
            // Determine if this is the center action button
            const isCenterAction = tab.name === 'Quick Actions';
            
            return (
              <motion.div
                key={tab.path}
                className="relative flex-1 h-full"
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (isCenterAction) {
                    handleQuickActionPress();
                  } else {
                    handleTabPress(tab.path);
                  }
                }}
                aria-label={tab.accessibilityLabel || tab.name}
                role="button"
                tabIndex={0}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  {isCenterAction ? (
                    <motion.div
                      className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg"
                      animate={showQuickActions ? { rotate: 45 } : { rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      {showQuickActions ? (
                        <X size={24} />
                      ) : (
                        <Plus size={24} />
                      )}
                    </motion.div>
                  ) : (
                    <>
                      <div className="relative">
                        <tab.icon
                          size={22}
                          className={`${isActive ? 'text-primary' : 'text-muted-foreground'} transition-colors duration-200`}
                        />
                        
                        {/* Active indicator dot */}
                        <AnimatePresence>
                          {isActive && (
                            <motion.div
                              key={`indicator-${tab.path}`}
                              className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                              initial="initial"
                              animate="animate"
                              exit="exit"
                              variants={tabIndicatorVariants}
                            />
                          )}
                        </AnimatePresence>
                      </div>
                      
                      <motion.span
                        className={`mt-1 text-xs font-medium ${
                          isActive ? 'text-primary' : 'text-muted-foreground'
                        } transition-colors duration-200`}
                        animate={{ 
                          opacity: isActive ? 1 : 0.7,
                          y: isActive ? 0 : 1 
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        {tab.name}
                      </motion.span>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
      
      {/* Quick Actions Menu */}
      <AnimatePresence>
        {showQuickActions && (
          <>
            {/* Overlay backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleQuickActionPress}
            />
            
            {/* Actions menu */}
            <motion.div
              className="fixed bottom-20 left-4 right-4 z-30 grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-background rounded-xl shadow-lg border border-gray-200 dark:border-gray-800"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.path}
                  className={`flex flex-col items-center p-3 rounded-lg ${action.color} cursor-pointer`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleQuickAction(action.path)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { delay: index * 0.05 } 
                  }}
                  exit={{ 
                    opacity: 0,
                    y: 10,
                    transition: { delay: (quickActions.length - index - 1) * 0.02 } 
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={action.accessibilityLabel || action.name}
                >
                  <action.icon size={24} />
                  <span className="mt-2 text-sm font-medium text-center">{action.name}</span>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default BottomTabBar; 