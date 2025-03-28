import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import { AppRouter } from './router';
import { ThemeProvider } from './components/theme-provider';
import { I18nProvider } from './i18n/I18nProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OperatingSystemProvider } from './contexts/OSContext';
import { OfflineProvider } from './contexts/OfflineContext';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from './components/ui/sonner';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30 * 60 * 1000, // 30 minutes - increased from 5 minutes to reduce refreshes
      retry: 1,
      refetchInterval: false, // Disable automatic polling by default
    },
  },
});

/**
 * Main application component that sets up providers and routing
 */
const MissionFreshApp: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <HelmetProvider>
          <I18nProvider>
            <ThemeProvider defaultTheme="light" storageKey="mission-fresh-theme">
              <OperatingSystemProvider>
                <OfflineProvider>
                  <AuthProvider>
                    <AppRouter />
                    <Toaster position="top-right" />
                  </AuthProvider>
                </OfflineProvider>
              </OperatingSystemProvider>
            </ThemeProvider>
          </I18nProvider>
        </HelmetProvider>
      </Router>
    </QueryClientProvider>
  );
};

export default MissionFreshApp;
