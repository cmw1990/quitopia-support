/**
 * Main application component that handles routing and page transitions.
 * Uses AnimatePresence for smooth transitions between routes and
 * provides global context providers for theming, authentication,
 * and keyboard shortcuts.
 */

// External libraries
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Pages
import LandingPage from './pages/LandingPage';
import Energy from './pages/Energy';
import AntiFatigue from './pages/AntiFatigue';
import FocusDashboard from './pages/FocusDashboard';

// Layouts and Focus Components
import MainLayout from './layouts/MainLayout';
import { 
  FocusTimerTools, 
  EisenhowerMatrix, 
  DistractionBlocker, 
  ADHDTaskBreakdown 
} from '@/components/focus';

// Providers
import { AuthProvider } from '@/components/AuthProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import { KeyboardShortcutsProvider } from '@/contexts/KeyboardShortcutsContext';

// UI Components
import { ShortcutsGuide } from '@/components/ui/shortcuts-guide';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/components/AuthProvider';

const EasierFocusApp: React.FC = () => {
  const location = useLocation();
  const { session } = useAuth();

  return (
    <ThemeProvider>
      <AuthProvider>
        <KeyboardShortcutsProvider>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {/* Landing page outside of main layout */}
              <Route path="/" element={<LandingPage />} />

              {/* Main application routes with shared layout */}
              <Route element={<MainLayout />}>
                {/* Focus Dashboard */}
                <Route path="/dashboard" element={<FocusDashboard />} />
                
                {/* Focus and productivity tools */}
                <Route path="/timer" element={<FocusTimerTools />} />
                <Route path="/tasks" element={<EisenhowerMatrix />} />
                <Route path="/focus" element={<DistractionBlocker />} />
                <Route path="/breakdown" element={<ADHDTaskBreakdown />} />
                
                {/* Energy management and well-being */}
                <Route path="/energy" element={<Energy />} />
                <Route path="/anti-fatigue" element={<AntiFatigue />} />
              </Route>
            </Routes>
          </AnimatePresence>

          {/* Common UI Elements */}
          <ShortcutsGuide />
          <Toaster />
        </KeyboardShortcutsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default EasierFocusApp;
