import React from 'react';

const CognitiveExercises = () => {
  const exercises = [
    {
      id: 1,
      name: 'Working Memory Training',
      description: 'Engage in activities that challenge your working memory, such as remembering sequences or patterns.',
    },
    {
      id: 2,
      name: 'Attention Training',
      description: 'Practice focusing your attention on a specific task or stimulus for a set period of time.',
    },
    {
      id: 3,
      name: 'Inhibitory Control Exercises',
      description: 'Practice inhibiting impulsive responses, such as stopping yourself from saying or doing something.',
    },
    {
      id: 4,
      name: 'Cognitive Flexibility Training',
      description: 'Practice switching between different tasks or mental sets.',
    },
    {
      id: 5,
      name: 'Problem-Solving Games',
      description: 'Engage in games that require you to solve problems and think critically.',
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Cognitive Exercises</h1>
      <ul className="list-disc list-inside">
        {exercises.map((exercise) => (
          <li key={exercise.id} className="mb-2">
            <strong>{exercise.name}:</strong> {exercise.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CognitiveExercises;
