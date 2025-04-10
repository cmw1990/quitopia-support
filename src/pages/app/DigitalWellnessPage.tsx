import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabaseRequest } from '@/lib/supabase';
import { Brain, Eye, Timer, Moon, Sun, Activity, HeartPulse, BookOpen, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

interface ScreenTimeData {
  date: string;
  totalMinutes: number;
  focusMinutes: number;
  breakMinutes: number;
}

interface WellnessTip {
  id: string;
  title: string;
  description: string;
  category: 'focus' | 'sleep' | 'health' | 'mindfulness';
  icon: string;
}

const wellnessTips: WellnessTip[] = [
  {
    id: '1',
    title: '20-20-20 Rule',
    description: 'Every 20 minutes, look at something 20 feet away for 20 seconds to reduce eye strain.',
    category: 'health',
    icon: 'Eye'
  },
  {
    id: '2',
    title: 'Digital Sunset',
    description: 'Stop using blue-light emitting devices 2 hours before bedtime for better sleep quality.',
    category: 'sleep',
    icon: 'Moon'
  },
  {
    id: '3',
    title: 'Mindful Browsing',
    description: 'Before opening social media, take a deep breath and set an intention for your visit.',
    category: 'mindfulness',
    icon: 'Brain'
  },
  {
    id: '4',
    title: 'Movement Breaks',
    description: 'Take short walks or do stretches every hour to maintain physical health.',
    category: 'health',
    icon: 'Activity'
  }
];

const DigitalWellnessPage: React.FC = () => {
  const { user } = useAuth();
  const [screenTimeData, setScreenTimeData] = useState<ScreenTimeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTip, setSelectedTip] = useState<WellnessTip | null>(null);

  useEffect(() => {
    const fetchScreenTimeData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabaseRequest<ScreenTimeData[]>({
          method: 'GET',
          path: `/screen-time?user_id=eq.${user.id}&order=date.desc&limit=7`,
        });
        
        if (error) throw error;
        setScreenTimeData(data || []);
      } catch (error) {
        console.error('Error fetching screen time data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScreenTimeData();
  }, [user]);

  const calculateDailyAverage = () => {
    if (!screenTimeData.length) return 0;
    const total = screenTimeData.reduce((acc, day) => acc + day.totalMinutes, 0);
    return Math.round(total / screenTimeData.length);
  };

  const calculateFocusRatio = () => {
    if (!screenTimeData.length) return 0;
    const totalMinutes = screenTimeData.reduce((acc, day) => acc + day.totalMinutes, 0);
    const focusMinutes = screenTimeData.reduce((acc, day) => acc + day.focusMinutes, 0);
    return Math.round((focusMinutes / totalMinutes) * 100);
  };

  return (
    <>
      <Helmet>
        <title>Digital Wellness - EasierFocus</title>
        <meta name="description" content="Build healthier digital habits and manage technology use." />
      </Helmet>
      
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Digital Wellness Center</h1>
            <p className="text-muted-foreground">Build healthier digital habits and manage your technology use mindfully.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5" />
                Daily Screen Time
              </CardTitle>
              <CardDescription>Average daily device usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {loading ? '-' : `${calculateDailyAverage()}m`}
              </div>
              <Progress value={Math.min(100, (calculateDailyAverage() / 480) * 100)} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Focus Ratio
              </CardTitle>
              <CardDescription>Percentage of productive screen time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {loading ? '-' : `${calculateFocusRatio()}%`}
              </div>
              <Progress value={calculateFocusRatio()} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HeartPulse className="h-5 w-5" />
                Wellness Score
              </CardTitle>
              <CardDescription>Overall digital wellness rating</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {loading ? '-' : `${Math.round((calculateFocusRatio() + (100 - Math.min(100, (calculateDailyAverage() / 480) * 100))) / 2)}%`}
              </div>
              <Progress 
                value={Math.round((calculateFocusRatio() + (100 - Math.min(100, (calculateDailyAverage() / 480) * 100))) / 2)} 
                className="mt-2" 
              />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="tips" className="w-full">
          <TabsList>
            <TabsTrigger value="tips">Wellness Tips</TabsTrigger>
            <TabsTrigger value="habits">Digital Habits</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="tips" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wellnessTips.map((tip) => (
                <motion.div
                  key={tip.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => setSelectedTip(tip)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {tip.icon === 'Eye' && <Eye className="h-5 w-5" />}
                        {tip.icon === 'Moon' && <Moon className="h-5 w-5" />}
                        {tip.icon === 'Brain' && <Brain className="h-5 w-5" />}
                        {tip.icon === 'Activity' && <Activity className="h-5 w-5" />}
                        {tip.title}
                      </CardTitle>
                      <CardDescription>{tip.category}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{tip.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="habits" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Build Healthy Digital Habits</CardTitle>
                <CardDescription>Track and improve your digital wellness habits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sun className="h-5 w-5" />
                      <span>Morning Digital Routine</span>
                    </div>
                    <Button variant="outline">Set Up</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Moon className="h-5 w-5" />
                      <span>Evening Digital Wind-down</span>
                    </div>
                    <Button variant="outline">Set Up</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Timer className="h-5 w-5" />
                      <span>Screen Time Limits</span>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Digital Wellness Resources</CardTitle>
                <CardDescription>Learn more about maintaining digital wellness</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      <span>Digital Wellness Guide</span>
                    </div>
                    <Button variant="outline">Read</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      <span>Mindful Tech Tips</span>
                    </div>
                    <Button variant="outline">View</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      <span>Movement & Posture Guide</span>
                    </div>
                    <Button variant="outline">Learn</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default DigitalWellnessPage; 