
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
        index: true,
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
  return <RouterProvider router={router} />;
};

export default AppRouter;
