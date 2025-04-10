import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/card';
import { motion, AnimatePresence } from 'framer-motion';

interface TransitionPhase {
  name: string;
  duration: number;
  description: string;
  tips: string[];
}

export const TaskTransitionTimer: React.FC = () => {
  const [currentPhase, setCurrentPhase] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showSettings, setShowSettings] = useState(false);

  const transitionPhases: TransitionPhase[] = [
    {
      name: 'Wrap Up Current Task',
      duration: 180, // 3 minutes
      description:
        'Complete any quick remaining items and create a clear stopping point',
      tips: [
        'Save your work',
        'Write down any incomplete items',
        'Note your next steps',
        'Clear your workspace',
      ],
    },
    {
      name: 'Mental Reset',
      duration: 120, // 2 minutes
      description: 'Clear your mind and prepare for the task switch',
      tips: [
        'Take a few deep breaths',
        'Stand up and stretch',
        'Quick mindfulness moment',
        'Reset your posture',
      ],
    },
    {
      name: 'Next Task Setup',
      duration: 180, // 3 minutes
      description:
        'Prepare your environment and mind for the upcoming task',
      tips: [
        'Review task requirements',
        'Gather necessary materials',
        'Set clear intentions',
        'Remove potential distractions',
      ],
    },
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      if (currentPhase < transitionPhases.length - 1) {
        setCurrentPhase((prev) => prev + 1);
        setTimeLeft(transitionPhases[currentPhase + 1].duration);
      } else {
        setIsRunning(false);
      }
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft, currentPhase]);

  const startTransition = () => {
    setCurrentPhase(0);
    setTimeLeft(transitionPhases[0].duration);
    setIsRunning(true);
  };

  const pauseTransition = () => {
    setIsRunning(false);
  };

  const resumeTransition = () => {
    setIsRunning(true);
  };

  const resetTransition = () => {
    setCurrentPhase(0);
    setTimeLeft(transitionPhases[0].duration);
    setIsRunning(false);
  };

  const skipToNextPhase = () => {
    if (currentPhase < transitionPhases.length - 1) {
      setCurrentPhase((prev) => prev + 1);
      setTimeLeft(transitionPhases[currentPhase + 1].duration);
    } else {
      resetTransition();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Task Transition Timer</h2>
        <button
          onClick={() => setShowSettings(true)}
          className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
        >
          Settings
        </button>
      </div>

      <div className="grid gap-6">
        <AnimatePresence mode="wait">
          {showSettings ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-semibold">Timer Settings</h3>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {transitionPhases.map((phase, index) => (
                    <div key={index} className="space-y-3">
                      <h4 className="font-medium">{phase.name}</h4>
                      <div className="flex items-center gap-4">
                        <input
                          type="number"
                          min="30"
                          step="30"
                          defaultValue={phase.duration}
                          className="w-24 p-2 border rounded-lg"
                        />
                        <span className="text-sm text-gray-600">
                          seconds
                        </span>
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => setShowSettings(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                      Save Settings
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="space-y-6 text-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">
                      {transitionPhases[currentPhase].name}
                    </h3>
                    <p className="text-gray-600">
                      {transitionPhases[currentPhase].description}
                    </p>
                  </div>

                  <div className="relative w-48 h-48 mx-auto">
                    <motion.div
                      className="w-full h-full rounded-full border-8 border-blue-500 flex items-center justify-center"
                      animate={{
                        rotate: isRunning ? 360 : 0,
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    >
                      <div className="text-center">
                        <div className="text-4xl font-bold text-blue-500">
                          {formatTime(timeLeft)}
                        </div>
                        <div className="text-sm text-gray-600">
                          Phase {currentPhase + 1}/
                          {transitionPhases.length}
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  <div className="flex justify-center gap-4">
                    {!isRunning && timeLeft === 0 && (
                      <button
                        onClick={startTransition}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        Start Transition
                      </button>
                    )}
                    {isRunning && (
                      <button
                        onClick={pauseTransition}
                        className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                      >
                        Pause
                      </button>
                    )}
                    {!isRunning && timeLeft > 0 && (
                      <button
                        onClick={resumeTransition}
                        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        Resume
                      </button>
                    )}
                    {timeLeft > 0 && (
                      <>
                        <button
                          onClick={resetTransition}
                          className="px-6 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
                        >
                          Reset
                        </button>
                        <button
                          onClick={skipToNextPhase}
                          className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                        >
                          Skip to Next
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h4 className="font-semibold mb-4">Phase Tips</h4>
                <div className="grid gap-4">
                  {transitionPhases[currentPhase].tips.map((tip, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-sm">
                        {index + 1}
                      </span>
                      <span>{tip}</span>
                    </motion.div>
                  ))}
                </div>
              </Card>

              <div className="grid grid-cols-3 gap-4">
                {transitionPhases.map((phase, index) => (
                  <Card
                    key={index}
                    className={`p-4 ${
                      currentPhase === index
                        ? 'ring-2 ring-blue-500'
                        : ''
                    }`}
                  >
                    <div className="text-center">
                      <h5
                        className={`font-medium mb-2 ${
                          currentPhase === index
                            ? 'text-blue-500'
                            : 'text-gray-800'
                        }`}
                      >
                        Phase {index + 1}
                      </h5>
                      <div className="text-sm text-gray-600">
                        {phase.name}
                      </div>
                      <div className="text-sm font-medium mt-2">
                        {formatTime(phase.duration)}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
