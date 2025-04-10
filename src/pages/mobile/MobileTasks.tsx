
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Clock, 
  Calendar, 
  Tag, 
  MoreVertical,
  X,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
}

const MobileTasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Complete project outline', completed: false, priority: 'high' },
    { id: '2', title: 'Schedule doctor appointment', completed: false, priority: 'medium' },
    { id: '3', title: 'Buy groceries', completed: true, priority: 'low' },
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  const handleAddTask = () => {
    if (newTaskTitle.trim() === '') return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      completed: false,
    };
    
    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
    setIsAdding(false);
  };
  
  const handleToggleComplete = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };
  
  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };
  
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-amber-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const filterTasks = (completed: boolean) => {
    return tasks.filter(task => task.completed === completed);
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Button variant="ghost" size="icon" onClick={() => setIsAdding(true)}>
          <Plus className="h-5 w-5" />
        </Button>
      </div>
      
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Input
                    placeholder="Task title"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    autoFocus
                  />
                  <div className="flex justify-between gap-2">
                    <Button variant="outline" size="icon" className="rounded-full">
                      <Calendar className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <Clock className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <Tag className="h-4 w-4" />
                    </Button>
                    <div className="flex-1"></div>
                    <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleAddTask}>Add</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <Circle className="h-4 w-4 mr-2 text-primary" />
              To Do
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {filterTasks(false).length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                You're all caught up!
              </div>
            ) : (
              filterTasks(false).map(task => (
                <div 
                  key={task.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => handleToggleComplete(task.id)}
                    />
                    <span className={getPriorityColor(task.priority)}>●</span>
                    <span>{task.title}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-2 text-primary" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {filterTasks(true).length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No completed tasks yet
              </div>
            ) : (
              filterTasks(true).map(task => (
                <div 
                  key={task.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => handleToggleComplete(task.id)}
                    />
                    <span className="line-through text-muted-foreground">{task.title}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MobileTasks;
