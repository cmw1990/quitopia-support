import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Settings, User, LogOut, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface UserNavProps {
  variant?: "horizontal" | "vertical" | "icon";
}

export function UserNav({ variant = "horizontal" }: UserNavProps) {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (loading) return <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>;
  if (!user) return null;

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || "User";
  const avatarUrl = user.user_metadata?.avatar_url;
  const initials = displayName
    ? displayName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : "??";

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setIsSigningOut(false);
    }
  }

  const menuItems = [
    {
      label: "Profile",
      icon: <User className="mr-2 h-4 w-4" />,
      onClick: () => navigate("/easier-focus/app/profile"),
    },
    {
      label: "Settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
      onClick: () => navigate("/easier-focus/app/settings"),
    },
    {
      label: isSigningOut ? "Logging out..." : "Log out",
      icon: isSigningOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />,
      onClick: handleSignOut,
      isDanger: true,
      disabled: isSigningOut,
    },
  ];

  if (variant === "icon") {
    return (
      <TooltipProvider delayDuration={100}>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 p-0">
                  <Avatar className="h-8 w-8 border border-gray-300 dark:border-gray-700">
                    <AvatarImage alt={displayName} src={avatarUrl} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="right" align="center">
              <p>{displayName}</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none truncate text-gray-900 dark:text-white">{displayName}</p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {menuItems.map((item, index) => (
              <DropdownMenuItem
                key={index}
                onClick={item.onClick}
                disabled={item.disabled}
                className={cn(
                  "cursor-pointer flex items-center",
                  item.isDanger && "text-red-600 dark:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/50 focus:text-red-700 dark:focus:text-red-500",
                  item.disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </TooltipProvider>
    );
  }

  if (variant === "vertical") {
    return (
      <div className="space-y-3">
        <div className="flex items-center px-1">
          <Avatar className="h-9 w-9 border border-gray-300 dark:border-gray-700">
            <AvatarImage alt={displayName} src={avatarUrl} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-medium leading-none truncate text-gray-800 dark:text-gray-200">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
        <div className="space-y-1">
          {menuItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              className={cn(
                "w-full justify-start text-sm font-medium h-9 px-3",
                "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100",
                item.isDanger && "text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-500",
                item.disabled && "opacity-50 cursor-not-allowed"
              )}
              onClick={item.onClick}
              disabled={item.disabled}
            >
              {item.icon}
              {item.label}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <Avatar className="h-9 w-9 border border-gray-300 dark:border-gray-700">
            <AvatarImage alt={displayName} src={avatarUrl} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none truncate text-gray-900 dark:text-white">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {menuItems.map((item, index) => (
          <DropdownMenuItem
            key={index}
            onClick={item.onClick}
            disabled={item.disabled}
            className={cn(
              "cursor-pointer flex items-center",
              item.isDanger && "text-red-600 dark:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/50 focus:text-red-700 dark:focus:text-red-500",
              item.disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}