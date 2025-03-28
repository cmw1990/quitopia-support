import React from 'react';

const TestComponent = () => {
  return (
    <div className="bg-background text-foreground p-4 rounded-md shadow-md">
      <h1 className="text-2xl font-bold mb-4">Test Component</h1>
      <p className="text-muted-foreground">This is a test component to verify Tailwind CSS processing.</p>
      <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md mt-4 hover:bg-primary/90">
        Test Button
      </button>
    </div>
  );
};

export default TestComponent; 