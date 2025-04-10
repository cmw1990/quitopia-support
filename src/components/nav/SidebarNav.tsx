import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart2, Calendar, CheckSquare, Clock, Settings, StickyNote, User, Users, Award, LayoutDashboard, LogOut } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from '@/components/AuthProvider';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from '@/integrations/supabase/supabase-client';

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ForwardRefExoticComponent<any>;
  isCollapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ href, label, icon: Icon, isCollapsed }) => {
  const { pathname } = useLocation();
  const isActive = pathname === href;

  return (
    <Link to={href} className={cn(
      "group flex items-center rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-secondary",
      isActive ? "bg-secondary text-foreground" : "text-muted-foreground",
      isCollapsed ? "justify-center" : "justify-start"
    )}>
      <Icon className="mr-2 h-4 w-4" />
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );
};

export const SidebarNav = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const { user } = useAuth();

  const navItems = [
    { href: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/app/focus', label: 'Focus Timer', icon: Clock },
    { href: '/app/tasks', label: 'Tasks', icon: CheckSquare },
    { href: '/app/analytics', label: 'Analytics', icon: BarChart2 }, // Added Analytics link
    { href: '/app/community', label: 'Community', icon: Users }, // <-- Added Community link
    { href: '/app/achievements', label: 'Achievements', icon: Award }, // <-- Added Achievements link
    // Add Calendar and Notes when implemented
    // { href: '/app/calendar', label: 'Calendar', icon: Calendar },
    // { href: '/app/notes', label: 'Notes', icon: StickyNote },
  ];

  const bottomNavItems = [
    // { href: '/app/profile', label: 'Profile', icon: User }, // Example Profile link
    { href: '/app/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      <TooltipProvider>
        <div className="flex h-full w-60 flex-col border-r border-primary/10 bg-secondary">
          <Link to="/" className="flex items-center justify-center h-16 shrink-0 border-b border-primary/10">
            <h1 className="font-semibold text-lg">Easier Focus</h1>
          </Link>
          <ScrollArea className="flex-1">
            <div className="py-2">
              <nav className="grid gap-1 px-2">
                {/* Map main navigation items */}
                {navItems.map((item) => (
                  <NavItem key={item.href} {...item} isCollapsed={isCollapsed} />
                ))}
              </nav>
            </div>
            {/* Bottom Navigation */}
            <div className="mt-auto">
              <nav className="grid gap-1 px-2 pb-4">
                {bottomNavItems.map((item) => (
                  <NavItem key={item.href} {...item} isCollapsed={isCollapsed} />
                ))}
                {/* User Avatar/Logout - Adapt based on actual implementation */}
                {user && (
                  <div className={cn("flex items-center gap-2 p-2 rounded-md", isCollapsed ? "justify-center" : "")}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url || ""} alt={user.email || "User Avatar"} />
                      <AvatarFallback>{user.email?.[0].toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    {!isCollapsed && (
                      <div className="flex flex-col text-sm">
                        <span className="font-medium truncate">{user.user_metadata?.full_name || user.email}</span>
                        <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-muted-foreground justify-start hover:text-destructive" onClick={() => supabase.auth.signOut()}>Logout</Button>
                      </div>
                    )}
                  </div>
                )}
              </nav>
            </div>
          </ScrollArea>
        </div>
      </TooltipProvider>
    </>
  );
};