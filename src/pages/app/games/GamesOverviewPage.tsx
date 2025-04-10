import React from 'react';
import { Link } from 'react-router-dom';

const GamesOverviewPage: React.FC = () => {
  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-3">Games Overview</h3>
      <p className="text-muted-foreground mb-4">Engage in fun games designed to enhance focus and cognitive skills.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         {/* Links to specific games */}
         <Link to="pattern-match" className="block p-4 border rounded hover:bg-muted">
           Pattern Match
         </Link>
         <Link to="memory-cards" className="block p-4 border rounded hover:bg-muted">
           Memory Cards
         </Link>
         <Link to="zen-drift" className="block p-4 border rounded hover:bg-muted">
           Zen Drift
         </Link>
         <Link to="stats" className="block p-4 border rounded hover:bg-muted">
           Game Stats
         </Link>
      </div>
    </div>
  );
};

export default GamesOverviewPage; 