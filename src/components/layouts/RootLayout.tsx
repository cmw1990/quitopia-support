
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';

const RootLayout: React.FC = () => {
  console.log('RootLayout rendering');
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
};

export default RootLayout;
