import React from 'react';
import { RouteObject } from 'react-router-dom';
import { WebToolsPage } from '../features/webTools/WebToolsPage';

const toolRoutes: RouteObject[] = [
  {
    path: '/tools',
    element: <WebToolsPage />,
  },
  {
    path: '/tools/web',
    element: <WebToolsPage />
  }
];

export default toolRoutes; 