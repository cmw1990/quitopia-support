import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { PageHeader } from '../components/ui/page-header';
import { AntiFatigueProvider } from '../components/fatigue/AntiFatigueContext';
import { FatigueTracker } from '../components/fatigue/FatigueTracker';
import { FatigueReport } from '../components/fatigue/FatigueReport';
import { FatigueTypes, FatigueTypesGrid } from '../components/fatigue/FatigueTypes';
import { FatigueStrategyLibrary } from '../components/fatigue/FatigueStrategyLibrary';
import { FatigueAssistant } from '../components/fatigue/FatigueAssistant';
import { FatigueScheduler } from '../components/fatigue/FatigueScheduler';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Brain, Calendar, Info, PieChart, ThumbsUp, Zap, BatteryCharging, Clock, Wrench, Shield, Coffee, Activity, Flame, Battery } from 'lucide-react';
import { FatigueAlarm } from '../components/fatigue/FatigueAlarm';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { PageTitle } from '../components/PageTitle';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function AntiFatigue() {
  return (
    <div className="container py-6 space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <PageTitle title="Anti-Fatigue Tools" />
        
        <Card className="border-none shadow-sm bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="relative w-32 h-32 flex-shrink-0">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute inset-0 bg-purple-100 dark:bg-purple-900/20 rounded-full animate-ping opacity-50" style={{ animationDuration: '3s', animationIterationCount: 'infinite' }}></div>
                  <div className="absolute inset-6 bg-purple-200 dark:bg-purple-800/30 rounded-full"></div>
                  <Activity className="h-12 w-12 text-purple-600 dark:text-purple-400 z-10" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Combat Fatigue & Maintain Focus</h2>
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
                  Our comprehensive anti-fatigue tools help you identify, track, and manage different types of fatigue that impact your focus and productivity. Learn personalized strategies based on your specific fatigue patterns.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">
                    <Brain className="h-3 w-3 mr-1" /> Mental Fatigue
                  </Badge>
                  <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">
                    <Battery className="h-3 w-3 mr-1" /> Physical Fatigue
                  </Badge>
                  <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">
                    <Coffee className="h-3 w-3 mr-1" /> Attention Fatigue
                  </Badge>
                  <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">
                    <Flame className="h-3 w-3 mr-1" /> Emotional Fatigue
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      <AntiFatigueProvider>
        <Tabs defaultValue="track" className="space-y-6">
          <TabsList className="grid grid-cols-4 md:w-[500px]">
            <TabsTrigger value="track" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Track</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
            <TabsTrigger value="learn" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              <span className="hidden sm:inline">Learn</span>
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              <span className="hidden sm:inline">Tools</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Track Fatigue Tab */}
          <motion.div {...fadeIn}>
            <TabsContent value="track" className="space-y-6">
              <FatigueTracker />
            </TabsContent>
          </motion.div>
          
          {/* Insights Tab */}
          <motion.div {...fadeIn}>
            <TabsContent value="insights" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FatigueReport />
                <FatigueAssistant />
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BatteryCharging className="h-5 w-5 text-primary" />
                    Energy & Fatigue Connection
                  </CardTitle>
                  <CardDescription>
                    Understanding how energy levels and fatigue are related
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p>
                      Fatigue and energy are two sides of the same coin. By tracking both, 
                      you can better understand your body's patterns and optimize your daily routine.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <Card className="p-4">
                        <h3 className="font-medium text-sm flex items-center gap-2 mb-2">
                          <Brain className="h-4 w-4 text-primary" />
                          Fatigue Insights
                        </h3>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Understand your fatigue patterns</li>
                          <li>• Identify contributing factors</li>
                          <li>• Learn personalized management strategies</li>
                          <li>• Prevent burnout and exhaustion</li>
                        </ul>
                      </Card>
                      
                      <Card className="p-4">
                        <h3 className="font-medium text-sm flex items-center gap-2 mb-2">
                          <BatteryCharging className="h-4 w-4 text-primary" />
                          Energy Insights
                        </h3>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Track your energy throughout the day</li>
                          <li>• Identify your peak performance times</li>
                          <li>• Schedule important tasks optimally</li>
                          <li>• Understand energy fluctuations</li>
                        </ul>
                      </Card>
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-md">
                    <h3 className="font-medium mb-2 flex items-center">
                      <Info className="h-4 w-4 mr-2 text-primary" />
                      Did you know?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      People with ADHD often experience more significant energy fluctuations throughout 
                      the day. By understanding your unique patterns, you can better manage both focus and fatigue.
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline">
                    <Link to="/energy">
                      <BatteryCharging className="mr-2 h-4 w-4" />
                      Go to Energy Management
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </motion.div>
          
          {/* Learn Tab */}
          <motion.div {...fadeIn}>
            <TabsContent value="learn" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FatigueTypesGrid />
                <FatigueStrategyLibrary />
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Understanding Fatigue Types
                  </CardTitle>
                  <CardDescription>
                    Learn about different types of fatigue and how they affect you
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground">
                    Recognizing the different types of fatigue can help you manage your energy more effectively.
                    Below are the four main types of fatigue that can affect your focus and productivity.
                  </p>
                  
                  <FatigueTypesGrid />
                  
                  <div className="pt-4 border-t">
                    <h3 className="font-medium mb-4">Fatigue Management Strategies</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            <ThumbsUp className="h-4 w-4 text-primary" />
                            Do's
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="list-disc pl-5 space-y-2 text-sm">
                            <li>Track your fatigue levels daily to identify patterns</li>
                            <li>Take regular breaks using techniques like Pomodoro</li>
                            <li>Stay hydrated and maintain regular meal times</li>
                            <li>Practice deep breathing or meditation to reset</li>
                            <li>Get 7-9 hours of quality sleep each night</li>
                            <li>Use noise-cancelling headphones for sensory relief</li>
                            <li>Schedule demanding tasks during your peak energy hours</li>
                          </ul>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            <ThumbsUp className="h-4 w-4 text-destructive rotate-180" />
                            Don'ts
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="list-disc pl-5 space-y-2 text-sm">
                            <li>Don't ignore early warning signs of fatigue</li>
                            <li>Avoid caffeine late in the day (after 2pm)</li>
                            <li>Don't try to push through extreme fatigue</li>
                            <li>Avoid back-to-back high-intensity meetings</li>
                            <li>Don't skip meals or rely on sugar for energy boosts</li>
                            <li>Avoid bright screens at least 1 hour before bed</li>
                            <li>Don't neglect physical activity even when tired</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </motion.div>
          
          {/* Tools Tab */}
          <motion.div {...fadeIn}>
            <TabsContent value="tools" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FatigueScheduler />
                <FatigueAlarm />
              </div>
            </TabsContent>
          </motion.div>
        </Tabs>
      </AntiFatigueProvider>
    </div>
  );
} 