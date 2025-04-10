
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardPage from '@/pages/DashboardPage';
import TasksPage from '@/pages/TasksPage';
import FocusTasksPage from '@/pages/FocusTasksPage';
import NotFoundPage from '@/components/NotFoundPage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/tasks" element={<TasksPage />} />
      <Route path="/focus-tasks" element={<FocusTasksPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
