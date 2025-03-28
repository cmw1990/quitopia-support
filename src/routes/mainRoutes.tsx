import React from 'react';
import { RouteObject } from 'react-router-dom';
import { DashboardPage } from '../pages/DashboardPage';
import I18nDemo from '../pages/I18nDemo';

const mainRoutes: RouteObject[] = [
  {
    path: '/',
    element: <DashboardPage />,
  },
  {
    path: '/dashboard',
    element: <DashboardPage />,
  },
  {
    path: '/i18n-demo',
    element: <I18nDemo />,
  }
];

export default mainRoutes; 