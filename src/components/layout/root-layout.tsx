import React from 'react';
import { Outlet } from 'react-router-dom';

export function RootLayout() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto p-4">
        <Outlet />
      </div>
    </main>
  );
}
