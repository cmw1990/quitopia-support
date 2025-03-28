import React from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  BarChart2,
  PlusCircle,
  Users,
  Settings,
  Package,
  Activity,
  BookOpen,
  Calendar,
  Gamepad2,
  Heart,
  Moon,
  Sun,
  Zap,
  BrainCircuit,
} from "lucide-react";
import { ScrollArea } from "./scroll-area";
import { Button } from "./button";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Badge } from "./badge";

interface SidebarProps {
  className?: string;
  username?: string;
  avatarUrl?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

type NavigationItem = {
  title: string;
  icon: React.ReactNode;
  path: string;
  badge?: {
    content: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  };
};

type NavigationSection = {
  title: string;
  items: NavigationItem[];
};

export function Sidebar({
  className,
  username = "User",
  avatarUrl,
  collapsed = false,
  onToggleCollapse
}: SidebarProps) {
  const location = useLocation();
  
  // Get user initials for avatar fallback
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Navigation sections and items
  const navigationSections: NavigationSection[] = [
    {
      title: "Core",
      items: [
        {
          title: "Dashboard",
          icon: <Home className="h-5 w-5" />,
          path: "/app",
        },
        {
          title: "Progress",
          icon: <BarChart2 className="h-5 w-5" />,
          path: "/app/progress",
        },
        {
          title: "Log Consumption",
          icon: <PlusCircle className="h-5 w-5" />,
          path: "/app/consumption-logger",
        },
      ],
    },
    {
      title: "Holistic Support",
      items: [
        {
          title: "Energy Support",
          icon: <Zap className="h-5 w-5" />,
          path: "/app/energy-tracker",
        },
        {
          title: "Mood Tracker",
          icon: <Moon className="h-5 w-5" />,
          path: "/app/mood-tracker",
        },
        {
          title: "Focus Assistant",
          icon: <BrainCircuit className="h-5 w-5" />,
          path: "/app/focus-tracker",
        },
        {
          title: "Health Metrics",
          icon: <Heart className="h-5 w-5" />,
          path: "/app/health-dashboard",
          badge: {
            content: "New",
            variant: "default"
          }
        },
      ],
    },
    {
      title: "Resources",
      items: [
        {
          title: "NRT Directory",
          icon: <Package className="h-5 w-5" />,
          path: "/app/nrt-directory",
        },
        {
          title: "Smokeless Products",
          icon: <Activity className="h-5 w-5" />,
          path: "/app/smokeless-products",
        },
        {
          title: "Guides",
          icon: <BookOpen className="h-5 w-5" />,
          path: "/app/guides",
        },
        {
          title: "Web Tools",
          icon: <Calendar className="h-5 w-5" />,
          path: "/app/web-tools",
        },
      ],
    },
    {
      title: "Community",
      items: [
        {
          title: "Community Hub",
          icon: <Users className="h-5 w-5" />,
          path: "/app/community",
          badge: {
            content: "Active",
            variant: "secondary"
          }
        },
        {
          title: "Games",
          icon: <Gamepad2 className="h-5 w-5" />,
          path: "/app/games",
        },
      ],
    },
  ];
  
  return (
    <div className={cn(
      "flex h-screen flex-col border-r bg-white dark:bg-gray-900 dark:border-gray-800 transition-all duration-300",
      collapsed ? "w-20" : "w-64",
      className
    )}>
      {/* User profile section */}
      <div className={cn(
        "flex items-center border-b px-6 py-4",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed ? (
          <>
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatarUrl} alt={username} />
                <AvatarFallback>{getInitials(username)}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{username}</p>
                <p className="text-xs text-muted-foreground">
                  Mission: Stay Fresh
                </p>
              </div>
            </div>
            {onToggleCollapse && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onToggleCollapse}
                className="h-8 w-8"
                aria-label="Collapse sidebar"
              >
                {collapsed ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            )}
          </>
        ) : (
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl} alt={username} />
            <AvatarFallback>{getInitials(username)}</AvatarFallback>
          </Avatar>
        )}
      </div>
      
      {/* Navigation sections */}
      <ScrollArea className="flex-1 px-3 py-2">
        <div className="space-y-4">
          {navigationSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className={cn(
              "space-y-2",
              !collapsed ? "mt-6" : "mt-6 flex flex-col items-center"
            )}>
              {!collapsed && (
                <h4 className="px-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {section.title}
                </h4>
              )}
              <div className="space-y-1">
                {section.items.map((item, itemIndex) => (
                  <Link 
                    key={itemIndex} 
                    to={item.path}
                    className={cn(
                      "flex items-center justify-center rounded-md px-2 py-2 text-sm font-medium transition-colors",
                      location.pathname === item.path ? 
                        "bg-primary text-primary-foreground" : 
                        "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
                      collapsed ? "h-10 w-10 mx-auto" : "w-full justify-start"
                    )}
                    title={collapsed ? item.title : undefined}
                  >
                    <div className={cn("flex items-center", collapsed ? "justify-center" : "")}>
                      {item.icon}
                      {!collapsed && <span className="ml-3">{item.title}</span>}
                    </div>
                    
                    {!collapsed && item.badge && (
                      <Badge 
                        variant={item.badge.variant}
                        className="ml-auto"
                      >
                        {item.badge.content}
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      {/* Settings link */}
      <div className={cn(
        "border-t p-3",
        collapsed ? "flex justify-center" : ""
      )}>
        <Link 
          to="/app/settings"
          className={cn(
            "flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
            location.pathname === "/app/settings" ? 
              "bg-primary text-primary-foreground" : 
              "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
            collapsed ? "justify-center h-10 w-10" : "w-full justify-start"
          )}
          title={collapsed ? "Settings" : undefined}
        >
          <Settings className="h-5 w-5" />
          {!collapsed && <span className="ml-3">Settings</span>}
        </Link>
      </div>
    </div>
  );
} 