import React from 'react';
import { Helmet } from 'react-helmet-async'; // Prefer react-helmet-async if available
import { useLocation } from 'react-router-dom'; // Import useLocation
import EnhancedFocusTimer from '@/components/focus/EnhancedFocusTimer';
import ErrorBoundary from '@/components/ErrorBoundary';

const FocusTimerPage = () => { // Renamed component for clarity (optional)
  const location = useLocation();
  // Access state passed from navigate (e.g., from TaskManagerPage)
  const taskInfo = location.state as { taskId?: string; taskTitle?: string } | null;
  const initialTaskId = taskInfo?.taskId;
  const initialTaskTitle = taskInfo?.taskTitle;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl"> {/* Added max-width */}
      <Helmet>
        <title>Focus Timer {initialTaskTitle ? `- ${initialTaskTitle}` : ''}| Easier Focus</title>
        <meta name="description" content={`Start a focused work session ${initialTaskTitle ? `for task: ${initialTaskTitle}` : ''} using the Pomodoro technique or other focus methods.`} />
      </Helmet>
      
      <div className="flex flex-col space-y-6">
        <div className="text-center"> {/* Centered heading */}
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-800">Focus Timer</h1>
           {/* Display the task title if provided */}
           {initialTaskTitle && (
            <p className="text-lg text-indigo-700 mt-2">
              Focusing on: <span className="font-semibold">{initialTaskTitle}</span>
            </p>
          )}
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto"> {/* Centered description */}
            Utilize Pomodoro or custom timers to enhance concentration and productivity.
          </p>
        </div>
        
        <ErrorBoundary>
          <EnhancedFocusTimer 
            initialTaskId={initialTaskId} 
            initialTaskTitle={initialTaskTitle} 
            // Pass other necessary props if EnhancedFocusTimer needs them
          />
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default FocusTimerPage; // Export renamed component