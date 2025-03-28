import React from 'react';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import RootLayout from './components/layouts/RootLayout';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import SmokelessProductsDirectory from './pages/SmokelessProductsDirectory';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import WebToolsLayout from './components/layouts/WebToolsLayout';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<LoginPage />} />
      
      {/* Web Tools Routes - for non-logged in users */}
      <Route path="/web-tools" element={<WebToolsLayout />}>
        <Route path="nrt-directory" element={<SmokelessProductsDirectory />} />
        {/* Add other web tools routes here */}
      </Route>
      
      {/* Protected Routes (App) */}
      <Route path="/app" element={<ProtectedRoute><RootLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="nrt-directory" element={<SmokelessProductsDirectory />} />
        {/* Add other protected routes here */}
      </Route>
      
      {/* Fallback */}
      <Route path="*" element={<div>Page Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes; 