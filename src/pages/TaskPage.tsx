import React from 'react';
// import TaskManager from '../components/tasks/TaskManager'; // Old component
import { TaskManagement } from '../components/tasks/TaskManagement'; // New component

const TaskPage: React.FC = () => {
  return (
    <div className="container mx-auto py-6">
      {/* Render the new TaskManagement component */}
      <TaskManagement />
    </div>
  );
};

export default TaskPage;
