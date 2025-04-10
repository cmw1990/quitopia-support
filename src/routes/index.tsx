
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RootLayout from '@/components/layouts/RootLayout';
import GamesPage from '@/pages/app/games/GamesPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <GamesPage />,
      },
      {
        path: '/games',
        element: <GamesPage />,
      }
    ],
  },
]);

const AppRouter: React.FC = () => {
  console.log('Router rendering');
  return <RouterProvider router={router} />;
};

export default AppRouter;
