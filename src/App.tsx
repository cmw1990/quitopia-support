import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { I18nProvider } from './i18n/i18n-provider';
import { ThemeProvider } from './components/ThemeProvider';
import { OfflineProvider } from './context/OfflineContext';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AuthProvider } from './components/AuthProvider';
import { SurveyProvider } from './contexts/SurveyContext';
import { RecentlyViewedProvider } from './contexts/RecentlyViewedContext';
import { JournalProvider } from './contexts/JournalContext';
import ErrorBoundary from './components/ErrorBoundary';
import { AppRouter } from './router';
import { motion } from 'framer-motion';
import { initializeDeviceFeatures } from './utils/deviceIntegration';

function App(): JSX.Element {
  useEffect(() => {
    // Initialize device-specific features for mobile
    const initializeApp = async () => {
      try {
        await initializeDeviceFeatures();
      } catch (error) {
        console.error('Error initializing device features:', error);
      }
    };
    
    initializeApp();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <OfflineProvider>
          <Router>
            <AuthProvider>
              <SurveyProvider>
                <RecentlyViewedProvider>
                  <JournalProvider>
                    <I18nProvider defaultLanguage="en">
                      <motion.div 
                        className="min-h-screen bg-background text-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <AppRouter />
                      </motion.div>
                      <Toaster />
                    </I18nProvider>
                    
                    {/* Fixed position elements */}
                    <div className="fixed bottom-4 right-4 z-50">
                      <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1, type: "spring" }}
                      >
                        <OfflineIndicator />
                      </motion.div>
                    </div>
                  </JournalProvider>
                </RecentlyViewedProvider>
              </SurveyProvider>
            </AuthProvider>
          </Router>
        </OfflineProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App; 