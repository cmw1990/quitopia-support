import React, { useState } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase-client';
import { cn } from '@/lib/utils';
import {
  Award,
  BarChart2,
  Brain,
  Calendar,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Cog,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Settings,
  Shield,
  Sparkles,
  StickyNote,
  Sun,
  User,
  Users,
  X,
  Zap,
  Lightbulb,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserNav } from '@/components/layout/UserNav';

interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
}

export function AppLayout({ children }: { children?: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  const navItems: NavItem[] = [
    { title: 'Dashboard', path: '/app/dashboard', icon: <LayoutDashboard size={20} /> },
    { title: 'Pomodoro Timer', path: '/app/pomodoro', icon: <Clock size={20} /> },
    { title: 'Tasks', path: '/app/tasks', icon: <CheckSquare size={20} /> },
    { title: 'Analytics', path: '/app/analytics', icon: <BarChart2 size={20} /> },
    { title: 'Achievements', path: '/app/achievements', icon: <Award size={20} /> },
    { title: 'Strategies', path: '/app/strategies', icon: <Lightbulb size={20}/> },
  ];
  
  const bottomNavItems: NavItem[] = [
    { title: 'Settings', path: '/app/settings', icon: <Settings size={20} /> },
  ];
  
  const isActive = (path: string) => location.pathname === path || (path !== '/app/dashboard' && location.pathname.startsWith(path));
  
  return (
    <TooltipProvider delayDuration={0}>
      <div className={cn("flex h-screen bg-background")}>
        {/* Desktop Sidebar */}
        <aside 
          className={cn(
              "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border/60 bg-card",
              "transition-all duration-300 ease-in-out md:flex",
              isCollapsed ? "w-[72px]" : "w-64",
          )}
        >
          {/* Sidebar Header */}
          <div className={cn(
              "flex items-center h-16 px-4 border-b border-border/60",
              isCollapsed ? "justify-center" : "justify-between"
          )}>
            <Link 
              to="/app/dashboard" 
              className={cn(
                "flex items-center gap-2 group",
                isCollapsed && "justify-center"
              )}
            >
              <Brain className="h-7 w-7 text-primary flex-shrink-0" />
              <span className={cn(
                  "font-semibold text-lg whitespace-nowrap overflow-hidden",
                  isCollapsed ? "sr-only" : "opacity-100 transition-opacity duration-200 delay-100"
              )}>Easier Focus</span>
            </Link>
          </div>
            
          {/* Sidebar Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => (
              <Tooltip key={item.title}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.path}
                    className={cn(
                        "flex items-center h-10 px-3 rounded-lg transition-colors duration-150",
                        isActive(item.path)
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'hover:bg-muted text-muted-foreground hover:text-foreground',
                        isCollapsed ? "justify-center" : ""
                    )}
                  >
                    <div className={cn("flex-shrink-0", isCollapsed ? "" : "mr-3")}>{item.icon}</div>
                    <span className={cn(
                        "whitespace-nowrap overflow-hidden transition-opacity duration-200", 
                        isCollapsed ? "sr-only" : "opacity-100 delay-100"
                    )}>
                      {item.title}
                    </span>
                  </Link>
                </TooltipTrigger>
                {isCollapsed && (
                    <TooltipContent side="right" className="ml-2">
                        {item.title}
                    </TooltipContent>
                )}
              </Tooltip>
            ))}
          </nav>
            
          {/* Sidebar Footer */}
          <div className={cn("px-3 py-4 border-t border-border/60 space-y-2")}>
            {bottomNavItems.map((item) => (
               <Tooltip key={item.title}>
                <TooltipTrigger asChild>
                   <Link
                    to={item.path}
                    className={cn(
                        "flex items-center h-10 px-3 rounded-lg transition-colors duration-150",
                        isActive(item.path)
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'hover:bg-muted text-muted-foreground hover:text-foreground',
                         isCollapsed ? "justify-center" : ""
                    )}
                  >
                    <div className={cn("flex-shrink-0", isCollapsed ? "" : "mr-3")}>{item.icon}</div>
                    <span className={cn(
                        "whitespace-nowrap overflow-hidden transition-opacity duration-200", 
                        isCollapsed ? "sr-only" : "opacity-100 delay-100"
                    )}>
                       {item.title}
                     </span>
                   </Link>
                 </TooltipTrigger>
                 {isCollapsed && (
                    <TooltipContent side="right" className="ml-2">
                        {item.title}
                    </TooltipContent>
                  )}
               </Tooltip>
            ))}
            
            {/* User Profile Dropdown */}
            <div className={cn("mt-2 pt-3 border-t border-border/60", isCollapsed ? "px-1" : "")}>
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className={cn(
                          "w-full flex items-center h-11 transition-colors duration-150 hover:bg-muted", 
                          isCollapsed ? "justify-center px-0" : "justify-start px-3 gap-2"
                        )}
                      >
                        <Avatar className={cn("h-8 w-8 flex-shrink-0")}>
                           <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email} />
                           <AvatarFallback>{user?.email?.[0].toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className={cn("flex-1 text-left overflow-hidden", isCollapsed ? "sr-only" : "")}>
                            <p className="text-sm font-medium truncate leading-tight">{user?.user_metadata?.full_name || user?.email}</p>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  {isCollapsed && <TooltipContent side="right" className="ml-2">Profile & Settings</TooltipContent>}
                </Tooltip>
                <DropdownMenuContent side={isCollapsed ? "right" : "top"} align="start" className="w-56 mb-1 ml-1">
                  <DropdownMenuLabel className="truncate font-normal text-muted-foreground">Signed in as</DropdownMenuLabel>
                  <DropdownMenuLabel className="truncate font-medium">{user?.user_metadata?.full_name || user?.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/app/profile"> <User className="mr-2 h-4 w-4" /> Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/app/settings"> <Settings className="mr-2 h-4 w-4" /> Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Sidebar Toggle Button - Positioned at the bottom or side */}
            <div className="mt-auto p-3 flex justify-center border-t border-border/60">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={toggleSidebar}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    <span className="sr-only">{isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}</span>
                </Button>
            </div>
          </div>
        </aside>
        
        {/* Main Content Area */}
        <main 
          className={cn(
            "flex-1 flex flex-col h-screen overflow-y-auto transition-all duration-300 ease-in-out",
            isCollapsed ? "md:pl-[72px]" : "md:pl-64"
          )}
        >
            {/* Header for Mobile Nav Toggle and User Menu */}
             <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border/60 bg-background/95 px-4 backdrop-blur md:justify-end md:px-6">
                {/* Mobile Menu Trigger - Visible only on smaller screens */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden" 
                  onClick={toggleSidebar}
                 >
                   <Menu className="h-6 w-6" />
                   <span className="sr-only">Toggle Menu</span>
                 </Button>
                
                {/* Placeholder for Breadcrumbs/Title if needed */}
                <div className="flex-1 md:hidden"></div>

                {/* Desktop Sidebar Toggle - Placed in header, adjust styling */}
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   className="hidden md:inline-flex"
                   onClick={toggleSidebar}
                 >
                   {isCollapsed ? <ChevronRight className="h-5 w-5"/> : <ChevronLeft className="h-5 w-5"/>}
                   <span className="sr-only">Toggle Sidebar</span>
                 </Button>
                 
                {/* Search/Notifications (Placeholders) */}
                 <div className="flex items-center gap-2">
                    <TooltipProvider>
                       <Tooltip>
                         <TooltipTrigger asChild>
                           <Button variant="ghost" size="icon">
                             <HelpCircle className="h-5 w-5" />
                           </Button>
                         </TooltipTrigger>
                         <TooltipContent>Help & Resources</TooltipContent>
                       </Tooltip>
                     </TooltipProvider>
                     
                     <TooltipProvider>
                       <Tooltip>
                         <TooltipTrigger asChild>
                           <Button variant="ghost" size="icon">
                             <Moon className="h-5 w-5" />
                           </Button>
                         </TooltipTrigger>
                         <TooltipContent>Toggle Theme</TooltipContent>
                       </Tooltip>
                     </TooltipProvider>
                 </div>
                 <UserNav />
             </header>
            
             <div className="flex-1 overflow-y-auto">
                {/* Render the actual page content */}
                 {children ? children : <Outlet />}
            </div>
        </main>
      </div>
    </TooltipProvider>
  );
} 