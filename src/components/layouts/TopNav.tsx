import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Brain, 
  Menu,
  X,
  Settings,
  LogOut,
  User,
  Home,
  Bell
} from 'lucide-react';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';

// Mock auth provider for development
const useAuth = () => {
  return {
    user: null,
    signOut: () => console.log('Sign out')
  };
};

export function TopNav() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-primary" />
            <span className="font-semibold text-xl">Easier Focus</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/features" className="text-muted-foreground hover:text-primary transition-colors">
              Features
            </Link>
            <Link to="/pricing" className="text-muted-foreground hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link to="/tools" className="text-muted-foreground hover:text-primary transition-colors">
              Web Tools
            </Link>
            <Link to="/download" className="text-muted-foreground hover:text-primary transition-colors">
              Download
            </Link>
            {user ? (
              <Link to="/app/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link to="/register">
                  <Button>Get Started</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-center py-4 border-b">
                    <div className="flex items-center space-x-2">
                      <Brain className="h-6 w-6 text-primary" />
                      <span className="font-semibold text-xl">Easier Focus</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                      <X className="h-6 w-6" />
                    </Button>
                  </div>

                  <div className="flex-1 py-8 space-y-6">
                    <Link 
                      to="/features" 
                      className="block px-4 py-2 hover:bg-muted rounded-md transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Features
                    </Link>
                    <Link 
                      to="/pricing" 
                      className="block px-4 py-2 hover:bg-muted rounded-md transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Pricing
                    </Link>
                    <Link 
                      to="/tools" 
                      className="block px-4 py-2 hover:bg-muted rounded-md transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Web Tools
                    </Link>
                    <Link 
                      to="/download" 
                      className="block px-4 py-2 hover:bg-muted rounded-md transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Download
                    </Link>
                  </div>

                  <div className="py-6 border-t">
                    {user ? (
                      <div className="space-y-4">
                        <Link 
                          to="/app/dashboard"
                          className="flex items-center space-x-2 px-4 py-2 hover:bg-muted rounded-md transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <Home className="h-5 w-5" />
                          <span>Dashboard</span>
                        </Link>
                        <Link 
                          to="/app/profile"
                          className="flex items-center space-x-2 px-4 py-2 hover:bg-muted rounded-md transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <User className="h-5 w-5" />
                          <span>Profile</span>
                        </Link>
                        <Link 
                          to="/app/notifications"
                          className="flex items-center space-x-2 px-4 py-2 hover:bg-muted rounded-md transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <Bell className="h-5 w-5" />
                          <span>Notifications</span>
                        </Link>
                        <Link 
                          to="/app/settings"
                          className="flex items-center space-x-2 px-4 py-2 hover:bg-muted rounded-md transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <Settings className="h-5 w-5" />
                          <span>Settings</span>
                        </Link>
                        <button 
                          onClick={() => {
                            signOut();
                            setIsOpen(false);
                          }}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-muted rounded-md transition-colors"
                        >
                          <LogOut className="h-5 w-5" />
                          <span>Logout</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3 px-4">
                        <Link to="/login" onClick={() => setIsOpen(false)}>
                          <Button variant="outline" className="w-full">Login</Button>
                        </Link>
                        <Link to="/register" onClick={() => setIsOpen(false)}>
                          <Button className="w-full">Get Started</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
} 