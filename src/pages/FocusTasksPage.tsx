
import React from 'react';

const FocusTasksPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Focus Tasks</h1>
      
      <div className="grid gap-6">
        <div className="border rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Today's Focus Tasks</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input type="checkbox" className="h-5 w-5 rounded border-gray-300" />
              <div className="flex-1">
                <p className="font-medium">Complete project documentation</p>
                <p className="text-sm text-muted-foreground">High priority - 45 minutes</p>
              </div>
              <button className="text-sm text-primary hover:underline">Start Focus</button>
            </div>
            
            <div className="flex items-center gap-3">
              <input type="checkbox" className="h-5 w-5 rounded border-gray-300" />
              <div className="flex-1">
                <p className="font-medium">Review code changes</p>
                <p className="text-sm text-muted-foreground">Medium priority - 30 minutes</p>
              </div>
              <button className="text-sm text-primary hover:underline">Start Focus</button>
            </div>
            
            <div className="flex items-center gap-3">
              <input type="checkbox" className="h-5 w-5 rounded border-gray-300" />
              <div className="flex-1">
                <p className="font-medium">Plan tomorrow's schedule</p>
                <p className="text-sm text-muted-foreground">Low priority - 15 minutes</p>
              </div>
              <button className="text-sm text-primary hover:underline">Start Focus</button>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Focus Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <p className="text-2xl font-bold">3</p>
              <p className="text-sm text-muted-foreground">Tasks Completed</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <p className="text-2xl font-bold">2h 15m</p>
              <p className="text-sm text-muted-foreground">Total Focus Time</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <p className="text-2xl font-bold">85%</p>
              <p className="text-sm text-muted-foreground">Productivity Score</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusTasksPage;
