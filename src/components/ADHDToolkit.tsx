import React from 'react';

const ADHDToolkit = () => {
  const tools = [
    {
      id: 1,
      name: 'Noise Generator',
      description: 'Generate white noise or ambient sounds to help focus.',
    },
    {
      id: 2,
      name: 'Task Breakdown',
      description: 'Break down large tasks into smaller, more manageable steps.',
    },
    {
      id: 3,
      name: 'Visual Timer',
      description: 'Use a visual timer to track time and stay on task.',
    },
    {
      id: 4,
      name: 'Mindfulness Exercises',
      description: 'Practice mindfulness to improve focus and reduce impulsivity.',
    },
    {
      id: 5,
      name: 'Organization Tips',
      description: 'Learn tips and strategies for staying organized.',
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">ADHD Toolkit</h1>
      <ul className="list-disc list-inside">
        {tools.map((tool) => (
          <li key={tool.id} className="mb-2">
            <strong>{tool.name}:</strong> {tool.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ADHDToolkit;
