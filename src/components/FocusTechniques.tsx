import React from 'react';

const FocusTechniques = () => {
  const techniques = [
    {
      id: 1,
      name: 'Pomodoro Technique',
      description: 'Work in focused 25-minute intervals, separated by short breaks.',
    },
    {
      id: 2,
      name: 'Time Blocking',
      description: 'Schedule specific blocks of time for certain tasks.',
    },
    {
      id: 3,
      name: 'Eat the Frog',
      description: 'Tackle the most challenging task first thing in the morning.',
    },
    {
      id: 4,
      name: 'Two-Minute Rule',
      description: 'If a task takes less than two minutes, do it immediately.',
    },
    {
      id: 5,
      name: 'Getting Things Done (GTD)',
      description: 'Organize and prioritize tasks to reduce stress and improve focus.',
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Focus Techniques</h1>
      <ul className="list-disc list-inside">
        {techniques.map((technique) => (
          <li key={technique.id} className="mb-2">
            <strong>{technique.name}:</strong> {technique.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FocusTechniques;
