import { Link } from "react-router-dom";
import { Battery, BellRing, Settings, User } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "./AuthProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function AppHeader() {
  const { session, signOut } = useAuth();
  const user = session?.user;

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="flex h-16 items-center px-4 gap-4">
        <Link to="/" className="flex items-center gap-2">
          <Battery className="h-6 w-6 text-primary-600" />
          <span className="font-semibold text-xl">Well-Charged</span>
        </Link>

        <div className="flex-1" />

        <nav className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <BellRing className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Link to="/settings/profile" className="flex items-center gap-2">
                  Profile Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/settings/preferences" className="flex items-center gap-2">
                  Preferences
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="font-medium">
                {user?.email}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut()}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
