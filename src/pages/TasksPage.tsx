
import React from 'react';

const TasksPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Tasks</h1>
      <p className="text-lg mb-6">Manage your tasks and stay productive.</p>
      
      <div className="border rounded-lg p-6 shadow-sm mb-8">
        <h2 className="text-xl font-semibold mb-4">Task Manager</h2>
        <p className="text-muted-foreground">Your task list will appear here.</p>
      </div>
    </div>
  );
};

export default TasksPage;
