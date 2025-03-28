import React, { useState, useEffect } from 'react';
import { Home, Book, BarChart2, User, Settings, PenSquare, Activity, Target, Leaf, Database } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomTabBar from '../components/BottomTabBar';
import { OfflineStatusIndicator } from '../components/OfflineStatusIndicator';
import { cn } from '../utils/cn';
import { useOffline } from '../context/OfflineContext';

interface MissionFreshLayoutProps {
  children: React.ReactNode;
}

// Define the tabs for the bottom navigation
const mainTabs = [
  { name: 'Home', path: '/app', icon: Home },
  { name: 'Progress', path: '/app/progress', icon: BarChart2 },
  { name: 'Health', path: '/app/health', icon: Leaf },
  { name: 'Journal', path: '/app/journal', icon: PenSquare },
  { name: 'Guides', path: '/app/guides', icon: Book }
];

const MissionFreshLayout = ({ children }: MissionFreshLayoutProps) => {
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { isOfflineModeEnabled, pendingSyncCount } = useOffline();

  // Check if we're on a dashboard page which gets special styling
  const isDashboard = location.pathname === '/app' || location.pathname === '/app/dashboard';

  // Track scroll position for header effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle quick action toggle
  const handleQuickActionToggle = (isOpen: boolean) => {
    setShowQuickActions(isOpen);
    
    // Add overflow:hidden to body when quick actions are open to prevent scrolling
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  return (
    <div className="mission-fresh-layout flex flex-col min-h-screen bg-background">
      <TopBar
        className={cn(
          "transition-all duration-200 z-20",
          isScrolled ? "shadow-md bg-background/95 backdrop-blur-sm" : ""
        )}
      />
      
      <main className={cn(
        "flex-1 pt-16", // Space for the fixed header
        isDashboard ? "px-0 pb-0" : "px-4 pb-16", // Different padding for dashboard vs other pages
        showQuickActions ? "overflow-hidden" : ""  // Prevent scrolling when quick actions are open
      )}>
        {children}
      </main>
      
      {/* Offline Mode Quick Access - Only show when offline mode is enabled */}
      {isOfflineModeEnabled && (
        <Link 
          to="/app/offline-test" 
          className={cn(
            "fixed bottom-28 left-4 z-40 bg-background border shadow-md rounded-full p-2.5 flex items-center",
            "text-sm font-medium hover:bg-accent transition-colors"
          )}
        >
          <Database className="h-4 w-4 mr-2 text-primary" />
          <span>Test Offline</span>
          {pendingSyncCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs bg-amber-500 text-white rounded-full">
              {pendingSyncCount}
            </span>
          )}
        </Link>
      )}
      
      <div className="pb-16 lg:pb-0" /> {/* Space for the bottom nav bar */}
      
      <BottomTabBar
        tabs={mainTabs}
        className="lg:hidden" // Only show on mobile
        onQuickActionToggle={handleQuickActionToggle}
        showQuickActions={showQuickActions}
      />
      
      {/* Status indicator in bottom-right corner */}
      <div className={cn(
        "fixed bottom-20 lg:bottom-4 right-4 z-40 transition-opacity duration-200",
        showQuickActions ? "opacity-0 pointer-events-none" : "opacity-100"
      )}>
        <OfflineStatusIndicator 
          variant="full"
          className="shadow-md"
        />
      </div>
    </div>
  );
};

export default MissionFreshLayout; 