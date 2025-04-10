import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { ArrowLeft, Search } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <div className="relative mb-8">
        <div className="text-[10rem] font-bold text-primary/20">404</div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Search className="h-16 w-16 text-primary" />
        </div>
      </div>
      
      <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        Sorry, we couldn't find the page you were looking for. It might have been moved, deleted, or never existed.
      </p>
      
      <div className="space-y-4">
        <Button asChild>
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;