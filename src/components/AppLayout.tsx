import React, { useState } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from './AuthProvider';
import {
  BarChart2,
  Brain,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Cog,
  HelpCircle,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Settings,
  Shield,
  Sparkles,
  Sun,
  User,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
}

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast('Failed to sign out. Please try again.');
    }
  };
  
  const navItems: NavItem[] = [
    { title: 'Dashboard', path: '/app/dashboard', icon: <LayoutDashboard size={20} /> },
    { title: 'Flow Timer', path: '/app/focus-timer', icon: <Clock size={20} /> },
    { title: 'Digital Wellness', path: '/app/antigooglitis', icon: <Shield size={20} /> },
    { title: 'Body Doubling', path: '/app/body-doubling', icon: <Users size={20} /> },
    { title: 'Context Switching', path: '/app/context-switching', icon: <Sparkles size={20} /> },
    { title: 'Energy Scheduler', path: '/app/energy-scheduler', icon: <Zap size={20} /> },
    { title: 'Focus Insights', path: '/app/focus-insights', icon: <BarChart2 size={20} /> },
    { title: 'Achievements', path: '/app/achievements', icon: <Sparkles size={20} /> },
  ];
  
  const footerNavItems: NavItem[] = [
    { title: 'Settings', path: '/app/settings', icon: <Settings size={20} /> },
  ];
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Header */}
      <header className="fixed top-0 z-40 flex h-14 w-full items-center justify-between border-b bg-background px-4 lg:hidden">
        <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        
        <Link to="/app/dashboard" className="flex items-center font-semibold">
          <Brain className="mr-2 h-5 w-5 text-primary" />
          <span>Easier Focus</span>
        </Link>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {user?.user_metadata?.full_name || user?.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/app/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/app/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      
      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed inset-0 z-50 flex flex-col bg-background pt-14 lg:hidden"
          >
            <div className="flex items-center justify-between border-b px-4 py-2">
              <p className="text-lg font-semibold">Menu</p>
              <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
                <X className="h-5 w-5" />
                <span className="sr-only">Close menu</span>
              </Button>
            </div>
            
            <div className="flex-1 overflow-auto p-4">
              <nav className="flex flex-col space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center rounded-md px-3 py-2 ${
                      isActive(item.path)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                    onClick={toggleMobileMenu}
                  >
                    {item.icon}
                    <span className="ml-3">{item.title}</span>
                  </Link>
                ))}
              </nav>
            </div>
            
            <div className="border-t p-4">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-5 w-5" />
                Sign out
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Desktop Sidebar */}
      <aside
        className={`hidden h-screen w-[${
          sidebarOpen ? '240px' : '70px'
        }] flex-col border-r bg-background transition-all duration-300 lg:flex`}
        style={{ width: sidebarOpen ? '240px' : '70px' }}
      >
        <div className="flex h-14 items-center border-b px-4">
          <Link to="/app/dashboard" className="flex items-center font-semibold">
            <Brain className="h-5 w-5 text-primary" />
            {sidebarOpen && <span className="ml-2">Easier Focus</span>}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={toggleSidebar}
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </div>
        
        <div className="flex-1 overflow-auto p-3">
          <nav className="flex flex-col space-y-1">
            <TooltipProvider>
              {navItems.map((item) => (
                <Tooltip key={item.path} delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.path}
                      className={`flex items-center rounded-md px-3 py-2 ${
                        isActive(item.path)
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {item.icon}
                      {sidebarOpen && <span className="ml-3">{item.title}</span>}
                    </Link>
                  </TooltipTrigger>
                  {!sidebarOpen && (
                    <TooltipContent side="right">{item.title}</TooltipContent>
                  )}
                </Tooltip>
              ))}
            </TooltipProvider>
          </nav>
        </div>
        
        <div className="border-t p-3">
          <TooltipProvider>
            {footerNavItems.map((item) => (
              <Tooltip key={item.path} delayDuration={300}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.path}
                    className={`flex items-center rounded-md px-3 py-2 ${
                      isActive(item.path)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {item.icon}
                    {sidebarOpen && <span className="ml-3">{item.title}</span>}
                  </Link>
                </TooltipTrigger>
                {!sidebarOpen && (
                  <TooltipContent side="right">{item.title}</TooltipContent>
                )}
              </Tooltip>
            ))}
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={`mt-2 w-full justify-${sidebarOpen ? 'start' : 'center'}`}
                  onClick={handleSignOut}
                >
                  <LogOut className="h-5 w-5" />
                  {sidebarOpen && <span className="ml-3">Sign out</span>}
                </Button>
              </TooltipTrigger>
              {!sidebarOpen && <TooltipContent side="right">Sign out</TooltipContent>}
            </Tooltip>
          </TooltipProvider>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-14 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
