
import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const GamesLayout: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Focus Games</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Link to="/app/games/memory-cards" className="p-4 border rounded-lg hover:bg-gray-50">
          <h3 className="font-medium">Memory Cards</h3>
          <p className="text-sm text-gray-500">Test and improve your memory</p>
        </Link>
        <Link to="/app/games/pattern-match" className="p-4 border rounded-lg hover:bg-gray-50">
          <h3 className="font-medium">Pattern Match</h3>
          <p className="text-sm text-gray-500">Enhance your pattern recognition</p>
        </Link>
        <Link to="/app/games/zen-drift" className="p-4 border rounded-lg hover:bg-gray-50">
          <h3 className="font-medium">Zen Drift</h3>
          <p className="text-sm text-gray-500">Meditative focus training</p>
        </Link>
      </div>
      <Outlet />
    </div>
  );
};

export default GamesLayout;
