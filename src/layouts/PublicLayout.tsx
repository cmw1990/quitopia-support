import React from 'react';
import { Outlet } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
// import SiteHeader from '../common/SiteHeader'; // Placeholder for a potential shared header
// import SiteFooter from '../common/SiteFooter'; // Placeholder for a potential shared footer

// Explicitly define props interface
interface PublicLayoutProps {
  children?: React.ReactNode; // Outlet will be passed here
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <HelmetProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        {/* <SiteHeader /> */}
        <main className="flex-grow">
          {/* Render children (which includes the Outlet) */}
          {children || <Outlet />} 
        </main>
        {/* <SiteFooter /> */}
      </div>
    </HelmetProvider>
  );
}; 