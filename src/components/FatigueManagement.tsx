import React from 'react';

const FatigueManagement = () => {
  const tips = [
    {
      id: 1,
      name: 'Prioritize Sleep',
      description: 'Aim for 7-8 hours of quality sleep each night.',
    },
    {
      id: 2,
      name: 'Take Breaks',
      description: 'Schedule regular breaks throughout the day to rest and recharge.',
    },
    {
      id: 3,
      name: 'Stay Hydrated',
      description: 'Drink plenty of water to prevent dehydration and fatigue.',
    },
    {
      id: 4,
      name: 'Eat Nutritious Foods',
      description: 'Consume a balanced diet with plenty of fruits, vegetables, and whole grains.',
    },
    {
      id: 5,
      name: 'Exercise Regularly',
      description: 'Engage in regular physical activity to boost energy levels.',
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Fatigue Management</h1>
      <ul className="list-disc list-inside">
        {tips.map((tip) => (
          <li key={tip.id} className="mb-2">
            <strong>{tip.name}:</strong> {tip.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FatigueManagement;
