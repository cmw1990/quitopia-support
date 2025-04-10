
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Check, Timer, RefreshCw } from 'lucide-react';
import { DigitalMinimalismGoal } from '@/lib/types/distraction-types';
import { useToast } from '@/hooks/use-toast';

export const DigitalMinimalism: React.FC = () => {
  const [goals, setGoals] = useState<DigitalMinimalismGoal[]>([]);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const { toast } = useToast();

  const handleAddGoal = () => {
    if (!newGoalTitle.trim()) {
      toast({
        title: "Goal Required",
        description: "Please enter a goal title",
        variant: "destructive",
      });
      return;
    }

    const newGoal: DigitalMinimalismGoal = {
      id: Date.now().toString(),
      user_id: "current-user-id", // Would be replaced with actual user ID
      title: newGoalTitle,
      description: "",
      start_date: new Date().toISOString(),
      category: "reduce",
      progress: 0,
      milestones: [],
      reflections: [],
      completed: false
    };

    setGoals([...goals, newGoal]);
    setNewGoalTitle('');
    
    toast({
      title: "Goal Added",
      description: "Your new digital minimalism goal has been created",
      variant: "success",
    });
  };

  const handleToggleComplete = (goalId: string) => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        return { ...goal, completed: !goal.completed };
      }
      return goal;
    }));
  };

  const handleRemoveGoal = (goalId: string) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
    
    toast({
      title: "Goal Removed",
      description: "Your goal has been removed",
    });
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'reduce':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'replace':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'reflect':
        return 'bg-green-500 hover:bg-green-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Digital Minimalism</h2>
        <Button variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh Goals
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Goal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input 
              placeholder="Enter a digital minimalism goal..." 
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAddGoal}>
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {goals.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-muted-foreground">You haven't created any digital minimalism goals yet.</div>
          </Card>
        ) : (
          goals.map(goal => (
            <Card key={goal.id} className={`transition-all ${goal.completed ? 'bg-muted' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Checkbox
                      checked={goal.completed}
                      onCheckedChange={() => handleToggleComplete(goal.id)}
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${goal.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {goal.title}
                        </span>
                        <Badge className={getCategoryBadgeClass(goal.category)}>
                          {goal.category}
                        </Badge>
                      </div>
                      {goal.description && (
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                      )}
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Timer className="h-3 w-3 mr-1" />
                        Started {new Date(goal.start_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveGoal(goal.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
