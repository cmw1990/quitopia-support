import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tree, TreeItem } from '@/components/ui/tree';
import { cn } from '@/lib/utils';

// Define our app routes structure
const routes = [
  {
    id: 'app',
    name: 'App',
    path: '/app',
    children: [
      { id: 'dashboard', name: 'Dashboard', path: '/app' },
      { id: 'focus', name: 'Focus', path: '/app/focus' },
      { id: 'sleep', name: 'Sleep', path: '/app/sleep' },
      { id: 'exercise', name: 'Exercise', path: '/app/exercise' },
      { id: 'mental-health', name: 'Mental Health', path: '/app/mental-health' },
      { id: 'energy-plans', name: 'Energy Plans', path: '/app/energy-plans' },
      { id: 'recovery', name: 'Recovery', path: '/app/recovery' },
      { id: 'consultation', name: 'Consultation', path: '/app/consultation' },
      { id: 'recipes', name: 'Recipes', path: '/app/recipes' },
      { id: 'analytics', name: 'Analytics', path: '/app/analytics' },
    ]
  },
  {
    id: 'energy',
    name: 'Energy',
    path: '/app/energy',
    children: [
      { id: 'mental', name: 'Mental Energy', path: '/app/energy/mental' },
      { id: 'physical', name: 'Physical Energy', path: '/app/energy/physical' },
      { id: 'recipes', name: 'Energy Recipes', path: '/app/energy/recipes' },
    ]
  }
];

export const NavigationTree: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const renderTreeItems = (items: typeof routes) => {
    return items.map((route) => (
      <TreeItem
        key={route.id}
        id={route.id}
        className={cn(
          'cursor-pointer hover:bg-accent',
          location.pathname === route.path && 'bg-accent'
        )}
        onClick={() => navigate(route.path)}
      >
        <span className="text-sm">{route.name}</span>
        {route.children && (
          <div className="pl-4">
            {route.children.map((child) => (
              <TreeItem
                key={child.id}
                id={child.id}
                className={cn(
                  'cursor-pointer hover:bg-accent',
                  location.pathname === child.path && 'bg-accent'
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(child.path);
                }}
              >
                <span className="text-sm">{child.name}</span>
              </TreeItem>
            ))}
          </div>
        )}
      </TreeItem>
    ));
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Navigation</h2>
      <Tree>{renderTreeItems(routes)}</Tree>
    </div>
  );
};
