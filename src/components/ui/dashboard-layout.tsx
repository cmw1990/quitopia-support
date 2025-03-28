import React from "react";
import { cn } from "@/lib/utils";
import { MobileNav } from "./mobile-nav";
import { Sidebar } from "./sidebar";
import { useLocation } from "react-router-dom";
import { 
  Plus, 
  Menu, 
  X, 
  BellRing,  
  Home, 
  BarChart2, 
  Users, 
  Settings 
} from "lucide-react";
import { Button } from "./button";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ScrollArea } from "./scroll-area";
import { Toaster } from "./toaster";

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  mobileNav?: React.ReactNode;
  showQuickLog?: boolean;
  onQuickLogClick?: () => void;
  username?: string;
  avatarUrl?: string;
  unreadNotifications?: number;
  className?: string;
}

export function DashboardLayout({
  children,
  sidebar,
  header,
  mobileNav,
  showQuickLog = true,
  onQuickLogClick,
  username,
  avatarUrl,
  unreadNotifications = 0,
  className
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const location = useLocation();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isTablet = useMediaQuery("(min-width: 768px)");
  
  // Custom sidebar that shows on desktop
  const renderSidebar = sidebar || (
    <Sidebar 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen w-64 bg-white shadow-lg dark:bg-gray-900 transition-transform duration-300",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    />
  );
  
  // Default mobile navigation that shows on mobile
  const renderMobileNav = mobileNav || (
    <MobileNav 
      username={username}
      avatarUrl={avatarUrl}
      showFloatingButton={showQuickLog}
      onFloatingButtonClick={onQuickLogClick}
    />
  );
  
  // Custom header with responsive menu
  const renderHeader = header || (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-white px-4 dark:bg-gray-900 lg:pl-64">
      <div className="flex items-center">
        {!isDesktop && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-2 lg:hidden"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        )}
        <div className="flex items-center">
          <img 
            src="/logo.svg" 
            alt="Mission Fresh" 
            className="h-8 w-8 mr-2"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/32?text=MF';
            }}
          />
          <h1 className="font-semibold text-lg hidden sm:block">Mission Fresh</h1>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {isTablet && (
          <nav className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "text-sm flex items-center gap-1",
                location.pathname === "/app" ? "bg-primary/10 text-primary" : ""
              )}
              aria-current={location.pathname === "/app" ? "page" : undefined}
              onClick={() => {/* navigate to home */}}
            >
              <Home className="h-4 w-4" />
              <span className="hidden md:inline">Home</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "text-sm flex items-center gap-1",
                location.pathname === "/app/progress" ? "bg-primary/10 text-primary" : ""
              )}
              aria-current={location.pathname === "/app/progress" ? "page" : undefined}
              onClick={() => {/* navigate to progress */}}
            >
              <BarChart2 className="h-4 w-4" />
              <span className="hidden md:inline">Progress</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "text-sm flex items-center gap-1",
                location.pathname === "/app/community" ? "bg-primary/10 text-primary" : ""
              )}
              aria-current={location.pathname === "/app/community" ? "page" : undefined}
              onClick={() => {/* navigate to community */}}
            >
              <Users className="h-4 w-4" />
              <span className="hidden md:inline">Community</span>
            </Button>
          </nav>
        )}
        
        <div className="relative">
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <BellRing className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </Button>
        </div>
        
        {isTablet && showQuickLog && (
          <Button 
            onClick={onQuickLogClick}
            className="flex items-center gap-1"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            <span>Quick Log</span>
          </Button>
        )}
      </div>
    </header>
  );
  
  // Click outside sidebar to close it on mobile
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!isDesktop && sidebarOpen) {
        const sidebar = document.getElementById('main-sidebar');
        if (sidebar && !sidebar.contains(e.target as Node)) {
          setSidebarOpen(false);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen, isDesktop]);
  
  // Close sidebar when route changes on mobile
  React.useEffect(() => {
    if (!isDesktop) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isDesktop]);

  return (
    <div className={cn("relative min-h-screen bg-gray-50 dark:bg-gray-950", className)}>
      {/* Sidebar overlay on mobile */}
      {sidebarOpen && !isDesktop && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Main sidebar */}
      <div id="main-sidebar">
        {renderSidebar}
      </div>
      
      {/* Main content area */}
      <div className={cn(
        "flex min-h-screen flex-col transition-all duration-300",
        isDesktop ? "lg:ml-64" : "ml-0"
      )}>
        {renderHeader}
        
        <main className="flex-1 pb-16 md:pb-0">
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <div className="container px-4 py-6">
              {children}
            </div>
          </ScrollArea>
        </main>
        
        {!isTablet && renderMobileNav}
      </div>
      
      <Toaster />
    </div>
  );
} 