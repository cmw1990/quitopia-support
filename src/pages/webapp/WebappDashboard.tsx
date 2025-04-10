import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { EnergyChart } from '@/components/charts/EnergyChart';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  Brain,
  Coffee,
  Dumbbell,
  Eye,
  Heart,
  Moon,
  Pill,
  Salad,
  Zap,
  Focus,
  Wind,
  Timer,
  Volume2,
  Shield,
  Footprints,
  Settings,
  Plus,
  Pin,
  Sun,
  Battery,
  Sparkles,
  Flame,
  Droplet,
  BrainCircuit,
  HeartPulse,
  Waves,
  Music,
  Lightbulb,
  Clock,
  Gamepad,
  BookOpen,
  Tags,
  Filter
} from 'lucide-react';

interface QuickTool {
  id: string;
  name: string;
  icon: any;
  href: string;
  category: string;
  tags: string[];
  pinned: boolean;
}

interface EnergyMetric {
  name: string;
  value: number;
  icon: any;
  trend: 'up' | 'down' | 'stable';
  color: string;
  description: string;
}

export const WebappDashboard = () => {
  const [activeFilterTag, setActiveFilterTag] = useState<string | null>(null);
  const [quickTools, setQuickTools] = useState<QuickTool[]>([
    // Focus Tools
    { 
      id: '1', 
      name: 'White Noise', 
      icon: Volume2, 
      href: '/webapp/focus/white-noise', 
      category: 'Focus', 
      tags: ['Productivity', 'Sound', 'Concentration'],
      pinned: true 
    },
    { 
      id: '2', 
      name: 'Distraction Blocker', 
      icon: Shield, 
      href: '/webapp/focus/blocker', 
      category: 'Focus', 
      tags: ['Productivity', 'Digital Wellbeing', 'Work'],
      pinned: true 
    },
    { 
      id: '3', 
      name: 'Focus Timer', 
      icon: Timer, 
      href: '/webapp/focus/timer', 
      category: 'Focus', 
      tags: ['Productivity', 'Time Management', 'Work'],
      pinned: true 
    },
    { 
      id: '4', 
      name: 'Brain Games', 
      icon: Gamepad, 
      href: '/webapp/cognitive/games', 
      category: 'Cognitive', 
      tags: ['Mental Fitness', 'Brain Training', 'Games'],
      pinned: false 
    },
    
    // Mental Health Tools
    { 
      id: '5', 
      name: 'Meditation', 
      icon: Brain, 
      href: '/webapp/mental-health/meditation', 
      category: 'Mental Health', 
      tags: ['Mindfulness', 'Stress Relief', 'Relaxation'],
      pinned: true 
    },
    { 
      id: '6', 
      name: 'Breathing', 
      icon: Wind, 
      href: '/webapp/mental-health/breathing', 
      category: 'Mental Health', 
      tags: ['Mindfulness', 'Stress Relief', 'Energy'],
      pinned: true 
    },
    { 
      id: '7', 
      name: 'Mood Journal', 
      icon: BookOpen, 
      href: '/webapp/mental-health/journal', 
      category: 'Mental Health', 
      tags: ['Emotional Tracking', 'Self-reflection', 'Mindfulness'],
      pinned: false 
    },
    { 
      id: '8', 
      name: 'Calming Sounds', 
      icon: Music, 
      href: '/webapp/mental-health/sounds', 
      category: 'Mental Health', 
      tags: ['Relaxation', 'Sound', 'Sleep Aid'],
      pinned: false 
    },
    
    // Physical Tools
    { 
      id: '9', 
      name: 'Step Counter', 
      icon: Footprints, 
      href: '/webapp/exercise/steps', 
      category: 'Exercise', 
      tags: ['Activity', 'Fitness', 'Movement'],
      pinned: true 
    },
    { 
      id: '10', 
      name: 'Desk Exercises', 
      icon: Dumbbell, 
      href: '/webapp/office/desk-exercises', 
      category: 'Exercise', 
      tags: ['Office Wellness', 'Movement', 'Fitness'],
      pinned: false 
    },
    { 
      id: '11', 
      name: 'Eye Care', 
      icon: Eye, 
      href: '/webapp/office/eye-care', 
      category: 'Exercise', 
      tags: ['Office Wellness', 'Health', 'Digital Wellbeing'],
      pinned: true 
    },
    { 
      id: '12', 
      name: 'Break Timer', 
      icon: Clock, 
      href: '/webapp/office/break-timer', 
      category: 'Exercise', 
      tags: ['Office Wellness', 'Time Management', 'Health'],
      pinned: false 
    },
  ]);

  // Get all unique tags from tools
  const allTags = Array.from(new Set(quickTools.flatMap(tool => tool.tags)));

  // Filter tools by active tag
  const getFilteredTools = (category: string) => {
    const categoryTools = quickTools.filter(tool => tool.category === category);
    if (activeFilterTag) {
      return categoryTools.filter(tool => tool.tags.includes(activeFilterTag));
    }
    return categoryTools;
  };

  const energyMetrics: EnergyMetric[] = [
    { 
      name: 'Energy Level', 
      value: 85, 
      icon: Battery, 
      trend: 'up', 
      color: 'text-yellow-500',
      description: 'Overall energy based on sleep, nutrition, and activity'
    },
    { 
      name: 'Mental Focus', 
      value: 75, 
      icon: BrainCircuit, 
      trend: 'stable', 
      color: 'text-blue-500',
      description: 'Cognitive performance and concentration level'
    },
    { 
      name: 'Physical Vitality', 
      value: 80, 
      icon: Flame, 
      trend: 'up', 
      color: 'text-orange-500',
      description: 'Physical energy and stamina'
    },
    { 
      name: 'Recovery State', 
      value: 90, 
      icon: Sparkles, 
      trend: 'up', 
      color: 'text-purple-500',
      description: 'Overall recovery and readiness'
    },
  ];

  const wellnessFactors = [
    {
      category: 'Nutrition & Hydration',
      icon: Salad,
      metrics: [
        { name: 'Meal Balance', value: 85, description: 'Balanced nutrition intake' },
        { name: 'Hydration', value: 70, description: 'Daily water intake' },
        { name: 'Supplements', value: 90, description: 'Supplement compliance' },
      ]
    },
    {
      category: 'Physical Activity',
      icon: Dumbbell,
      metrics: [
        { name: 'Daily Movement', value: 75, description: 'Steps and activity' },
        { name: 'Exercise Intensity', value: 65, description: 'Workout effectiveness' },
        { name: 'Recovery Score', value: 80, description: 'Physical recovery' },
      ]
    },
    {
      category: 'Mental Wellness',
      icon: Brain,
      metrics: [
        { name: 'Stress Level', value: 30, description: 'Mental pressure' },
        { name: 'Mood Score', value: 85, description: 'Emotional state' },
        { name: 'Focus Duration', value: 75, description: 'Deep work time' },
      ]
    },
    {
      category: 'Sleep Quality',
      icon: Moon,
      metrics: [
        { name: 'Sleep Duration', value: 90, description: '7.5 hours' },
        { name: 'Deep Sleep', value: 85, description: '2.1 hours' },
        { name: 'Sleep Consistency', value: 80, description: 'Regular schedule' },
      ]
    },
  ];

  const circadianMetrics = [
    { time: '6:00', activity: 'Wake Up', icon: Sun, level: 60 },
    { time: '8:00', activity: 'Peak Focus', icon: Brain, level: 85 },
    { time: '12:00', activity: 'Exercise', icon: Dumbbell, level: 90 },
    { time: '15:00', activity: 'Creative Work', icon: Lightbulb, level: 75 },
    { time: '18:00', activity: 'Recovery', icon: Battery, level: 65 },
    { time: '22:00', activity: 'Wind Down', icon: Moon, level: 40 },
  ];

  const togglePinTool = (toolId: string) => {
    setQuickTools(tools =>
      tools.map(tool =>
        tool.id === toolId ? { ...tool, pinned: !tool.pinned } : tool
      )
    );
  };

  const handleTagFilter = (tag: string) => {
    setActiveFilterTag(current => current === tag ? null : tag);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Energy Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {energyMetrics.map((metric) => (
          <Card key={metric.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.name}
              </CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={metric.value} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {metric.description}
                </p>
                <div className="flex items-center text-xs">
                  <span className={metric.trend === 'up' ? 'text-green-500' : metric.trend === 'down' ? 'text-red-500' : 'text-yellow-500'}>
                    {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'} {metric.trend}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Energy Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Energy Trends</CardTitle>
          <CardDescription>Your energy and focus patterns over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <EnergyChart />
          </div>
        </CardContent>
      </Card>

      {/* Quick Access Tools */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Quick Access Tools</CardTitle>
              <CardDescription>Your personalized wellness toolkit</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Tags className="h-4 w-4 mr-2" />
                Categories
              </Button>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Customize
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tag filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setActiveFilterTag(null)}
              className={!activeFilterTag ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
            >
              <Filter className="h-3 w-3 mr-1" />
              All
            </Button>
            {allTags.map(tag => (
              <Button 
                key={tag} 
                variant="outline" 
                size="sm"
                onClick={() => handleTagFilter(tag)}
                className={activeFilterTag === tag ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
              >
                {tag}
              </Button>
            ))}
          </div>

          <Tabs defaultValue="pinned" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pinned">Pinned</TabsTrigger>
              <TabsTrigger value="focus">Focus</TabsTrigger>
              <TabsTrigger value="mental">Mental</TabsTrigger>
              <TabsTrigger value="physical">Physical</TabsTrigger>
              <TabsTrigger value="all">All Tools</TabsTrigger>
            </TabsList>
            <TabsContent value="pinned">
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex space-x-4">
                  {quickTools.filter(tool => tool.pinned && (activeFilterTag ? tool.tags.includes(activeFilterTag) : true)).map((tool) => (
                    <Link to={tool.href} key={tool.id}>
                      <Card className="inline-block w-[180px] hover:bg-accent cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <tool.icon className="h-4 w-4 text-muted-foreground" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              togglePinTool(tool.id);
                            }}
                          >
                            <Pin className={`h-4 w-4 ${tool.pinned ? 'text-primary' : 'text-muted-foreground'}`} />
                          </Button>
                        </CardHeader>
                        <CardContent>
                          <h4 className="text-sm font-medium">{tool.name}</h4>
                          <p className="text-xs text-muted-foreground">{tool.category}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {tool.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </TabsContent>
            <TabsContent value="focus">
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex space-x-4">
                  {getFilteredTools('Focus').map((tool) => (
                    <Link to={tool.href} key={tool.id}>
                      <Card className="inline-block w-[180px] hover:bg-accent cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <tool.icon className="h-4 w-4 text-muted-foreground" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              togglePinTool(tool.id);
                            }}
                          >
                            <Pin className={`h-4 w-4 ${tool.pinned ? 'text-primary' : 'text-muted-foreground'}`} />
                          </Button>
                        </CardHeader>
                        <CardContent>
                          <h4 className="text-sm font-medium">{tool.name}</h4>
                          <p className="text-xs text-muted-foreground">{tool.category}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {tool.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </TabsContent>
            <TabsContent value="mental">
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex space-x-4">
                  {getFilteredTools('Mental Health').map((tool) => (
                    <Link to={tool.href} key={tool.id}>
                      <Card className="inline-block w-[180px] hover:bg-accent cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <tool.icon className="h-4 w-4 text-muted-foreground" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              togglePinTool(tool.id);
                            }}
                          >
                            <Pin className={`h-4 w-4 ${tool.pinned ? 'text-primary' : 'text-muted-foreground'}`} />
                          </Button>
                        </CardHeader>
                        <CardContent>
                          <h4 className="text-sm font-medium">{tool.name}</h4>
                          <p className="text-xs text-muted-foreground">{tool.category}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {tool.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </TabsContent>
            <TabsContent value="physical">
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex space-x-4">
                  {getFilteredTools('Exercise').map((tool) => (
                    <Link to={tool.href} key={tool.id}>
                      <Card className="inline-block w-[180px] hover:bg-accent cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <tool.icon className="h-4 w-4 text-muted-foreground" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              togglePinTool(tool.id);
                            }}
                          >
                            <Pin className={`h-4 w-4 ${tool.pinned ? 'text-primary' : 'text-muted-foreground'}`} />
                          </Button>
                        </CardHeader>
                        <CardContent>
                          <h4 className="text-sm font-medium">{tool.name}</h4>
                          <p className="text-xs text-muted-foreground">{tool.category}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {tool.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </TabsContent>
            <TabsContent value="all">
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex space-x-4">
                  {quickTools.filter(tool => activeFilterTag ? tool.tags.includes(activeFilterTag) : true).map((tool) => (
                    <Link to={tool.href} key={tool.id}>
                      <Card className="inline-block w-[180px] hover:bg-accent cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <tool.icon className="h-4 w-4 text-muted-foreground" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              togglePinTool(tool.id);
                            }}
                          >
                            <Pin className={`h-4 w-4 ${tool.pinned ? 'text-primary' : 'text-muted-foreground'}`} />
                          </Button>
                        </CardHeader>
                        <CardContent>
                          <h4 className="text-sm font-medium">{tool.name}</h4>
                          <p className="text-xs text-muted-foreground">{tool.category}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {tool.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Wellness Factors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {wellnessFactors.map((factor) => (
          <Card key={factor.category}>
            <CardHeader className="flex flex-row items-center space-x-2">
              <factor.icon className="h-5 w-5" />
              <CardTitle>{factor.category}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {factor.metrics.map((metric) => (
                <div key={metric.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{metric.name}</span>
                    <span>{metric.value}%</span>
                  </div>
                  <Progress value={metric.value} className="h-2" />
                  <p className="text-xs text-muted-foreground">{metric.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Circadian Rhythm */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Energy Pattern</CardTitle>
          <CardDescription>Your optimal times for different activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 overflow-x-auto pb-4">
            {circadianMetrics.map((metric, index) => (
              <div key={index} className="flex flex-col items-center space-y-2 min-w-[100px]">
                <metric.icon className={`h-8 w-8 ${metric.level > 80 ? 'text-green-500' : metric.level > 60 ? 'text-yellow-500' : 'text-blue-500'}`} />
                <div className="text-sm font-medium">{metric.time}</div>
                <div className="text-xs text-muted-foreground">{metric.activity}</div>
                <Progress value={metric.level} className="h-1 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Settings Button */}
      <div className="flex justify-end">
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Customize Dashboard
        </Button>
      </div>
    </div>
  );
};
