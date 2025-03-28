import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppHeader } from './app-header';
import Footer from '../Footer';
import { MobileNavigation } from '../MobileNavigation';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { hapticFeedback } from '../../utils/hapticFeedback';

export function AppLayout() {
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Provide haptic feedback on route changes
  useEffect(() => {
    if (isMobile) {
      hapticFeedback.selectionChanged();
    }
  }, [location.pathname, isMobile]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      
      <motion.main 
        className={`flex-grow ${isMobile ? 'pb-20' : ''}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        key={location.pathname}
      >
        <Outlet />
      </motion.main>
      
      {/* Show footer on desktop, mobile navigation on mobile */}
      {isMobile ? (
        <MobileNavigation />
      ) : (
        <Footer />
      )}
    </div>
  );
} 