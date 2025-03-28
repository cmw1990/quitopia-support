import React from 'react';

export default function TestErrors() {
  // Function to generate a test error
  const generateError = () => {
    console.error('Test error from button click');
    try {
      // @ts-ignore - Intentional error for testing
      const obj = null;
      // Using non-null assertion since this is intentional for error testing
      // @ts-expect-error - This will throw an error at runtime (intentional)
      obj!.nonExistentMethod();
    } catch (error) {
      console.error('Caught error:', error);
    }
  };

  // Function to generate a test warning
  const generateWarning = () => {
    console.warn('Test warning from button click');
  };

  return (
    <div className="fixed top-4 right-4 z-40 flex flex-col space-y-2">
      <button
        onClick={generateError}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
      >
        Test Error
      </button>
      <button
        onClick={generateWarning}
        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded text-sm"
      >
        Test Warning
      </button>
    </div>
  );
}