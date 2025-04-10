
import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const RootLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b py-4 bg-primary/5">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">Easier Focus</Link>
          <nav className="flex gap-4">
            <Link to="/" className="hover:text-primary">Home</Link>
            <Link to="/app/dashboard" className="hover:text-primary">Dashboard</Link>
            <Link to="/app/focus-timer" className="hover:text-primary">Focus Timer</Link>
            <Link to="/app/games" className="hover:text-primary">Games</Link>
            <Link to="/app/distraction-blocker" className="hover:text-primary">Distraction Blocker</Link>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;
