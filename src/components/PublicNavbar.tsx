import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';

const PublicNavbar: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img 
              src="/logo.svg" 
              alt="Mission Fresh Logo" 
              className="h-10 w-auto mr-2" 
            />
            <span className="text-xl font-semibold text-primary">Mission Fresh</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-gray-700 hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/web-tools/nrt-directory" className="text-gray-700 hover:text-primary transition-colors">
            Smokeless Products
          </Link>
          <Link to="/about" className="text-gray-700 hover:text-primary transition-colors">
            About
          </Link>
          <Link to="/resources" className="text-gray-700 hover:text-primary transition-colors">
            Resources
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          <Link to="/auth">
            <Button variant="outline" size="sm">Login</Button>
          </Link>
          <Link to="/auth?signup=true">
            <Button size="sm">Sign Up</Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default PublicNavbar; 