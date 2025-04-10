
import React from 'react';
import { DistractionAnalytics } from '@/components/focus/distraction/DistractionAnalytics';

const DashboardPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="col-span-2 border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Focus Overview</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Today's Focus Score</span>
              <span className="font-semibold">78/100</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: '78%' }}></div>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Weekly average: 72</span>
              <span>+8% from last week</span>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
              Start Focus Session
            </button>
            <button className="w-full py-2 px-4 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors">
              Add New Task
            </button>
            <button className="w-full py-2 px-4 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors">
              View Analytics
            </button>
          </div>
        </div>
      </div>
      
      <DistractionAnalytics />
    </div>
  );
};

export default DashboardPage;
