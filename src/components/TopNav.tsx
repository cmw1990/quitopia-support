import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  Bell,
  User,
  Search,
  Sun,
  Moon,
  Settings,
  LogOut,
  HelpCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/components/AuthProvider';
import { AvailableThemes, useTheme } from '@/lib/ThemeProvider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TopNavProps {
  onMenuClick: () => void;
  user: any;
}

export function TopNav({ onMenuClick, user }: TopNavProps) {
  const [showSearch, setShowSearch] = useState(false);
  const { theme, setTheme } = useTheme();
  const { signOut } = useAuth();
  
  // Energy level simulation with random value between 1-10
  const energyLevel = Math.floor(Math.random() * 10) + 1;
  const energyPercentage = energyLevel * 10;
  
  const handleToggleSearch = () => {
    setShowSearch(!showSearch);
  };
  
  const handleThemeChange = (newTheme: AvailableThemes) => {
    setTheme(newTheme);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-background border-b border-border">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden"
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </Button>
          
          {!showSearch && (
            <div className="hidden md:flex items-center gap-2">
              <h1 className="text-lg font-semibold">EasierFocus</h1>
            </div>
          )}
          
          <div
            className={cn(
              "transition-all duration-200 ease-in-out",
              showSearch ? "w-full md:w-80" : "w-0 md:w-auto"
            )}
          >
            {showSearch && (
              <Input
                type="search"
                placeholder="Search..."
                className="w-full"
                autoFocus
              />
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleSearch}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Search"
          >
            <Search size={20} />
          </Button>

          <div className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full bg-accent/30">
            <span className="text-xs font-medium">Energy:</span>
            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  energyLevel > 6 ? "bg-green-500" : energyLevel > 3 ? "bg-amber-500" : "bg-red-500"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${energyPercentage}%` }}
                transition={{ duration: 1 }}
              />
            </div>
            <span className="text-xs font-medium">{energyLevel}/10</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                aria-label="Theme"
              >
                {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Theme</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleThemeChange('light')}>
                <Sun className="mr-2 h-4 w-4" />
                <span>Light</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleThemeChange('dark')}>
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleThemeChange('system')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>System</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            aria-label="Notifications"
            asChild
          >
            <Link to="/app/notifications">
              <Bell size={20} />
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                aria-label="User menu"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatarUrl} alt={user?.email || "User"} />
                  <AvatarFallback>
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/app/profile" className="flex items-center cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/app/settings" className="flex items-center cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/help" className="flex items-center cursor-pointer" target="_blank" rel="noopener noreferrer">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Help</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-destructive hover:bg-destructive/10">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
} 