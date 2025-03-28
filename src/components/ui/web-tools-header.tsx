import React from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { Cigarette, Menu, X, ChevronRight } from "lucide-react";
import { Button } from "./button";
import { Sheet, SheetContent, SheetTrigger } from "./sheet";

interface WebToolsHeaderProps {
  title?: string;
  description?: string;
  showSignUp?: boolean;
  currentTool?: string;
  className?: string;
}

// Define simple Breadcrumb components
const BreadcrumbList = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"nav"> & {
    className?: string;
  }
>(({ className, ...props }, ref) => (
  <nav
    ref={ref}
    className={cn(
      "flex flex-wrap items-center text-sm text-muted-foreground",
      className
    )}
    aria-label="breadcrumb"
    {...props}
  />
));
BreadcrumbList.displayName = "BreadcrumbList";

const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li"> & {
    className?: string;
  }
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("inline-flex items-center", className)}
    {...props}
  />
));
BreadcrumbItem.displayName = "BreadcrumbItem";

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & {
    asChild?: boolean;
    className?: string;
  }
>(({ asChild, className, ...props }, ref) => {
  if (asChild) {
    return (
      <a
        ref={ref}
        className={cn("hover:text-foreground transition-colors", className)}
        {...props}
      />
    );
  }
  return (
    <a
      ref={ref}
      className={cn("hover:text-foreground transition-colors", className)}
      {...props}
    />
  );
});
BreadcrumbLink.displayName = "BreadcrumbLink";

const BreadcrumbSeparator = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span"> & {
    className?: string;
  }
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("mx-2 opacity-50", className)}
    {...props}
  />
));
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

export function WebToolsHeader({
  title = "Quit Smoking Tools",
  description = "Free tools to help you quit smoking and improve your health",
  showSignUp = true,
  currentTool,
  className
}: WebToolsHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();
  
  const tools = [
    { name: "Nicotine Calculator", path: "/tools/nicotine-calculator" },
    { name: "Savings Calculator", path: "/tools/savings-calculator" },
    { name: "Health Timeline", path: "/tools/health-timeline" },
    { name: "Alternative Products", path: "/tools/alternative-products" },
    { name: "Withdrawal Symptoms", path: "/tools/withdrawal-symptoms" },
  ];
  
  return (
    <header className={cn("bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800", className)}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and site title */}
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center">
              <img 
                src="/logo.svg" 
                alt="Mission Fresh" 
                className="h-8 w-8"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/32?text=MF';
                }}
              />
              <span className="ml-2 text-xl font-semibold hidden sm:inline-block">Mission Fresh</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex items-center space-x-4">
              {tools.slice(0, 3).map((tool) => (
                <Link 
                  key={tool.path}
                  to={tool.path}
                  className={cn(
                    "text-sm font-medium hover:text-primary transition-colors",
                    tool.name === currentTool ? "text-primary" : "text-gray-600 dark:text-gray-300"
                  )}
                >
                  {tool.name}
                </Link>
              ))}
              <Link 
                to="/tools"
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
              >
                More Tools
              </Link>
            </nav>
            
            {showSignUp && (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/auth/login">Log In</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth/register">Sign Up Free</Link>
                </Button>
              </div>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            {showSignUp && (
              <Button variant="ghost" size="sm" asChild className="mr-2">
                <Link to="/auth/login">Log In</Link>
              </Button>
            )}
            
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                >
                  {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                <div className="px-1 py-6 space-y-6">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold mb-2">Quit Smoking Tools</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Free tools to help you on your journey
                    </p>
                  </div>
                  
                  <nav className="space-y-2">
                    {tools.map((tool) => (
                      <Link
                        key={tool.path}
                        to={tool.path}
                        className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="text-sm font-medium">{tool.name}</span>
                        <ChevronRight className="h-4 w-4 opacity-50" />
                      </Link>
                    ))}
                  </nav>
                  
                  <div className="border-t pt-6">
                    <h3 className="text-sm font-semibold mb-2">Why Join Mission Fresh?</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <span className="mr-2">✓</span>
                        <span>Track your progress and health improvements</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">✓</span>
                        <span>Community support and expert resources</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">✓</span>
                        <span>Personalized recommendations and insights</span>
                      </li>
                    </ul>
                    
                    {showSignUp && (
                      <Button className="w-full mt-4" asChild>
                        <Link to="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                          Create Free Account
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        
        {/* Breadcrumbs (shown only when a tool is selected) */}
        {currentTool && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <BreadcrumbList>
              <BreadcrumbItem>
                <Link to="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <Link to="/tools" className="hover:text-foreground transition-colors">
                  Tools
                </Link>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <span className="font-medium text-foreground">{currentTool}</span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </div>
        )}
      </div>
      
      {/* Hero Section (shown only on the main tools page) */}
      {!currentTool && (
        <div className="bg-gradient-to-b from-primary/10 to-background py-8 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
              <Cigarette className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-3">{title}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">{description}</p>
            
            {showSignUp && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button size="lg" asChild>
                  <Link to="/auth/register">Start Your Quit Journey</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/tools">Explore All Tools</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
} 