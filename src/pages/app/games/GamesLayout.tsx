import React from 'react';
import { Outlet } from 'react-router-dom'; // Use Outlet to render nested routes

const GamesLayout: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Focus Games</h2>
      {/* Maybe add specific navigation for games here later */}
      <Outlet /> {/* This will render the specific game page */}
    </div>
  );
};

export default GamesLayout; 