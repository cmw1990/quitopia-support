import React from 'react';
import { Helmet } from 'react-helmet-async';

const GoalsPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Goal Setting - EasierFocus</title>
        <meta name="description" content="Define, track, and achieve your goals with EasierFocus." />
      </Helmet>
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-semibold mb-4">Goal Setting & Tracking</h1>
        <p className="text-muted-foreground">This page will contain tools for defining SMART goals, breaking them down, and visualizing progress. (Placeholder)</p>
        {/* TODO: Implement Goal Setting UI */}
      </div>
    </>
  );
};

export default GoalsPage; 