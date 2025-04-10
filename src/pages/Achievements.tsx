import React from 'react';
import AchievementList from '../components/achievements/AchievementList';

const Achievements = () => {
  const achievements = [
    {
      id: '1',
      title: 'First Focus Session',
      description: 'Completed your first focus session.',
      date: '2024-03-01',
    },
    {
      id: '2',
      title: '5 Days Streak',
      description: 'Maintained a 5-day focus streak.',
      date: '2024-03-05',
    },
    {
      id: '3',
      title: 'Master Focus',
      description: 'Achieved 100 hours of focus time.',
      date: '2024-03-10',
    },
    {
      id: '4',
      title: "Social Butterfly",
      description: "Engage in 5 group therapy sessions.",
      category: "Community",
      icon: "users",
      rule: "participated_in_group_therapy_sessions >= 5",
      unlocked_at: null,
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Achievements</h1>
      <p>Here are your achievements!</p>
      <AchievementList achievements={achievements} />
    </div>
  );
};

export default Achievements;