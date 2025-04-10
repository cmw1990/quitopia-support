
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RootLayout from '@/components/layouts/RootLayout';
import GamesPage from '@/pages/app/games/GamesPage';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<GamesPage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/app" element={<GamesPage />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
