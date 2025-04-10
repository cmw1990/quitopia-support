import { useState, useEffect } from "react";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { Brain, Clock, Users } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import { useFocusSession } from "@/hooks/useFocusSession";
import { FocusSession } from "@/api/focusApi";

interface BodyDoublingSession {
  id: string;
  title: string;
  host_id: string;
  start_time: string;
  status: string;
  participant_count?: number;
}

export const FocusSessions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState("");
  
  const { 
    sessions: focusSessions, 
    isLoading, 
    error, 
    startSession,
    endSession 
  } = useFocusSession();
  
  // Convert FocusSession to BodyDoublingSession for display
  const activeSessions = focusSessions?.filter(session => 
    session.status === "active"
  ).map(session => ({
    id: session.id,
    title: `Focus Session ${new Date(session.start_time).toLocaleDateString()}`,
    host_id: session.user_id,
    start_time: session.start_time,
    status: session.status,
    participant_count: 1  // Default to 1 participant (the user)
  })) || [];

  useEffect(() => {
    if (user) {
      checkAndCelebrateStreaks();
    }
  }, [user, focusSessions]);

  const checkAndCelebrateStreaks = async () => {
    if (!user) return;

    try {
      // This would typically come from your database
      const hasStreak = Math.random() > 0.7; // 30% chance to show streak celebration
      
      if (hasStreak) {
        const streakCount = Math.floor(Math.random() * 10) + 5;
        setCelebrationMessage(`🎉 Amazing! You've maintained a ${streakCount} day focus streak!`);
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 5000);
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  const joinBodyDoublingSession = async (sessionId: string) => {
    if (!user) return;

    try {
      // In a real app, you would make an API call to join the session
      // Instead of using console.log, use toast to notify the user
      toast({
        title: "Joined session",
        description: "You've successfully joined the body doubling session"
      });
    } catch (error) {
      console.error('Error joining session:', error);
      toast({
        title: "Error joining session",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };
  
  const handleStartNewSession = () => {
    if (!user) return;
    
    startSession();
    toast({
      title: "Session started",
      description: "Your focus session has been created"
    });
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading sessions...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">Error loading sessions</p>
        <Button onClick={() => window.location.reload()} className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto space-y-8 p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-full">
          <Brain className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">
          Focus Dashboard
        </h1>
      </div>

      {showCelebration && (
        <Card className="p-4 bg-gradient-to-r from-yellow-500/20 to-purple-500/20 border-2 border-yellow-500/50">
          <div className="flex items-center justify-center text-center">
            <p className="text-lg font-semibold">{celebrationMessage}</p>
          </div>
        </Card>
      )}

      <Tabs defaultValue="sessions" className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Body Doubling
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Session History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="sessions">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeSessions.map(session => (
              <Card key={session.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50 pb-2">
                  <CardTitle className="text-md font-medium">{session.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center text-sm text-muted-foreground mb-3">
                    <span>
                      {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span>{session.participant_count} participants</span>
                  </div>
                  <Button 
                    onClick={() => joinBodyDoublingSession(session.id)}
                    className="w-full"
                  >
                    Join Session
                  </Button>
                </CardContent>
              </Card>
            ))}
            
            {activeSessions.length === 0 && (
              <Card className="col-span-full p-8 text-center">
                <p className="text-muted-foreground mb-4">No active body doubling sessions at the moment.</p>
                <Button onClick={handleStartNewSession}>Start Your Own Session</Button>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Session History</CardTitle>
            </CardHeader>
            <CardContent>
              {focusSessions && focusSessions.filter(session => session.status !== "active").length > 0 ? (
                <div className="grid gap-4">
                  {focusSessions
                    .filter(session => session.status !== "active")
                    .slice(0, 5)
                    .map(session => (
                      <div key={session.id} className="border-b pb-2 last:border-0">
                        <p className="font-medium">Focus Session {new Date(session.start_time).toLocaleDateString()}</p>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{new Date(session.start_time).toLocaleDateString()}</span>
                          <span>{session.status}</span>
                        </div>
                      </div>
                    ))
                  }
                </div>
              ) : (
                <p className="text-muted-foreground">Your past focus sessions will appear here.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 