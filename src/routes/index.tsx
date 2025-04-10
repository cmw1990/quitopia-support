
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '@/pages/app/Dashboard';
import FocusDashboard from '@/pages/FocusDashboard';
import { FocusSessions } from '@/components/FocusSessions';
import { WebappFocus } from '@/pages/webapp/WebappFocus';
import { WellnessDashboard } from '@/components/wellness/WellnessDashboard';
import NotFound from '@/pages/NotFound';
import { RouteGuard } from '@/components/RouteGuard';
import MainLayout from '@/components/layouts/MainLayout';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* App routes with authentication */}
      <Route element={<RouteGuard requireAuth={false} />}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<FocusDashboard />} />
        </Route>
        
        <Route path="/app" element={<MainLayout />}>
          <Route index element={<FocusDashboard />} />
          <Route path="dashboard" element={<WebappFocus />} />
          <Route path="focus-sessions" element={<FocusSessions />} />
          <Route path="wellness" element={<WellnessDashboard />} />
        </Route>
      </Route>

      {/* Catch all undefined routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
