import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Calendar, BarChart2, Menu, X, Settings, HelpCircle, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { hapticFeedback } from '../utils/hapticFeedback';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Hide mobile navigation on desktop
  if (!isMobile) return null;
  
  const navItems: NavItem[] = [
    {
      icon: <Home className="h-6 w-6" />,
      label: 'Home',
      path: '/',
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      label: 'Guides',
      path: '/guides',
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      label: 'Progress',
      path: '/progress',
    },
    {
      icon: <BarChart2 className="h-6 w-6" />,
      label: 'Stats',
      path: '/stats',
    },
  ];
  
  const menuItems: NavItem[] = [
    {
      icon: <User className="h-6 w-6" />,
      label: 'Profile',
      path: '/profile',
    },
    {
      icon: <Settings className="h-6 w-6" />,
      label: 'Settings',
      path: '/settings',
    },
    {
      icon: <HelpCircle className="h-6 w-6" />,
      label: 'Help & Support',
      path: '/help',
    },
  ];
  
  const handleNavItemClick = (path: string) => {
    // Provide haptic feedback on navigation
    hapticFeedback.selectionChanged();
    
    // Close menu if open
    if (isOpen) {
      setIsOpen(false);
    }
  };
  
  const toggleMenu = () => {
    // Provide haptic feedback on menu toggle
    hapticFeedback.medium();
    setIsOpen(!isOpen);
  };
  
  const bottomNavVariants = {
    hidden: { y: 100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: 'spring',
        stiffness: 500,
        damping: 30
      }
    },
    exit: { 
      y: 100, 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };
  
  const menuVariants = {
    hidden: { opacity: 0, x: '100%' },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      opacity: 0, 
      x: '100%',
      transition: { 
        duration: 0.3,
        ease: 'easeInOut'
      }
    }
  };
  
  return (
    <>
      {/* Bottom Navigation Bar */}
      <motion.nav 
        className="fixed bottom-0 left-0 right-0 bg-background border-t border-border h-16 px-2 z-50"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={bottomNavVariants}
      >
        <div className="h-full max-w-md mx-auto grid grid-cols-4 items-center">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => handleNavItemClick(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center h-full",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-primary-muted"
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.icon}
                <span className="text-xs mt-1">{item.label}</span>
                {isActive && (
                  <motion.div
                    className="absolute bottom-0 h-1 w-12 bg-primary rounded-t-md"
                    layoutId="activeTab"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </motion.nav>
      
      {/* More Menu Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          delay: 0.3,
          type: "spring",
          stiffness: 500,
          damping: 30
        }}
        onClick={toggleMenu}
        className="fixed bottom-20 right-4 z-50 bg-primary text-primary-foreground rounded-full p-3 shadow-lg"
        aria-label="Menu"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </motion.button>
      
      {/* Full Screen Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={menuVariants}
            className="fixed inset-0 z-40 bg-background pt-16 px-4"
          >
            <div className="flex flex-col space-y-6 mt-12">
              {menuItems.map((item) => (
                <Link 
                  key={item.path}
                  to={item.path} 
                  onClick={() => handleNavItemClick(item.path)}
                  className="flex items-center space-x-4 p-4 rounded-lg hover:bg-muted"
                >
                  <div className="text-primary">{item.icon}</div>
                  <span className="text-lg font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 