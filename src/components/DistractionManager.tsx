import React, { useState } from 'react';

const DistractionManager = () => {
  const [distractions, setDistractions] = useState([
    { id: 1, name: 'Facebook', type: 'website', blocked: false },
    { id: 2, name: 'Twitter', type: 'website', blocked: false },
    { id: 3, name: 'Instagram', type: 'website', blocked: false },
    { id: 4, name: 'Reddit', type: 'website', blocked: false },
    { id: 5, name: 'YouTube', type: 'website', blocked: false },
  ]);

  const toggleBlock = (id: number) => {
    setDistractions((prevDistractions) =>
      prevDistractions.map((distraction) =>
        distraction.id === id ? { ...distraction, blocked: !distraction.blocked } : distraction
      )
    );
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Distraction Manager</h1>
      <ul className="list-none">
        {distractions.map((distraction) => (
          <li key={distraction.id} className="mb-2">
            <div className="flex items-center justify-between">
              <span>{distraction.name} ({distraction.type})</span>
              <button
                className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                  distraction.blocked ? 'bg-red-500 hover:bg-red-700' : ''
                }`}
                onClick={() => toggleBlock(distraction.id)}
              >
                {distraction.blocked ? 'Unblock' : 'Block'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DistractionManager;
