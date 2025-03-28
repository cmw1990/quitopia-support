import React from "react";
import { cn } from "@/lib/utils";
import { useLocation, NavLink } from "react-router-dom";
import { 
  Home, 
  BarChart2, 
  Users, 
  Settings,
  Plus,
  Menu
} from "lucide-react";
import { Button } from "./button";
import { Avatar, AvatarImage, AvatarFallback } from "./avatar";
import { Sheet, SheetContent, SheetTrigger } from "./sheet";

interface MobileNavProps {
  username?: string;
  avatarUrl?: string;
  showFloatingButton?: boolean;
  onFloatingButtonClick?: () => void;
  className?: string;
}

export function MobileNav({
  username,
  avatarUrl,
  showFloatingButton = true,
  onFloatingButtonClick,
  className
}: MobileNavProps) {
  const location = useLocation();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  
  const navItems = [
    { 
      label: "Home", 
      icon: <Home className="h-5 w-5" />, 
      path: "/app" 
    },
    { 
      label: "Progress", 
      icon: <BarChart2 className="h-5 w-5" />, 
      path: "/app/progress" 
    },
    { 
      label: "Community", 
      icon: <Users className="h-5 w-5" />, 
      path: "/app/community" 
    },
    { 
      label: "Settings", 
      icon: <Settings className="h-5 w-5" />, 
      path: "/app/settings" 
    }
  ];
  
  const getInitials = (name: string = "User") => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <>
      {/* Bottom navigation bar */}
      <div className={cn(
        "fixed bottom-0 left-0 z-40 w-full border-t bg-white dark:bg-gray-900 md:hidden",
        className
      )}>
        <div className="grid h-16 grid-cols-4 items-center">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex h-full flex-col items-center justify-center space-y-1",
                isActive 
                  ? "text-primary" 
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
              )}
              end={item.path === "/app"}
            >
              {item.icon}
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
      
      {/* Floating action button */}
      {showFloatingButton && (
        <Button
          onClick={onFloatingButtonClick}
          className="fixed bottom-20 right-4 z-50 h-14 w-14 rounded-full shadow-lg md:hidden"
          size="icon"
          aria-label="Quick Log"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
      
      {/* Profile sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="fixed top-3 right-3 z-50 md:hidden"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[280px] sm:w-[340px]">
          <div className="flex flex-col space-y-6 p-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={avatarUrl} alt={username} />
                <AvatarFallback>{getInitials(username)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{username || "Welcome"}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your Journey to Fresh Air
                </p>
              </div>
            </div>
            
            <div className="space-y-1">
              <h4 className="px-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Navigation
              </h4>
              <div className="space-y-1">
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start",
                      location.pathname === item.path && "bg-gray-100 dark:bg-gray-800"
                    )}
                    onClick={() => {
                      // Navigate programmatically or use router
                      setIsSheetOpen(false);
                    }}
                  >
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-1">
              <h4 className="px-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Resources
              </h4>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    // Navigate to NRT Directory
                    setIsSheetOpen(false);
                  }}
                >
                  <span className="ml-8">NRT Directory</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    // Navigate to Alternative Products
                    setIsSheetOpen(false);
                  }}
                >
                  <span className="ml-8">Alternative Products</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    // Navigate to Guides
                    setIsSheetOpen(false);
                  }}
                >
                  <span className="ml-8">Guides</span>
                </Button>
              </div>
            </div>
            
            <div className="pt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  // Sign out logic
                  setIsSheetOpen(false);
                }}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
} 