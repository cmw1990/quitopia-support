
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Toaster } from "./ui/toaster";
import { cn } from "@/lib/utils";

export const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/tasks", label: "Tasks" },
    { path: "/focus-tasks", label: "Focus Tasks" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-14 flex items-center">
          <div className="mr-4 font-bold text-lg">Easier Focus</div>
          <nav className="flex gap-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-3 py-2 text-sm font-medium transition-colors hover:text-primary",
                  location.pathname === item.path 
                    ? "text-primary underline" 
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-4">
        {children}
      </main>
      <Toaster />
    </div>
  );
};
