import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} EasierFocus. All rights reserved.</p>
          <nav className="flex space-x-4 mt-2 sm:mt-0">
            {/* Placeholder links - create actual pages later if needed */}
            {/* <Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-foreground">Terms of Service</Link> */}
            <span className="hover:text-foreground cursor-pointer">Privacy Policy (TBD)</span>
            <span className="hover:text-foreground cursor-pointer">Terms of Service (TBD)</span>
          </nav>
        </div>
      </div>
    </footer>
  );
}; 