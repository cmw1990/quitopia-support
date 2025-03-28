import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from '../PublicNavbar';
import Footer from '../Footer';

export const WebToolsLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicNavbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default WebToolsLayout; 