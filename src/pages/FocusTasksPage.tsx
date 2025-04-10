import React from 'react';
import { FocusTaskList } from '@/components/FocusTaskList';

export default function FocusTasksPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Focus Tasks</h1>
      <FocusTaskList />
    </div>
  );
} 