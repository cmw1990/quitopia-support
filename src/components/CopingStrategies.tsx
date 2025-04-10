import React from 'react';

const CopingStrategies = () => {
  const strategies = [
    'Take a break and do something you enjoy',
    'Practice deep breathing exercises',
    'Go for a walk or do some other form of exercise',
    'Listen to music',
    'Talk to a friend or family member',
    'Write in a journal',
    'Meditate or practice mindfulness',
    'Engage in a hobby',
    'Read a book',
    'Do something creative',
  ];

  return (
    <div>
      <h2>Coping Strategies</h2>
      <ul>
        {strategies.map((strategy, index) => (
          <li key={index}>{strategy}</li>
        ))}
      </ul>
    </div>
  );
};

export default CopingStrategies;
