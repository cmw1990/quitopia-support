
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Welcome to Easier Focus</h1>
        <p className="text-lg mb-8">
          Tools and resources to help you improve focus, manage distractions, and boost productivity.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-semibold mb-3">Focus Dashboard</h2>
            <p className="mb-4">Track your focus sessions and see your progress over time.</p>
            <Button asChild>
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
          
          <div className="bg-card rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-semibold mb-3">Task Management</h2>
            <p className="mb-4">Organize and prioritize your tasks for maximum productivity.</p>
            <Button asChild>
              <Link to="/tasks">Manage Tasks</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
