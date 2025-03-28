import React from 'react';
import { Header } from './Header';
import Footer from './Footer';
import { MobileNavigation } from './MobileNavigation';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header title={title} subtitle={subtitle} />
      
      <main className={`flex-grow ${isMobile ? 'pb-20' : ''}`}>
        {children}
      </main>
      
      {/* Show footer on desktop, mobile navigation on mobile */}
      {isMobile ? (
        <MobileNavigation />
      ) : (
        <Footer />
      )}
    </div>
  );
} 