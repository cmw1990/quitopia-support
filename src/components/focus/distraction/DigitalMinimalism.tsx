import React, { useState, useCallback, useEffect, KeyboardEvent, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  DigitalMinimalismGoal,
  Milestone,
  GoalReflection 
} from '@/lib/types/distraction-types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  CheckCircle2, 
  Clock, 
  ArrowUpCircle,
  ThumbsUp,
  Menu,
  BarChart2,
  Heart,
  Loader2,
  Smile,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { DistractionApiClient } from '@/lib/api/distraction-api';
import { format } from 'date-fns';

interface Props {
  className?: string;
}

interface GoalProgress {
  progress: number;
  completed: number;
  total: number;
}

type ReflectionState = {
  successes: string[];
  insights: string;
  tempSuccess: string;
  mood: number;
  challenges: string[];
  tempChallenge: string;
};

const getGoalIcon = (type: DigitalMinimalismGoal['goal_type']) => {
  switch (type) {
    case 'reduction': return Menu;
    case 'elimination': return Target;
    case 'mindful_usage': return Heart;
    default: return Target;
  }
};

export const DigitalMinimalism: React.FC<Props> = ({ className = '' }) => {
  // Previous state and hooks remain the same
  const { session } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<DigitalMinimalismGoal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [showReflection, setShowReflection] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reflectionText, setReflectionText] = useState<ReflectionState>({
    successes: [],
    insights: '',
    tempSuccess: '',
    mood: 5,
    challenges: [],
    tempChallenge: ''
  });

  const api = new DistractionApiClient(session?.access_token || '');

  const goalProgress = useMemo<Record<string, GoalProgress>>(() => {
    return goals.reduce((acc, goal) => {
      const progress = Math.round((goal.current_progress / goal.total_goal) * 100);
      acc[goal.id] = {
        progress,
        completed: goal.current_progress,
        total: goal.total_goal
      };
      return acc;
    }, {} as Record<string, GoalProgress>);
  }, [goals]);

  // Previous handlers and functions remain the same
  const loadGoals = useCallback(async () => {
    try {
      const data = await api.getDigitalGoals(session!.user.id);
      setGoals(data);
    } catch (error) {
      console.error('Failed to load digital goals:', error);
      toast({
        title: 'Error',
        description: 'Failed to load goals',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [api, session, toast]);

  const handleAddReflection = useCallback(async (goalId: string) => {
    if (!reflectionText.insights.trim() && reflectionText.successes.length === 0) return;

    try {
      const reflection: GoalReflection = {
        date: new Date().toISOString(),
        insights: reflectionText.insights,
        successes: reflectionText.successes,
        challenges: reflectionText.challenges,
        mood: reflectionText.mood
      };

      const updatedGoal = await api.updateDigitalGoal(goalId, {
        reflections: [...(goals.find(g => g.id === goalId)?.reflections || []), reflection]
      });

      setGoals(prev => prev.map(goal => goal.id === goalId ? updatedGoal : goal));
      setShowReflection(false);
      setReflectionText({
        successes: [],
        insights: '',
        tempSuccess: '',
        mood: 5,
        challenges: [],
        tempChallenge: ''
      });

      toast({
        title: 'Success',
        description: 'Reflection added successfully'
      });
    } catch (error) {
      console.error('Failed to add reflection:', error);
      toast({
        title: 'Error',
        description: 'Failed to add reflection',
        variant: 'destructive'
      });
    }
  }, [api, goals, reflectionText, toast]);

  const handleCompleteMilestone = useCallback(async (goalId: string, milestoneIndex: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const updatedMilestones = [...goal.milestones];
    updatedMilestones[milestoneIndex] = {
      ...updatedMilestones[milestoneIndex],
      completed: !updatedMilestones[milestoneIndex].completed,
      completion_date: !updatedMilestones[milestoneIndex].completed ? new Date().toISOString() : undefined
    };

    try {
      const updatedGoal = await api.updateDigitalGoal(goalId, {
        milestones: updatedMilestones,
        current_progress: updatedMilestones.filter(m => m.completed).length
      });

      setGoals(prev => prev.map(g => g.id === goalId ? updatedGoal : g));
      toast({
        title: 'Success',
        description: 'Milestone updated'
      });
    } catch (error) {
      console.error('Failed to update milestone:', error);
      toast({
        title: 'Error',
        description: 'Failed to update milestone',
        variant: 'destructive'
      });
    }
  }, [api, goals, toast]);

  const addChallenge = useCallback(() => {
    if (!reflectionText.tempChallenge.trim()) return;
    
    setReflectionText(prev => ({
      ...prev,
      challenges: [...prev.challenges, prev.tempChallenge.trim()],
      tempChallenge: ''
    }));
  }, [reflectionText.tempChallenge]);

  const handleSuccessKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && reflectionText.tempSuccess.trim()) {
      setReflectionText(prev => ({
        ...prev,
        successes: [...prev.successes, prev.tempSuccess.trim()],
        tempSuccess: ''
      }));
    }
  }, [reflectionText.tempSuccess]);

  const handleChallengeKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && reflectionText.tempChallenge.trim()) {
      addChallenge();
    }
  }, [addChallenge, reflectionText.tempChallenge]);

  const renderReflectionForm = useCallback((goalId: string) => (
    <Card className="p-4">
      <h5 className="font-medium mb-3">Daily Reflection</h5>
      <div className="space-y-4">
        {/* Mood Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Mood</span>
            <span className="text-sm text-gray-500">{reflectionText.mood}/10</span>
          </div>
          <Slider
            min={1}
            max={10}
            value={[reflectionText.mood]}
            onValueChange={([value]) => setReflectionText(prev => ({ ...prev, mood: value }))}
            className="my-4"
          />
        </div>

        {/* Successes */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ThumbsUp className="h-4 w-4 text-green-500" />
            <span className="text-sm">What went well?</span>
          </div>
          <div className="space-y-2">
            <input 
              type="text"
              className="w-full p-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              placeholder="Add a success point..."
              value={reflectionText.tempSuccess}
              onChange={(e) => setReflectionText(prev => ({ ...prev, tempSuccess: e.target.value }))}
              onKeyDown={handleSuccessKeyDown}
            />
            {reflectionText.successes.length > 0 && (
              <ul className="space-y-1">
                {reflectionText.successes.map((success, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span>•</span>
                    <span className="flex-1">{success}</span>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => setReflectionText(prev => ({
                        ...prev,
                        successes: prev.successes.filter((_, idx) => idx !== i)
                      }))}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Challenges */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpCircle className="h-4 w-4 text-orange-500" />
            <span className="text-sm">What were the challenges?</span>
          </div>
          <div className="space-y-2">
            <input 
              type="text"
              className="w-full p-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              placeholder="Add a challenge..."
              value={reflectionText.tempChallenge}
              onChange={(e) => setReflectionText(prev => ({ ...prev, tempChallenge: e.target.value }))}
              onKeyDown={handleChallengeKeyDown}
            />
            {reflectionText.challenges.length > 0 && (
              <ul className="space-y-1">
                {reflectionText.challenges.map((challenge, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span>•</span>
                    <span className="flex-1">{challenge}</span>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => setReflectionText(prev => ({
                        ...prev,
                        challenges: prev.challenges.filter((_, idx) => idx !== i)
                      }))}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Insights */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpCircle className="h-4 w-4 text-blue-500" />
            <span className="text-sm">Key insights?</span>
          </div>
          <textarea 
            className="w-full p-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            rows={2}
            placeholder="What did you learn?"
            value={reflectionText.insights}
            onChange={(e) => setReflectionText(prev => ({ ...prev, insights: e.target.value }))}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowReflection(false);
              setReflectionText({
                successes: [],
                insights: '',
                tempSuccess: '',
                mood: 5,
                challenges: [],
                tempChallenge: ''
              });
            }}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => handleAddReflection(goalId)}
          >
            Save Reflection
          </Button>
        </div>
      </div>
    </Card>
  ), [reflectionText, handleAddReflection, handleSuccessKeyDown, handleChallengeKeyDown]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Digital Wellness Goals</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            toast({
              title: 'Coming Soon',
              description: 'Goal creation will be available soon'
            });
          }}
        >
          <Target className="h-4 w-4 mr-2" />
          New Goal
        </Button>
      </div>

      <AnimatePresence>
        <div className="grid gap-4">
          {goals.map((goal) => {
            const Icon = getGoalIcon(goal.goal_type);
            const { progress, completed, total } = goalProgress[goal.id];

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                layout
              >
                <Card className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg bg-${goal.goal_type === 'mindful_usage' ? 'purple' : 'blue'}-100`}>
                      <Icon className={`h-5 w-5 text-${goal.goal_type === 'mindful_usage' ? 'purple' : 'blue'}-500`} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{goal.target}</h4>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {format(new Date(goal.target_date), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>

                      <Progress 
                        value={progress} 
                        className="h-2 bg-gray-100 dark:bg-gray-800"
                      />
                      
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-gray-500">{progress}% Complete</span>
                        <span className="text-sm text-gray-500">
                          {completed} / {total} milestones
                        </span>
                      </div>

                      <div className="mt-4 space-y-3">
                        {goal.milestones.map((milestone, index) => (
                          <div 
                            key={index}
                            className="flex items-start gap-2 text-sm"
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`p-0 h-auto ${milestone.completed ? 'text-green-500' : 'text-gray-400'}`}
                              onClick={() => handleCompleteMilestone(goal.id, index)}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <span className={milestone.completed ? 'line-through text-gray-500' : ''}>
                              {milestone.description}
                            </span>
                          </div>
                        ))}
                      </div>

                      {goal.reflections && goal.reflections.length > 0 && (
                        <div className="mt-4">
                          <h5 className="text-sm font-medium mb-2">Latest Reflection</h5>
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm">
                            <div className="flex items-center justify-between text-gray-500 mb-1">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {format(new Date(goal.reflections[0].date), 'MMM d, yyyy')}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Smile className="h-3 w-3" />
                                <span>Mood: {goal.reflections[0].mood}/10</span>
                              </div>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 mb-2">
                              {goal.reflections[0].insights}
                            </p>
                            {goal.reflections[0].successes.length > 0 && (
                              <div className="text-green-600 dark:text-green-400 text-xs">
                                ✓ {goal.reflections[0].successes[0]}
                                {goal.reflections[0].successes.length > 1 && 
                                  ` +${goal.reflections[0].successes.length - 1} more`}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedGoal(goal.id);
                            setShowReflection(true);
                          }}
                        >
                          Add Reflection
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedGoal(goal.id)}
                        >
                          <BarChart2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>

                <AnimatePresence>
                  {selectedGoal === goal.id && showReflection && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2"
                    >
                      {renderReflectionForm(goal.id)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </AnimatePresence>

      {goals.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No digital wellness goals yet.</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Create a goal to start tracking your digital minimalism journey.
          </p>
        </div>
      )}
    </div>
  );
};
