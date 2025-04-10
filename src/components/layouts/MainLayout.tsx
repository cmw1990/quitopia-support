import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthProvider";
import { useToast } from "../hooks/use-toast";
import { 
  Brain, 
  BarChart4, 
  Timer, 
  BatteryCharging, 
  Shield, 
  User, 
  Home,
  LogOut
} from "lucide-react";
import { Button } from "../ui/button";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem = ({ to, icon, label }: NavItemProps) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => `
      flex items-center gap-3 px-3 py-2 rounded-md 
      ${isActive 
        ? 'bg-primary text-primary-foreground font-medium' 
        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
      }
    `}
  >
    <span className="flex-shrink-0">{icon}</span>
    <span>{label}</span>
  </NavLink>
);

export default function MainLayout() {
  const { session, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        variant: "default",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const userName = session?.user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-full w-64 border-r p-4 hidden md:block">
        <div className="flex items-center gap-2 mb-8 mt-4">
          <Brain className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold">Easier Focus</h1>
        </div>
        
        <nav className="space-y-1 mt-8">
          <NavItem to="/app/dashboard" icon={<Home className="h-5 w-5" />} label="Dashboard" />
          <NavItem to="/app/focus-timer" icon={<Timer className="h-5 w-5" />} label="Focus Timer" />
          <NavItem to="/app/analytics" icon={<BarChart4 className="h-5 w-5" />} label="Analytics" />
          <NavItem to="/app/energy-management" icon={<BatteryCharging className="h-5 w-5" />} label="Energy Tracking" />
          <NavItem to="/app/distraction-blocker" icon={<Shield className="h-5 w-5" />} label="Distraction Blocker" />
          <NavItem to="/app/adhd-support" icon={<Brain className="h-5 w-5" />} label="ADHD Support" />
          <NavItem to="/app/profile" icon={<User className="h-5 w-5" />} label="Profile" />
        </nav>
        
        <div className="absolute bottom-8 left-0 w-full px-4">
          <div className="flex items-center justify-between mb-4 border-t pt-4">
            <div>
              <div className="font-medium">{userName}</div>
              <div className="text-xs text-muted-foreground">{session?.user?.email}</div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleSignOut}
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile header */}
      <div className="md:hidden border-b p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-bold">Easier Focus</h1>
        </div>
        
        {/* Mobile menu button */}
        <Button variant="outline" size="sm">Menu</Button>
      </div>
      
      {/* Main content */}
      <div className="md:ml-64 p-6">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
} 