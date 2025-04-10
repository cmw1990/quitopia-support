import React from 'react';
import { Helmet } from 'react-helmet-async';

const StressReductionPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Stress Reduction - EasierFocus</title>
        <meta name="description" content="Access guided exercises and techniques to manage stress." />
      </Helmet>
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-semibold mb-4">Stress Reduction Toolkit</h1>
        <p className="text-muted-foreground">Find guided breathing exercises, short meditations, and quick stress-relief techniques here. (Placeholder)</p>
        {/* TODO: Implement Stress Reduction exercises */}
      </div>
    </>
  );
};

export default StressReductionPage; 