import React from 'react';
import { Outlet } from 'react-router-dom';
import { Logo } from '@/components/ui/logo';

// Explicitly define props interface
interface AuthLayoutProps {
  children?: React.ReactNode; // Outlet will be passed here
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 p-4">
      {/* Render children (which includes the Outlet) */}
      {children || <Outlet />} 
    </div>
  );
}; 