
import React from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import { 
    LayoutDashboard, 
    ListChecks, 
    Clock, 
    BrainCircuit, 
    HeartPulse, 
    Zap, 
    Settings, 
    LogOut 
} from 'lucide-react';

// Sidebar Navigation Items
const sidebarNavItems = [
  { title: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
  { title: "Focus Sessions", href: "/app/focus-sessions", icon: Clock },
  { title: "Wellness", href: "/app/wellness", icon: HeartPulse },
  { title: "Energy Tracking", href: "/app/energy-tracking", icon: Zap },
  { title: "Focus Strategies", href: "/app/focus-strategies", icon: BrainCircuit },
  { title: "Tasks", href: "/app/tasks", icon: ListChecks },
  { title: "Settings", href: "/app/settings", icon: Settings },
];

const RootLayout: React.FC = () => {
  const { signOut, session } = useAuth();
  
  const handleLogout = async () => {
    await signOut();
  };

  const user = session?.user;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col border-r border-border bg-muted/40 text-card-foreground p-4 shrink-0">
        <div className="mb-6">
          <Link to="/" className="text-2xl font-bold text-primary">
            EasierFocus
          </Link>
        </div>
        <nav className="flex-grow space-y-1 overflow-y-auto">
          {sidebarNavItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end
              className={({ isActive }) => cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground dark:hover:bg-muted"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </NavLink>
          ))}
        </nav>
        {user && (
          <div className="mt-auto space-y-2 pt-4 border-t border-border">
            {/* User Info */}
            <div className="flex items-center gap-2 p-2 rounded-md">
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold shrink-0">
                    {user?.email?.[0]?.toUpperCase() || 'U'} 
                </div>
                <span className="text-sm font-medium truncate" title={user?.email}>{user?.email || 'User Email'}</span>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start gap-3 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
        <div className="max-w-screen-xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default RootLayout;
