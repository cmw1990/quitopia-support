
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { DigitalMinimalismGoal } from '@/lib/types/distraction-types';

interface DigitalMinimalismProps {
  goals: DigitalMinimalismGoal[];
  onUpdate: (id: string, updates: Partial<DigitalMinimalismGoal>) => Promise<void>;
  onAddReflection: (goalId: string, reflection: string) => void;
  onCompleteMilestone: (goalId: string, milestoneIndex: number) => void;
}

export const DigitalMinimalism: React.FC<DigitalMinimalismProps> = ({ 
  goals, 
  onUpdate,
  onAddReflection,
  onCompleteMilestone
}) => {
  const [newReflection, setNewReflection] = React.useState('');
  const [activeGoalId, setActiveGoalId] = React.useState<string | null>(null);

  const handleSubmitReflection = (goalId: string) => {
    if (newReflection.trim()) {
      onAddReflection(goalId, newReflection);
      setNewReflection('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Digital Minimalism Goals</h3>
        <Button variant="outline">Add Goal</Button>
      </div>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-muted-foreground mb-4">No digital minimalism goals yet</p>
            <Button variant="outline">Create your first goal</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <Card key={goal.id} className={goal.completed ? "opacity-70" : ""}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">{goal.title}</CardTitle>
                  <span className={`text-xs px-2 py-1 rounded ${
                    goal.category === 'reduce' 
                      ? 'bg-red-100 text-red-800' 
                      : goal.category === 'replace'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{goal.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} />
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Milestones</h4>
                    <div className="space-y-2">
                      {goal.milestones.map((milestone, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`milestone-${goal.id}-${index}`}
                            checked={milestone.completed}
                            onCheckedChange={() => onCompleteMilestone(goal.id, index)}
                          />
                          <label 
                            htmlFor={`milestone-${goal.id}-${index}`}
                            className={`text-sm ${milestone.completed ? 'line-through text-muted-foreground' : ''}`}
                          >
                            {milestone.description}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {activeGoalId === goal.id ? (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Add Reflection</h4>
                      <Textarea 
                        value={newReflection}
                        onChange={(e) => setNewReflection(e.target.value)}
                        placeholder="What have you learned from this practice?"
                        className="h-20"
                      />
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setActiveGoalId(null)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleSubmitReflection(goal.id)}
                        >
                          Save Reflection
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      variant="link" 
                      className="px-0"
                      onClick={() => setActiveGoalId(goal.id)}
                    >
                      Add reflection
                    </Button>
                  )}
                  
                  {goal.reflections.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Reflections</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {goal.reflections.map((reflection, index) => (
                          <div key={index} className="text-sm p-2 bg-muted rounded-md">
                            <p className="text-xs text-muted-foreground mb-1">
                              {new Date(reflection.date).toLocaleDateString()}
                            </p>
                            <p>{reflection.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
