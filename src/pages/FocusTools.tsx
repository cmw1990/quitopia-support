import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  BrainCircuit, 
  Calendar, 
  Clock, 
  FileText, 
  LineChart, 
  ListTodo, 
  Settings, 
  Shield, 
  Volume2, 
  Zap,
  Grid,
  TrendingUp,
  Mountain,
  Award
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { FocusTimer } from '../components/FocusTimer/index';
import { TaskBreakdown } from '../components/TaskBreakdown/index';
import { WhiteNoiseGenerator } from '../components/WhiteNoiseGenerator/index';
import { DistractionBlocker } from '../components/DistractionBlocker/index';
import { PriorityMatrix } from '../components/PriorityMatrix/index';
import { FocusJourney } from '../components/FocusJourney/index';
import { FlowState } from '../components/FlowState/index';

export default function FocusTools() {
  const [activeTab, setActiveTab] = useState('focus-timer');
  const [showExtraTools, setShowExtraTools] = useState(false);
  
  // Define the tools
  const tools = [
    {
      id: 'focus-timer',
      name: 'Focus Timer',
      description: 'Track and optimize your focus sessions',
      icon: <Clock className="h-5 w-5" />,
      component: <FocusTimer />,
      color: 'from-blue-500/10 to-purple-500/5'
    },
    {
      id: 'task-breakdown',
      name: 'Task Breakdown',
      description: 'Break complex tasks into manageable steps',
      icon: <ListTodo className="h-5 w-5" />,
      component: <TaskBreakdown />,
      color: 'from-green-500/10 to-emerald-500/5'
    },
    {
      id: 'priority-matrix',
      name: 'Priority Matrix',
      description: 'Organize tasks by importance and urgency',
      icon: <Grid className="h-5 w-5" />,
      component: <PriorityMatrix />,
      color: 'from-purple-500/10 to-indigo-500/5'
    },
    {
      id: 'white-noise',
      name: 'Focus Sounds',
      description: 'Background sounds to enhance concentration',
      icon: <Volume2 className="h-5 w-5" />,
      component: <WhiteNoiseGenerator />,
      color: 'from-amber-500/10 to-yellow-500/5'
    },
    {
      id: 'distraction-blocker',
      name: 'Distraction Blocker',
      description: 'Block digital distractions during focus time',
      icon: <Shield className="h-5 w-5" />,
      component: <DistractionBlocker />,
      color: 'from-red-500/10 to-pink-500/5'
    },
    {
      id: 'flow-state',
      name: 'Flow State',
      description: 'Visualize and track your flow state',
      icon: <Zap className="h-5 w-5" />,
      component: <FlowState />,
      color: 'from-cyan-500/10 to-blue-500/5'
    },
    {
      id: 'focus-journey',
      name: 'Focus Journey',
      description: 'Track your progress and achievements over time',
      icon: <Award className="h-5 w-5" />,
      component: <FocusJourney />,
      color: 'from-indigo-500/10 to-blue-500/5'
    }
  ];
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Focus Tools</h1>
              <p className="text-muted-foreground">
                Comprehensive tools to enhance your productivity and focus
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Focus Calendar</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-1" onClick={() => setActiveTab('focus-journey')}>
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Progress</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {tools.map((tool, index) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card 
              className={`h-full cursor-pointer transition-all hover:shadow-md relative overflow-hidden ${
                activeTab === tool.id ? 'border-primary ring-1 ring-primary/20' : ''
              }`}
              onClick={() => setActiveTab(tool.id)}
            >
              <div 
                className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-50`}
              />
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-full bg-background border ${
                    activeTab === tool.id ? 'text-primary border-primary' : 'text-muted-foreground border-muted-foreground/20'
                  }`}>
                    {tool.icon}
                  </div>
                  {activeTab === tool.id && (
                    <Badge variant="default" className="bg-primary">
                      Active
                    </Badge>
                  )}
                </div>
                <CardTitle className="mt-2">{tool.name}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>
      
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        {tools.find(tool => tool.id === activeTab)?.component}
      </motion.div>
    </div>
  );
} 