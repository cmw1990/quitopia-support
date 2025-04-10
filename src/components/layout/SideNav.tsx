
import {
  BarChart2,
  Clock,
  Command,
  Compass,
  Cpu,
  Droplets,
  Home,
  LayoutDashboard,
  Lightbulb,
  Sliders,
  Sparkles,
  TimerOff,
  Award,
  Zap,
  Brain,
  ArrowRightLeft,
  PanelRightClose,
  PanelLeftClose,
  User,
  LogIn,
  Settings,
  HelpCircle,
  CircleSlash,
  Globe,
  ListTodo,
  BarChart,
  ListChecks,
  Shield
} from "lucide-react";

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

// Simple implementation of missing hooks for compatibility
const usePathname = () => window.location.pathname;
const useIsMobile = () => window.innerWidth < 768;

// Simple NavItem component implementation
const NavItem = ({ 
  collapsed, 
  href, 
  icon, 
  label, 
  active 
}: { 
  collapsed: boolean; 
  href: string; 
  icon: React.ReactNode; 
  label: string; 
  active: boolean;
}) => (
  <Link
    to={href}
    className={cn(
      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
      active 
        ? "bg-primary/10 text-primary" 
        : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
    )}
  >
    <div>{icon}</div>
    {!collapsed && <span>{label}</span>}
  </Link>
);

// Simple Logo component
const Logo = ({ className }: { className?: string }) => (
  <Brain className={className} />
);

// Define navigation items
const mainNav = [
  {
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    label: "Dashboard"
  },
  {
    href: "/focus-sessions",
    icon: <Clock className="h-5 w-5" />,
    label: "Focus Sessions"
  },
  {
    href: "/analytics",
    icon: <BarChart className="h-5 w-5" />,
    label: "Analytics"
  },
  {
    href: "/focus-strategies",
    icon: <Compass className="h-5 w-5" />,
    label: "Focus Strategies"
  },
  {
    href: "/tasks",
    icon: <ListChecks className="h-5 w-5" />,
    label: "Tasks & Goals"
  },
  {
    href: "/mood-energy",
    icon: <BarChart className="h-5 w-5" />,
    label: "Mood & Energy"
  }
];

const toolsNav = [
  {
    href: "/tools/pomodoro",
    icon: <Clock className="h-5 w-5" />,
    label: "Pomodoro Timer"
  },
  {
    href: "/tools/task-breakdown",
    icon: <ListChecks className="h-5 w-5" />,
    label: "Task Breakdown"
  },
  {
    href: "/tools/energy-management",
    icon: <Zap className="h-5 w-5" />,
    label: "Energy Management"
  },
  {
    href: "/tools/distraction-blocker",
    icon: <Shield className="h-5 w-5" />,
    label: "Distraction Blocker"
  }
];

const accountNav = [
  {
    href: "/profile",
    icon: <User className="h-5 w-5" />,
    label: "Profile Settings"
  },
  {
    href: "/achievements",
    icon: <Sparkles className="h-5 w-5" />,
    label: "Achievements"
  }
];

// Add a simple User type definition to match the hook usage
interface User {
  email: string;
  avatarUrl?: string;
  displayName?: string;
}

// Update the useAuth hook with our simplified interface
const useAuth = () => {
  // Mock implementation for the hook
  const user = {
    email: "user@example.com",
    avatarUrl: "",
    displayName: "User"
  } as User;
  
  return { user };
};

interface SideNavProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SideNav({ className, ...props }: SideNavProps) {
  const location = useLocation();
  const pathname = location.pathname;
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-20 flex h-full flex-col border-r bg-card text-card-foreground",
      collapsed ? "w-[72px]" : "w-[240px]",
      isMobile && "hidden",
      className
    )}>
      <div className="flex h-16 items-center border-b px-4">
        <Link to="/" className="flex items-center gap-2">
          <Logo className="h-7 w-7" />
          {!collapsed && (
            <span className="font-bold transition-opacity">Easier Focus</span>
          )}
        </Link>
        <Button 
          variant="ghost" 
          size="icon"
          className="ml-auto"
          onClick={toggleCollapse}
        >
          {collapsed ? <PanelRightClose className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>
      
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="px-3 py-2">
          {/* Main Navigation */}
          <div className="space-y-1">
            {mainNav.map((item) => (
              <Link to={item.href} key={item.href}>
                <Button
                  variant={pathname.startsWith(item.href) ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  {item.icon}
                  {!collapsed && <span className="ml-2">{item.label}</span>}
                </Button>
              </Link>
            ))}
          </div>
          
          {/* Divider */}
          <Separator className="my-2" />
          
          {/* Tools Section */}
          <div className="space-y-1">
            <div className={cn(
              "flex items-center px-3 text-xs font-medium text-muted-foreground",
              collapsed && "justify-center"
            )}>
              {!collapsed ? "Tools" : "—"}
            </div>
            <ScrollArea className="h-[300px]">
              <div className="space-y-1 px-1">
                {toolsNav.map((item) => (
                  <Link to={item.href} key={item.href}>
                    <Button
                      variant={pathname.startsWith(item.href) ? "secondary" : "ghost"}
                      className="w-full justify-start"
                    >
                      {item.icon}
                      {!collapsed && <span className="ml-2">{item.label}</span>}
                    </Button>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* Divider */}
          <Separator className="my-2" />
          
          {/* Profile Section */}
          <div className="space-y-1">
            <div className={cn(
              "flex items-center px-3 text-xs font-medium text-muted-foreground",
              collapsed && "justify-center"
            )}>
              {!collapsed ? "Account" : "—"}
            </div>
            {accountNav.map((item) => (
              <NavItem 
                key={item.href}
                collapsed={collapsed}
                href={item.href}
                icon={item.icon}
                label={item.label}
                active={pathname.startsWith(item.href)}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* User Profile at the bottom */}
      <div className="mt-auto border-t p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{user.displayName?.charAt(0) || "U"}</AvatarFallback>
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.displayName || "User"} />}
          </Avatar>
          {!collapsed && (
            <div className="grid leading-none">
              <span className="font-medium">{user.displayName || "User"}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
