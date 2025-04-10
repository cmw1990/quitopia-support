import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  User,
  BarChart,
  Clock,
  CheckSquare,
  Users,
  Settings,
  LogOut,
  Menu,
  Cigarette,
  Moon,
  Sun,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "next-themes";
import { useAuth } from "@/components/AuthProvider";

interface TopNavProps {
  transparent?: boolean;
}

interface User {
  email?: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
  };
}

export function TopNav({ transparent = false }: TopNavProps) {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const { user, session, isLoading, signOut } = useAuth();
  const isLoggedIn = !!user && !!session && !isLoading;
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  // Track scroll position to add background when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Dashboard", href: "/app/dashboard", icon: <BarChart className="h-4 w-4 mr-2" /> },
    { label: "Focus Timer", href: "/app/focus-timer", icon: <Clock className="h-4 w-4 mr-2" /> },
    { label: "Enhanced Focus", href: "/app/enhanced-focus", icon: <Brain className="h-4 w-4 mr-2" /> },
    { label: "Tasks", href: "/app/tasks", icon: <CheckSquare className="h-4 w-4 mr-2" /> },
    { label: "Community", href: "/app/community", icon: <Users className="h-4 w-4 mr-2" /> },
    { label: "Nicotine & Focus", href: "/app/nicotine-focus", icon: <Cigarette className="h-4 w-4 mr-2" /> },
  ];

  const getInitials = () => {
    if (!user) return "EF";
    const email = user.email || "";
    const name = user.user_metadata?.name || email.split("@")[0] || "";
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // Optionally navigate to home or login page after sign out
      // navigate('/'); // requires useNavigate hook
    } catch (error) {
      console.error("Sign out failed:", error);
      // Handle sign out error (e.g., show a notification)
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b",
        scrolled || !transparent
          ? "bg-background border-border"
          : "border-transparent bg-transparent backdrop-blur-none"
      )}
    >
      <div className="container flex h-16 items-center px-4">
        <div className="flex items-center gap-2 mr-4">
          <Link to="/" className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <Clock className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold ml-2 text-lg hidden md:inline-block">Easier Focus</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 mx-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary flex items-center",
                location.pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side items */}
        <div className="flex items-center ml-auto gap-4">
          <Button
            variant="ghost"
            size="icon" 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="rounded-full"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url} alt={getInitials()} />
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url} alt={getInitials()} />
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-medium">{user?.user_metadata?.name || user?.email?.split('@')[0] || user?.email}</p>
                    <p className="text-xs text-text-tertiary">{user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link 
                    to="/app/dashboard"
                    className="cursor-pointer flex items-center"
                  >
                    <BarChart className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link 
                    to="/app/profile"
                    className="cursor-pointer flex items-center"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link 
                    to="/app/settings"
                    className="cursor-pointer flex items-center"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link 
                    to="/app/nicotine-focus"
                    className="cursor-pointer flex items-center"
                  >
                    <Cigarette className="mr-2 h-4 w-4" />
                    <span>Nicotine Tracking</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleSignOut} 
                  className="cursor-pointer flex items-center text-red-600 focus:text-red-700 focus:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/auth?mode=login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          )}

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80vw] sm:w-[350px]">
              <nav className="flex flex-col gap-4 mt-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-accent"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
                {isLoggedIn ? (
                  <>
                    <div className="flex items-center gap-2 px-2 py-3 mt-4 border-t">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.user_metadata?.avatar_url} alt={getInitials()} />
                        <AvatarFallback>{getInitials()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{user?.user_metadata?.name || user?.email?.split('@')[0] || user?.email}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      className="justify-start px-2"
                      onClick={handleSignOut} 
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 mt-4 px-2">
                    <Link to="/auth?mode=login">
                      <Button className="w-full" variant="outline">Log in</Button>
                    </Link>
                    <Link to="/auth?mode=signup">
                      <Button className="w-full">Sign up</Button>
                    </Link>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
