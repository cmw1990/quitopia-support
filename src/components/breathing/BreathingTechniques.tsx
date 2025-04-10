import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { motion, AnimatePresence } from 'framer-motion';

interface BreathingExercise {
  id: string;
  name: string;
  description: string;
  duration: number;
  type: 'focus' | 'calm' | 'energize' | 'balance' | 'sleep';
  pattern: {
    inhale: number;
    hold1?: number;
    exhale: number;
    hold2?: number;
  };
  benefits: string[];
  bestFor: string[];
  instructions: string[];
}

export const BreathingTechniques: React.FC = () => {
  const [selectedExercise, setSelectedExercise] =
    useState<BreathingExercise | null>(null);
  const [isPracticing, setIsPracticing] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<
    'inhale' | 'hold1' | 'exhale' | 'hold2'
  >('inhale');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);

  const breathingExercises: BreathingExercise[] = [
    {
      id: '1',
      name: '4-7-8 Breathing',
      description:
        'A powerful technique to calm your nervous system and improve focus',
      duration: 300,
      type: 'calm',
      pattern: {
        inhale: 4,
        hold1: 7,
        exhale: 8,
      },
      benefits: [
        'Reduces anxiety and stress',
        'Improves focus and concentration',
        'Helps with sleep',
        'Balances energy levels',
      ],
      bestFor: [
        'Anxiety management',
        'Pre-focus session preparation',
        'Stress reduction',
        'Sleep preparation',
      ],
      instructions: [
        'Find a comfortable sitting position',
        'Place tongue behind upper front teeth',
        'Exhale completely through mouth',
        'Close mouth and inhale through nose',
        'Hold breath',
        'Exhale completely through mouth',
      ],
    },
    {
      id: '2',
      name: 'Box Breathing',
      description:
        'Equal-ratio breathing to enhance focus and create mental clarity',
      duration: 240,
      type: 'focus',
      pattern: {
        inhale: 4,
        hold1: 4,
        exhale: 4,
        hold2: 4,
      },
      benefits: [
        'Enhances concentration',
        'Reduces stress',
        'Improves mental clarity',
        'Increases mind-body connection',
      ],
      bestFor: [
        'Focus preparation',
        'Quick stress relief',
        'Mental performance',
        'Meditation practice',
      ],
      instructions: [
        'Sit in a comfortable position',
        'Slowly exhale all air',
        'Inhale through nose',
        'Hold breath',
        'Exhale through mouth',
        'Hold empty lungs',
      ],
    },
    {
      id: '3',
      name: 'Energizing Breath',
      description:
        'Dynamic breathing technique to increase energy and alertness',
      duration: 180,
      type: 'energize',
      pattern: {
        inhale: 2,
        exhale: 1,
      },
      benefits: [
        'Increases energy levels',
        'Improves alertness',
        'Enhances mental clarity',
        'Boosts oxygen flow',
      ],
      bestFor: [
        'Morning routines',
        'Afternoon slumps',
        'Pre-workout',
        'Mental fatigue',
      ],
      instructions: [
        'Sit up straight',
        'Quick, sharp inhale through nose',
        'Short, forceful exhale',
        'Maintain rapid pace',
        'Keep shoulders relaxed',
      ],
    },
  ];

  const getExerciseTypeColor = (type: BreathingExercise['type']) => {
    switch (type) {
      case 'focus':
        return 'bg-blue-100 text-blue-800';
      case 'calm':
        return 'bg-green-100 text-green-800';
      case 'energize':
        return 'bg-orange-100 text-orange-800';
      case 'balance':
        return 'bg-purple-100 text-purple-800';
      case 'sleep':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isPracticing && selectedExercise) {
      const pattern = selectedExercise.pattern;
      const totalPhaseTime = pattern[currentPhase] || 0;

      if (secondsLeft === 0) {
        // Move to next phase
        const allPhases = ['inhale', 'hold1', 'exhale', 'hold2'] as Array<'inhale' | 'hold1' | 'exhale' | 'hold2'>;
        const phases = allPhases.filter(phase => pattern[phase] !== undefined);

        const currentIndex = phases.indexOf(currentPhase);
        const nextPhase =
          phases[(currentIndex + 1) % phases.length] as typeof currentPhase;

        if (currentPhase === phases[phases.length - 1]) {
          setCycleCount((prev) => prev + 1);
        }

        setCurrentPhase(nextPhase);
        setSecondsLeft(pattern[nextPhase] || 0);
      } else {
        timer = setTimeout(() => {
          setSecondsLeft((prev) => prev - 1);
        }, 1000);
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPracticing, secondsLeft, currentPhase, selectedExercise]);

  const startExercise = (exercise: BreathingExercise) => {
    setSelectedExercise(exercise);
    setIsPracticing(true);
    setCurrentPhase('inhale');
    setSecondsLeft(exercise.pattern.inhale);
    setCycleCount(0);
  };

  const stopExercise = () => {
    setIsPracticing(false);
    setSecondsLeft(0);
    setCycleCount(0);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Breathing Techniques</h2>

      <div className="grid gap-6">
        <AnimatePresence mode="wait">
          {isPracticing && selectedExercise ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-6">
                <div className="text-center space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold">
                      {selectedExercise.name}
                    </h3>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm mt-2 ${getExerciseTypeColor(
                        selectedExercise.type
                      )}`}
                    >
                      Cycle {cycleCount + 1}
                    </span>
                  </div>

                  <div className="relative w-48 h-48 mx-auto">
                    <motion.div
                      className="w-full h-full rounded-full border-4 border-blue-500 flex items-center justify-center"
                      animate={{
                        scale:
                          currentPhase === 'inhale'
                            ? [1, 1.2]
                            : currentPhase === 'exhale'
                            ? [1.2, 1]
                            : 1.2,
                      }}
                      transition={{
                        duration:
                          selectedExercise.pattern[currentPhase] || 0,
                        ease: 'easeInOut',
                      }}
                    >
                      <div className="text-center">
                        <div className="text-4xl font-bold text-blue-500">
                          {secondsLeft}
                        </div>
                        <div className="text-sm text-gray-600 capitalize">
                          {currentPhase.replace(/([0-9])/g, ' $1')}
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                    {Object.entries(selectedExercise.pattern).map(
                      ([phase, duration]) => (
                        <div
                          key={phase}
                          className={`p-3 rounded-lg ${
                            currentPhase === phase
                              ? 'bg-blue-50 border-2 border-blue-500'
                              : 'bg-gray-50'
                          }`}
                        >
                          <div className="text-sm text-gray-600 capitalize">
                            {phase.replace(/([0-9])/g, ' $1')}
                          </div>
                          <div className="text-lg font-semibold">
                            {duration}s
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  <div className="flex justify-center gap-4">
                    <button
                      onClick={stopExercise}
                      className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Stop
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : selectedExercise ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-bold">
                        {selectedExercise.name}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getExerciseTypeColor(
                          selectedExercise.type
                        )}`}
                      >
                        {selectedExercise.type}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-2">
                      {selectedExercise.description}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedExercise(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3">
                        Breathing Pattern
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(selectedExercise.pattern).map(
                          ([phase, duration]) => (
                            <div
                              key={phase}
                              className="p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="text-sm text-gray-600 capitalize">
                                {phase.replace(/([0-9])/g, ' $1')}
                              </div>
                              <div className="text-lg font-semibold">
                                {duration} seconds
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Benefits</h4>
                      <div className="space-y-2">
                        {selectedExercise.benefits.map(
                          (benefit, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center gap-2"
                            >
                              <span className="text-green-500">✓</span>
                              {benefit}
                            </motion.div>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3">Instructions</h4>
                      <div className="space-y-3">
                        {selectedExercise.instructions.map(
                          (instruction, index) => (
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
                              <span>{instruction}</span>
                            </motion.div>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Best For</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedExercise.bestFor.map((use) => (
                          <span
                            key={use}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                          >
                            {use}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => startExercise(selectedExercise)}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        Start Practice
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {breathingExercises.map((exercise) => (
                <motion.div
                  key={exercise.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card
                    className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedExercise(exercise)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold">{exercise.name}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getExerciseTypeColor(
                            exercise.type
                          )}`}
                        >
                          {exercise.type}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {Math.floor(exercise.duration / 60)} min
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
                      {exercise.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {exercise.bestFor.slice(0, 2).map((use, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full"
                        >
                          {use}
                        </span>
                      ))}
                      {exercise.bestFor.length > 2 && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                          +{exercise.bestFor.length - 2} more
                        </span>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
