import React from 'react';
import { TaskManagement } from '@/components/tasks/TaskManagement';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Link } from 'react-router-dom';

const TasksPage: React.FC = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
       <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Tasks</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">Task Management</h1>
      
      {/* Render the Task Management component */}
      <TaskManagement />

    </div>
  );
};

export default TasksPage; 