
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RootLayout from '@/components/layouts/RootLayout';
import GamesPage from '@/pages/app/games/GamesPage';
import GamesLayout from '@/pages/app/games/GamesLayout';
import Dashboard from '@/pages/app/Dashboard';
import FocusTimer from '@/pages/app/FocusTimer';
import DistractionBlocker from '@/pages/app/DistractionBlocker';
import MoodTracker from '@/pages/app/MoodTracker';
import NotFound from '@/pages/NotFound';
import { RouteGuard } from '@/components/RouteGuard';
import { Layout } from '@/components/Layout';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<RootLayout />}>
        <Route index element={<GamesPage />} />
      </Route>
      
      {/* App routes with authentication */}
      <Route element={<RouteGuard requireAuth={false} />}>
        <Route path="/app" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="focus-timer" element={<FocusTimer />} />
          <Route path="distraction-blocker" element={<DistractionBlocker />} />
          <Route path="mood-tracker" element={<MoodTracker />} />
          
          {/* Games section */}
          <Route path="games" element={<GamesLayout />}>
            <Route index element={<GamesPage />} />
          </Route>
        </Route>
      </Route>

      {/* Catch all undefined routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
