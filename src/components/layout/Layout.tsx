import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeProvider'; // Corrected import path
import { useAuth } from '@/components/AuthProvider';
import { Moon, Sun, LogOut, UserCircle, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SideNav } from './SideNav';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { session, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const isAppRoute = location.pathname.startsWith('/app');

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {isAppRoute && <SideNav className="hidden md:flex" />}
      
      {isAppRoute && isSidebarOpen && (
         <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={toggleSidebar}>
           <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r" onClick={(e) => e.stopPropagation()}>
             <SideNav />
           </div>
         </div>
      )}

      <div className="flex flex-col flex-1 w-full">
        {isAppRoute && (
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 sm:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
               <Menu className="h-5 w-5" />
               <span className="sr-only">Toggle Sidebar</span>
            </Button>

            <div className="flex-1">
              {/* Can add Breadcrumbs or current page title here later */}
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Toggle Theme"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              {session ? (
                 <>
                  <Link to="/app/profile">
                     <Button variant="ghost" size="icon" aria-label="User Profile">
                        <UserCircle className="h-5 w-5" />
                        <span className="sr-only">User Profile</span>
                     </Button>
                  </Link>
                  <Button variant="ghost" size="icon" aria-label="Sign Out" onClick={() => signOut()}>
                     <LogOut className="h-5 w-5" />
                     <span className="sr-only">Sign Out</span>
                  </Button>
                 </>
              ) : (
                 <Link to="/auth/login">
                    <Button size="sm">Sign In</Button>
                 </Link>
              )}
            </div>
          </header>
        )}

        <main className={cn(
          "flex-1 p-4 md:p-6 lg:p-8",
          isAppRoute && "md:pl-[240px]"
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}
