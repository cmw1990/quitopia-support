
import React from 'react';

const GamesPage: React.FC = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Focus Games</h1>
      <p className="mb-6">Play games designed to improve your focus and cognitive abilities.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Memory Cards</h2>
          <p className="text-gray-600 mb-4">Test and improve your short-term memory.</p>
          <button className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80">
            Play
          </button>
        </div>
      </div>
    </div>
  );
};

export default GamesPage;
