
import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Focus Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Focus Sessions</h2>
          <p className="text-gray-600 mb-4">Track your recent focus sessions and productivity.</p>
          <div className="h-40 bg-gray-100 rounded flex items-center justify-center">
            <p className="text-gray-500">Focus Session Stats Graph</p>
          </div>
        </div>
        
        <div className="border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Daily Focus</h2>
          <p className="text-gray-600 mb-4">Your focus hours today compared to your average.</p>
          <div className="h-40 bg-gray-100 rounded flex items-center justify-center">
            <p className="text-gray-500">Daily Focus Graph</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
