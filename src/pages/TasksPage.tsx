
import React from 'react';

const TasksPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Tasks</h1>
      
      <div className="border rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-muted/50">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Your Tasks</h2>
            <button className="px-3 py-1 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90 transition-colors">
              New Task
            </button>
          </div>
        </div>
        
        <div className="divide-y">
          {[1, 2, 3].map((task) => (
            <div key={task} className="p-4 flex items-center justify-between hover:bg-accent/10 transition-colors">
              <div>
                <h3 className="font-medium">Example Task {task}</h3>
                <p className="text-sm text-muted-foreground">Due: Tomorrow</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full">Medium</span>
                <button className="p-1 rounded-full hover:bg-accent transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 bg-muted/50 text-center text-sm text-muted-foreground">
          Showing 3 of 3 tasks
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
