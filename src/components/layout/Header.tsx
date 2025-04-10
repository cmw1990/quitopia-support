import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/ThemeToggle"; // Assuming ThemeToggle exists
import { Logo } from "@/components/ui/logo"; // Assuming Logo exists

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <Logo className="h-7 w-auto" />
          <span className="text-xl font-bold text-foreground">EasierFocus</span>
        </Link>
        <nav className="flex items-center space-x-2">
          {/* Add other public links here if needed (e.g., Features, Pricing) */}
          <ThemeToggle />
          <Link to="/auth/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link to="/auth/signup">
            <Button variant="default">Sign Up</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}; 