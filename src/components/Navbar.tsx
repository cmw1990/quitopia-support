import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';

const Navbar: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/app/dashboard" className="flex items-center">
            <img 
              src="/logo.svg" 
              alt="Mission Fresh Logo" 
              className="h-10 w-auto mr-2" 
            />
            <span className="text-xl font-semibold text-primary">Mission Fresh</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/app/dashboard" className="text-gray-700 hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Link to="/app/nrt-directory" className="text-gray-700 hover:text-primary transition-colors">
            Smokeless Products
          </Link>
          <Link to="/app/journal" className="text-gray-700 hover:text-primary transition-colors">
            Journal
          </Link>
          <Link to="/app/progress" className="text-gray-700 hover:text-primary transition-colors">
            Progress
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          <Link to="/app/profile">
            <Button variant="ghost" size="sm" className="rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Button>
          </Link>
          <Link to="/app/settings">
            <Button variant="ghost" size="sm" className="rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar; 