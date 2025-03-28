import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import { PiStepsFill } from 'react-icons/pi';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { cn } from '../../lib/utils';
import { hapticFeedback } from '../../utils/hapticFeedback';
import { useAuth } from '../AuthProvider';

interface MobileNavigationProps {
  isTablet?: boolean;
  isLandscape?: boolean;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ 
  isTablet = false,
  isLandscape = false 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);
  const [stepCount, setStepCount] = useState(0);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const quickActionsControls = useAnimation();
  const [activeTab, setActiveTab] = useState<string>('');
  const navbarRef = useRef<HTMLDivElement>(null);

  // Set active tab based on location
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setActiveTab('home');
    else if (path.startsWith('/profile')) setActiveTab('profile');
    else if (path.startsWith('/analytics')) setActiveTab('analytics');
    else if (path.startsWith('/health')) setActiveTab('health');
    else if (path.startsWith('/settings')) setActiveTab('settings');
    else setActiveTab('');
  }, [location]);

  // Toggle quick actions menu with improved animation
  const toggleQuickActions = () => {
    if (showQuickActions) {
      quickActionsControls.start({
        scale: [1, 1.05, 0],
        opacity: [1, 1, 0],
        transition: { duration: 0.3, times: [0, 0.3, 1] }
      }).then(() => {
        setShowQuickActions(false);
      });
      hapticFeedback.medium();
    } else {
      setShowQuickActions(true);
      quickActionsControls.start({
        scale: [0, 1.1, 1],
        opacity: [0, 1, 1],
        transition: { duration: 0.4, times: [0, 0.7, 1] }
      });
      hapticFeedback.medium();
    }
  };

  // Close quick actions when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: Event) => {
      if (
        quickActionsRef.current && 
        !quickActionsRef.current.contains(event.target as Node) && 
        showQuickActions
      ) {
        quickActionsControls.start({
          scale: [1, 1.05, 0],
          opacity: [1, 1, 0],
          transition: { duration: 0.3, times: [0, 0.3, 1] }
        }).then(() => {
          setShowQuickActions(false);
        });
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [showQuickActions, quickActionsControls]);

  // Add swipe gesture support for navbar (pull up to show quick actions)
  useEffect(() => {
    if (!navbarRef.current) return;
    
    let touchStartY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      const touchEndY = e.touches[0].clientY;
      const deltaY = touchStartY - touchEndY;
      
      // If swiping up (deltaY > 0) and gesture is significant
      if (deltaY > 50 && !showQuickActions) {
        toggleQuickActions();
      }
      
      // If swiping down (deltaY < 0) and quick actions is open
      if (deltaY < -50 && showQuickActions) {
        toggleQuickActions();
      }
    };
    
    navbarRef.current.addEventListener('touchstart', handleTouchStart);
    navbarRef.current.addEventListener('touchmove', handleTouchMove);
    
    return () => {
      if (navbarRef.current) {
        navbarRef.current.removeEventListener('touchstart', handleTouchStart);
        navbarRef.current.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }, [navbarRef, showQuickActions, toggleQuickActions]);

  // Simulate update of notification count and step data
  useEffect(() => {
    // Get notification count
    const checkNotifications = async () => {
      try {
        if (user?.id) {
          // In a real app, this would be an API call to get unread notifications
          const mockNotificationData = {
            count: Math.floor(Math.random() * 5)
          };
          setNotificationCount(mockNotificationData.count);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    
    // Get step count data
    const updateStepCount = async () => {
      try {
        if (user?.id) {
          // In a real app, this would be an API call to get step count
          const mockStepData = {
            todaySteps: 6428 + Math.floor(Math.random() * 1000)
          };
          setStepCount(mockStepData.todaySteps);
        }
      } catch (error) {
        console.error('Error fetching step count:', error);
      }
    };
    
    // Initial check
    checkNotifications();
    updateStepCount();
    
    // Set up intervals for regular updates
    const notificationInterval = setInterval(checkNotifications, 30000);
    const stepInterval = setInterval(updateStepCount, 60000);
    
    return () => {
      clearInterval(notificationInterval);
      clearInterval(stepInterval);
    };
  }, [user]);

  // Navigation Item with improved animations and accessibility
  const NavItem = ({ 
    icon, 
    label, 
    path, 
    badge,
    ariaLabel
  }: { 
    icon: React.ReactNode; 
    label: string; 
    path: string; 
    badge?: number;
    ariaLabel?: string;
  }) => {
    const isActive = location.pathname === path || 
                    (path !== '/' && location.pathname.startsWith(path));
    
    const handleNavClick = () => {
      if (location.pathname !== path) {
        hapticFeedback.medium();
        navigate(path);
      }
    };
    
    return (
      <TooltipProvider>
        <Tooltip delayDuration={700}>
          <TooltipTrigger asChild>
            <motion.button
              onClick={handleNavClick}
              className={cn(
                "flex flex-col items-center justify-center p-2",
                isActive ? "text-primary-500" : "text-gray-500",
                "hover:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-opacity-50 rounded-lg"
              )}
              whileTap={{ scale: 0.9 }}
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 500, damping: 17 }}
              aria-label={ariaLabel || label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className={cn(
                "relative",
                isActive && "bg-primary-50 dark:bg-primary-900/20 p-1.5 rounded-full"
              )}>
                {icon}
                <AnimatePresence>
                  {badge !== undefined && badge > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                      >
                        {badge}
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <span className={cn(
                "text-xs mt-1",
                isActive ? "font-medium" : "font-normal",
                isLandscape && "hidden"
              )}>
                {label}
              </span>
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Quick action item with improved animations
  const QuickAction = ({ 
    icon, 
    label, 
    onClick,
    ariaLabel
  }: { 
    icon: React.ReactNode; 
    label: string; 
    onClick: () => void;
    ariaLabel?: string;
  }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            onClick={() => {
              hapticFeedback.medium();
              onClick();
            }}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-white dark:bg-gray-800 shadow-md"
            whileTap={{ scale: 0.9 }}
            whileHover={{ 
              scale: 1.1, 
              boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)" 
            }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            aria-label={ariaLabel || label}
          >
            {icon}
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="left" sideOffset={5}>
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div 
      ref={navbarRef}
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 px-1 py-1",
        isTablet && "max-w-md mx-auto left-1/2 transform -translate-x-1/2 rounded-t-xl shadow-lg"
      )}
    >
      {/* Step Counter */}
      <div className={cn(
        "hidden",
        stepCount > 0 && "flex items-center justify-center mb-1 py-1",
        isLandscape && "hidden"
      )}>
        <motion.div 
          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/health/steps')}
        >
          <PiStepsFill className="h-3 w-3" />
          <span className="text-xs font-medium">{stepCount.toLocaleString()} steps today</span>
        </motion.div>
      </div>
      
      {/* Main Navigation */}
      <div className="flex items-center justify-around px-1">
        <NavItem 
          icon={<FiIcons.FiHome className="h-5 w-5" />} 
          label="Home" 
          path="/"
          ariaLabel="Go to home page" 
        />
        
        <NavItem 
          icon={<FiIcons.FiBarChart2 className="h-5 w-5" />} 
          label="Progress" 
          path="/progress"
          ariaLabel="View your progress"
        />
        
        <div className="relative">
          <motion.button
            className="rounded-full bg-primary-500 text-white p-3 flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleQuickActions}
            aria-label="Toggle quick actions menu"
            aria-expanded={showQuickActions}
          >
            <AnimatePresence mode="wait">
              {showQuickActions ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FiIcons.FiX className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="plus"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FiIcons.FiPlus className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
          
          {/* Quick Actions Menu */}
          <AnimatePresence>
            {showQuickActions && (
              <motion.div
                ref={quickActionsRef}
                className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 grid grid-cols-3 gap-3 z-50 min-w-[180px]"
                initial={{ scale: 0, opacity: 0 }}
                animate={quickActionsControls}
                exit={{ scale: 0, opacity: 0 }}
              >
                <QuickAction 
                  icon={<FiIcons.FiHeart className="h-4 w-4 text-red-500" />} 
                  label="Log Mood" 
                  onClick={() => {
                    setShowQuickActions(false);
                    navigate('/health/mood');
                  }}
                  ariaLabel="Log your mood"
                />
                <QuickAction 
                  icon={<FiIcons.FiActivity className="h-4 w-4 text-blue-500" />} 
                  label="Log Energy" 
                  onClick={() => {
                    setShowQuickActions(false);
                    navigate('/health/energy');
                  }}
                  ariaLabel="Log your energy level"
                />
                <QuickAction 
                  icon={<FiIcons.FiTarget className="h-4 w-4 text-purple-500" />} 
                  label="Log Craving" 
                  onClick={() => {
                    setShowQuickActions(false);
                    navigate('/health/craving');
                  }}
                  ariaLabel="Log a craving"
                />
                <QuickAction 
                  icon={<PiStepsFill className="h-4 w-4 text-green-500" />} 
                  label="Steps" 
                  onClick={() => {
                    setShowQuickActions(false);
                    navigate('/health/steps');
                  }}
                  ariaLabel="View your step count"
                />
                <QuickAction 
                  icon={<FiIcons.FiDatabase className="h-4 w-4 text-amber-500" />} 
                  label="Consumption" 
                  onClick={() => {
                    setShowQuickActions(false);
                    navigate('/consumption');
                  }}
                  ariaLabel="Log consumption"
                />
                <QuickAction 
                  icon={<FiIcons.FiGlobe className="h-4 w-4 text-indigo-500" />} 
                  label="Directory" 
                  onClick={() => {
                    setShowQuickActions(false);
                    navigate('/nrt-directory');
                  }}
                  ariaLabel="View NRT directory"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <NavItem 
          icon={<FiIcons.FiTarget className="h-5 w-5" />} 
          label="Health" 
          path="/health"
          ariaLabel="Access health dashboard"
        />
        
        <NavItem 
          icon={<FiIcons.FiUser className="h-5 w-5" />} 
          label="Profile" 
          path="/profile" 
          badge={notificationCount}
          ariaLabel="View your profile"
        />
      </div>
      
      {/* Progress indicator for active tab */}
      <div className="absolute top-0 left-0 right-0 flex justify-around px-6">
        {['home', 'progress', '', 'health', 'profile'].map((tab, index) => (
          <div 
            key={index}
            className="relative h-0.5 w-10 flex-1 mx-2"
          >
            {activeTab === tab && (
              <motion.div
                className="absolute inset-0 bg-primary-500 rounded-full"
                layoutId="tabIndicator"
                initial={false}
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
              />
            )}
          </div>
        ))}
      </div>
      
      {/* Home indicator pad for iOS devices */}
      <div className="h-1 sm:h-1.5" />
    </div>
  );
}; 