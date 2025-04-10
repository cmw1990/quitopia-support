
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';

const RootLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
};

export default RootLayout;
