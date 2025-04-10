import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  Brain, 
  Menu, 
  X, 
  Home, 
  Settings, 
  LogOut, 
  LogIn, 
  Moon, 
  Sun, 
  Globe,
  Search,
  Shield,
  Users,
  ArrowRightLeft
} from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from './AuthProvider';
import { useTheme } from './ThemeProvider';

export function NavigationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  
  // Handle scroll events to change header styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close menu when location changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);
  
  return (
    <>
      {/* Desktop Navigation */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || isOpen ? 'bg-background/80 backdrop-blur-md shadow-sm border-b' : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Easier Focus</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                to="/" 
                className={`text-sm hover:text-primary transition-colors ${
                  location.pathname === '/' ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/focus-tools" 
                className={`text-sm hover:text-primary transition-colors ${
                  location.pathname === '/focus-tools' ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}
              >
                Focus Tools
              </Link>
              <Link 
                to="/web-tools" 
                className={`text-sm hover:text-primary transition-colors ${
                  location.pathname === '/web-tools' ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}
              >
                Web Tools
              </Link>
              <Link 
                to="/anti-googlitis" 
                className={`text-sm hover:text-primary transition-colors ${
                  location.pathname === '/anti-googlitis' ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}
              >
                Anti-Googlitis
              </Link>
              <Link 
                to="/body-doubling" 
                className={`text-sm hover:text-primary transition-colors ${
                  location.pathname === '/body-doubling' ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}
              >
                Body Doubling
              </Link>
              <Link 
                to="/app/flow-state" 
                className={`text-sm hover:text-primary transition-colors ${
                  location.pathname === '/app/flow-state' ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}
              >
                Flow State
              </Link>
              <Link 
                to="/app/context-switching" 
                className={`text-sm hover:text-primary transition-colors ${
                  location.pathname === '/app/context-switching' ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}
              >
                Context Switching
              </Link>
              {user && (
                <Link 
                  to="/settings" 
                  className={`text-sm hover:text-primary transition-colors ${
                    location.pathname === '/settings' ? 'text-primary font-medium' : 'text-muted-foreground'
                  }`}
                >
                  Settings
                </Link>
              )}
            </nav>
            
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="h-[1.2rem] w-[1.2rem]" />
                ) : (
                  <Moon className="h-[1.2rem] w-[1.2rem]" />
                )}
              </Button>
              
              {user ? (
                <Button 
                  variant="default" 
                  size="sm"
                  className="gap-1"
                  onClick={() => signOut()}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              ) : (
                <Button 
                  variant="default" 
                  size="sm"
                  className="gap-1"
                  onClick={() => {/* Show sign in modal */}}
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              )}
            </div>
            
            <button
              className="p-2 rounded-full md:hidden focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </header>
      
      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-16 z-40 bg-background border-t"
          >
            <div className="container mx-auto px-4 py-8">
              <nav className="flex flex-col gap-4">
                <Link 
                  to="/" 
                  className={`py-3 px-4 rounded-md flex items-center gap-3 ${
                    location.pathname === '/' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                  }`}
                >
                  <Home className="h-5 w-5" />
                  Home
                </Link>
                <Link 
                  to="/focus-tools" 
                  className={`py-3 px-4 rounded-md flex items-center gap-3 ${
                    location.pathname === '/focus-tools' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                  }`}
                >
                  <Brain className="h-5 w-5" />
                  Focus Tools
                </Link>
                <Link 
                  to="/web-tools" 
                  className={`py-3 px-4 rounded-md flex items-center gap-3 ${
                    location.pathname === '/web-tools' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                  }`}
                >
                  <Globe className="h-5 w-5" />
                  Web Tools
                </Link>
                <Link 
                  to="/anti-googlitis" 
                  className={`py-3 px-4 rounded-md flex items-center gap-3 ${
                    location.pathname === '/anti-googlitis' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                  }`}
                >
                  <Shield className="h-5 w-5" />
                  Anti-Googlitis
                </Link>
                <Link 
                  to="/body-doubling" 
                  className={`py-3 px-4 rounded-md flex items-center gap-3 ${
                    location.pathname === '/body-doubling' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                  }`}
                >
                  <Users className="h-5 w-5" />
                  Body Doubling
                </Link>
                <Link 
                  to="/app/flow-state" 
                  className={`py-3 px-4 rounded-md flex items-center gap-3 ${
                    location.pathname === '/app/flow-state' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                  }`}
                >
                  <Brain className="h-5 w-5" />
                  Flow State
                </Link>
                <Link 
                  to="/app/context-switching" 
                  className={`py-3 px-4 rounded-md flex items-center gap-3 ${
                    location.pathname === '/app/context-switching' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                  }`}
                >
                  <ArrowRightLeft className="h-5 w-5" />
                  Context Switching
                </Link>
                
                {user && (
                  <Link 
                    to="/settings" 
                    className={`py-3 px-4 rounded-md flex items-center gap-3 ${
                      location.pathname === '/settings' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                    }`}
                  >
                    <Settings className="h-5 w-5" />
                    Settings
                  </Link>
                )}
                
                <div className="border-t my-4"></div>
                
                <button
                  className={`py-3 px-4 rounded-md flex items-center gap-3 hover:bg-muted`}
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="h-5 w-5" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="h-5 w-5" />
                      Dark Mode
                    </>
                  )}
                </button>
                
                {user ? (
                  <button
                    className={`py-3 px-4 rounded-md flex items-center gap-3 hover:bg-muted text-destructive`}
                    onClick={() => signOut()}
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </button>
                ) : (
                  <button
                    className={`py-3 px-4 rounded-md flex items-center gap-3 hover:bg-muted text-primary`}
                    onClick={() => {/* Show sign in modal */}}
                  >
                    <LogIn className="h-5 w-5" />
                    Sign In
                  </button>
                )}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 