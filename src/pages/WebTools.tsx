import React, { useState, useEffect } from 'react';
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { WebTools } from '../components/WebTools';
import { HealthImprovementTimeline } from '../components/health/HealthImprovementTimeline';
import { StepRewards } from '../components/health/StepRewards';
import { Session } from '@supabase/supabase-js';

// For demo purposes, using a hardcoded session
// In a real implementation, you would use the useSession hook
export default function WebToolsPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [quitDate, setQuitDate] = useState<string | undefined>(undefined);
  
  // For demo, set a quit date
  useEffect(() => {
    setQuitDate('2023-10-15T00:00:00Z');
  }, []);

  return (
    <div className="container max-w-7xl mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Wellness Tools</h1>
        <p className="text-muted-foreground">
          Personalized tools to support your journey to better health
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
          <TabsTrigger value="general">General Wellness</TabsTrigger>
          <TabsTrigger value="health">Health Tracking</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Wellness Tools</CardTitle>
                <CardDescription>
                  Support tools for your journey to being smoke-free
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  These personalized tools can help you manage various aspects of quitting. Generate customized plans based on your specific challenges.
                </p>
                <WebTools session={session} />
              </CardContent>
              <CardFooter>
                {!session && (
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/auth')}
                    className="w-full"
                  >
                    Sign in to save your plans
                  </Button>
                )}
              </CardFooter>
            </Card>
            
            <HealthImprovementTimeline 
              session={session} 
              quitDate={quitDate}
              maxItems={3}
              highlightNext={true}
            />
          </div>
          
          <StepRewards 
            session={session}
            compact={true}
          />
        </TabsContent>
        
        <TabsContent value="health" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 gap-6">
            <HealthImprovementTimeline 
              session={session} 
              quitDate={quitDate}
            />
            
            <StepRewards session={session} />
            
            {!session && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center text-center p-6">
                    <div className="rounded-full bg-primary/10 p-3 mb-4">
                      <svg
                        className="h-6 w-6 text-primary"
                        fill="none"
                        height="24"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        width="24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium">Create an Account for More Features</h3>
                    <p className="text-sm text-muted-foreground mt-2 mb-4">
                      Sign up to track your progress, save your health data, and earn rewards
                    </p>
                    <Button onClick={() => navigate('/auth')}>Sign Up</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="nutrition" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Nutrition Support</CardTitle>
                <CardDescription>
                  Create meal plans to support your journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WebTools session={session} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Hydration Tracker</CardTitle>
                <CardDescription>
                  Track and optimize your water intake
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WebTools session={session} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="community" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Community Support</CardTitle>
                <CardDescription>
                  Connect with others on the same journey
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center text-center p-6">
                  <div className="rounded-full bg-primary/10 p-3 mb-4">
                    <svg
                      className="h-6 w-6 text-primary"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M17 6.1H3" />
                      <path d="M21 12.1H3" />
                      <path d="M15.1 18H3" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium">Community Features Coming Soon</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Join discussion forums, find support groups, and connect with peers on similar journeys.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button disabled className="w-full">Coming Soon</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Share Your Progress</CardTitle>
                <CardDescription>
                  Celebrate milestones with your supportive community
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center text-center p-6">
                  <div className="rounded-full bg-primary/10 p-3 mb-4">
                    <svg
                      className="h-6 w-6 text-primary"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                      <polyline points="16 6 12 2 8 6" />
                      <line x1="12" x2="12" y1="2" y2="15" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium">Social Sharing Coming Soon</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Share your progress, milestones, and achievements with friends and family on social media.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button disabled className="w-full">Coming Soon</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 