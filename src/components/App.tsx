import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './ThemeProvider';
import { OfflineProvider } from '../contexts/OfflineContext';
import { AuthProvider } from '../contexts/AuthContext';
import { SurveyProvider } from '../contexts/SurveyContext';
import { RecentlyViewedProvider } from '../contexts/RecentlyViewedContext';
import { JournalProvider } from '../contexts/JournalContext';
import { Toaster as UIToaster } from './ui/toaster';
import { Toaster } from 'react-hot-toast';
import MobileDetector from './MobileDetector';
import { LoginPage } from './LoginPage';
import { Dashboard } from './Dashboard';
import { NRTDirectory } from './NRTDirectory';
import TaskManager from './TaskManager';
import Journal from './Journal';
import { Settings } from './Settings';
import { OfflineIndicator } from './OfflineIndicator';
import ConsumptionLogger from './ConsumptionLogger';
import AchievementSystem from './Achievements/AchievementSystem';
import MobileNavigation from './MobileNavigation';
import { useAuth } from '../hooks/useAuth';

// ProtectedRoute component to handle auth checks
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuth();
  return <>{children}</>;
};

/**
 * Main application component
 * Wraps the router with all necessary context providers
 */
export function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="mission-fresh-theme">
      <AuthProvider>
        <OfflineProvider>
          <SurveyProvider>
            <RecentlyViewedProvider>
              <JournalProvider>
                <Router>
                  <MobileDetector>
                    {(isMobile) => (
                      <>
                        <OfflineIndicator />
                        {isMobile && <MobileNavigation />}
                        <div className={isMobile ? 'has-mobile-navigation' : ''}>
                          <Routes>
                            {/* Auth routes */}
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<LoginPage />} />
                            
                            {/* Protected routes */}
                            <Route path="/" element={<ProtectedRoute><Dashboard session={null} /></ProtectedRoute>} />
                            <Route path="/nrt" element={<ProtectedRoute><NRTDirectory session={null} /></ProtectedRoute>} />
                            <Route path="/consumption" element={<ProtectedRoute><ConsumptionLogger session={null} /></ProtectedRoute>} />
                            <Route path="/tasks" element={<ProtectedRoute><TaskManager session={null} /></ProtectedRoute>} />
                            <Route path="/journal" element={<ProtectedRoute><Journal session={null} /></ProtectedRoute>} />
                            <Route path="/settings" element={<ProtectedRoute><Settings session={null} /></ProtectedRoute>} />
                            <Route path="/achievements" element={<ProtectedRoute><AchievementSystem /></ProtectedRoute>} />
                            
                            {/* Fallback route */}
                            <Route path="*" element={<LoginPage />} />
                          </Routes>
                        </div>
                      </>
                    )}
                  </MobileDetector>
                  {/* UI Toast system for shadcn */}
                  <UIToaster />
                  {/* React Hot Toast for global notifications */}
                  <Toaster 
                    position="top-center"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: 'var(--background)',
                        color: 'var(--foreground)',
                        border: '1px solid var(--border)',
                        padding: '16px',
                        borderRadius: '8px'
                      },
                      success: {
                        iconTheme: {
                          primary: 'var(--primary)',
                          secondary: 'white',
                        },
                      },
                      error: {
                        iconTheme: {
                          primary: 'var(--destructive)',
                          secondary: 'white',
                        },
                      },
                    }}
                  />
                </Router>
              </JournalProvider>
            </RecentlyViewedProvider>
          </SurveyProvider>
        </OfflineProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 