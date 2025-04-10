import React from 'react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
}

interface AchievementListProps {
  achievements: Achievement[];
}

const AchievementList: React.FC<AchievementListProps> = ({ achievements }) => {
  return (
    <ul className="divide-y divide-gray-200">
      {achievements.map((achievement) => (
        <li key={achievement.id} className="py-4">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.431-11.442a1 1 0 10-1.862 1.884l.931.942.931-.942a1 1 0 00-1.862-1.884z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{achievement.title}</p>
              <p className="text-sm text-gray-500 truncate">{achievement.description}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{achievement.date}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default AchievementList;