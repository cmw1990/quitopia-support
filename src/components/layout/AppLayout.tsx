import React from 'react';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';
import OfflineStatusBanner from '../offline/OfflineStatusBanner';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <OfflineStatusBanner position="top" />
      <main className="flex-grow">
        {children}
      </main>
      <AppFooter />
    </div>
  );
};

export default AppLayout; 