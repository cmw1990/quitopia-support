import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SUPABASE_URL, SUPABASE_KEY } from "@/integrations/supabase/db-client";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Trophy, Activity, Users, Clock, Heart, MessageCircle, AlertCircle, Gift, Flame, Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { differenceInDays, formatDistanceToNow, format, addDays } from "date-fns";
import { WithdrawalTracker } from "@/components/sobriety/WithdrawalTracker";
import { TriggerPatternAnalysis } from "@/components/sobriety/TriggerPatternAnalysis";
import { MoneySaved } from "@/components/sobriety/MoneySaved";
import { HealthImprovements } from "@/components/sobriety/HealthImprovements";

// The achievable badges for sobriety
const ACHIEVEMENT_BADGES = [
  { id: "first_day", name: "First Day", description: "Completed your first day smoke-free", days: 1, icon: <Star className="h-4 w-4 text-yellow-500" /> },
  { id: "first_week", name: "First Week", description: "One full week without smoking", days: 7, icon: <Star className="h-4 w-4 text-yellow-500" /> },
  { id: "two_weeks", name: "Fortnight", description: "Two weeks smoke-free", days: 14, icon: <Star className="h-4 w-4 text-purple-500" /> },
  { id: "one_month", name: "One Month", description: "A full month of freedom", days: 30, icon: <Trophy className="h-4 w-4 text-amber-500" /> },
  { id: "hundred_days", name: "Century", description: "100 days smoke-free", days: 100, icon: <Trophy className="h-4 w-4 text-amber-500" /> },
  { id: "half_year", name: "Half Year", description: "Six months without smoking", days: 180, icon: <Trophy className="h-4 w-4 text-emerald-500" /> },
  { id: "one_year", name: "First Anniversary", description: "One full year smoke-free!", days: 365, icon: <Gift className="h-4 w-4 text-blue-500" /> },
];

// Health milestones based on science
const HEALTH_MILESTONES = [
  { days: 0.08, description: "Heart rate and blood pressure begin to drop." },
  { days: 1, description: "Carbon monoxide levels in blood drop to normal." },
  { days: 2, description: "Smell and taste receptors begin to heal, making food more enjoyable." },
  { days: 3, description: "Breathing becomes easier as bronchial tubes relax." },
  { days: 14, description: "Circulation improves and lung function increases." },
  { days: 30, description: "Cilia in lungs regrow, reducing risk of infection." },
  { days: 90, description: "Risk of heart attack begins to decrease." },
  { days: 180, description: "Lung function continues to improve." },
  { days: 270, description: "Shortness of breath decreases and overall energy improves." },
  { days: 365, description: "Risk of coronary heart disease is cut in half." },
  { days: 1825, description: "Risk of stroke reduced to that of a nonsmoker." },
  { days: 3650, description: "Risk of lung cancer drops to 50% of a smoker's." },
  { days: 5475, description: "Risk of heart disease equal to someone who never smoked." },
];

// Common withdrawal symptoms
const WITHDRAWAL_SYMPTOMS = [
  "Irritability",
  "Anxiety",
  "Difficulty concentrating",
  "Increased appetite",
  "Restlessness",
  "Trouble sleeping",
  "Intense cravings",
  "Headaches",
  "Fatigue",
  "Sweating",
];

export default function SmokeFree() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Fetch current quit attempt using SSOT8001 compliant direct REST API call
  const { data: quitAttempts, isLoading: isLoadingQuitAttempts } = useQuery({
    queryKey: ['quitAttempts'],
    queryFn: async () => {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/quit_attempts8?user_id=eq.${session?.user?.id}&order=created_at.desc`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session?.access_token}`
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || response.statusText);
      }

      return await response.json();
    },
    enabled: !!session?.user?.id,
  });

  // Fetch milestones using SSOT8001 compliant direct REST API call
  const { data: milestones, isLoading: isLoadingMilestones } = useQuery({
    queryKey: ['milestones'],
    queryFn: async () => {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/recovery_milestones8?user_id=eq.${session?.user?.id}&order=achieved_at.desc&limit=10`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session?.access_token}`
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || response.statusText);
      }

      return await response.json();
    },
    enabled: !!session?.user?.id,
  });

  // Mutation to log a new milestone achievement
  const logMilestone = useMutation({
    mutationFn: async (milestoneData: {
      milestoneType: string;
      daysSmokesFree: number;
      healthImprovements: string[];
      celebrationNotes: string;
    }) => {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/recovery_milestones8`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${session?.access_token}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          user_id: session?.user?.id,
          milestone_type: milestoneData.milestoneType,
          days_smoke_free: milestoneData.daysSmokesFree,
          health_improvements: milestoneData.healthImprovements,
          celebration_notes: milestoneData.celebrationNotes,
          achieved_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || response.statusText);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      toast({
        title: "Success",
        description: "Recovery milestone logged!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to log milestone: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Get the current active quit attempt
  const currentQuitAttempt = quitAttempts && quitAttempts.length > 0 ? quitAttempts[0] : null;

  // Calculate days since quit
  const getDaysSinceQuit = () => {
    if (!currentQuitAttempt?.start_date) return 0;
    return differenceInDays(new Date(), new Date(currentQuitAttempt.start_date));
  };

  // Calculate money saved
  const getMoneySaved = () => {
    const days = getDaysSinceQuit();
    const dailyCost = currentQuitAttempt?.daily_cost || 0;
    return (days * dailyCost).toFixed(2);
  };

  // Get earned achievement badges based on days quit
  const getEarnedBadges = () => {
    const daysSince = getDaysSinceQuit();
    return ACHIEVEMENT_BADGES.filter(badge => daysSince >= badge.days);
  };

  // Get upcoming badges
  const getUpcomingBadges = () => {
    const daysSince = getDaysSinceQuit();
    return ACHIEVEMENT_BADGES.filter(badge => daysSince < badge.days)
      .sort((a, b) => a.days - b.days)
      .slice(0, 3);
  };

  // Get upcoming health milestones
  const getUpcomingMilestones = () => {
    const daysSinceQuit = getDaysSinceQuit();
    return HEALTH_MILESTONES
      .filter(milestone => milestone.days > daysSinceQuit)
      .sort((a, b) => a.days - b.days)
      .slice(0, 3)
      .map(milestone => ({
        ...milestone,
        daysUntil: milestone.days - daysSinceQuit,
        date: addDays(new Date(currentQuitAttempt?.start_date || new Date()), milestone.days)
      }));
  };

  // Generate withdrawal timeline based on start date
  const getWithdrawalTimeline = () => {
    if (!currentQuitAttempt?.start_date) return [];
    
    return [
      { day: 1, symptoms: ["Irritability", "Anxiety", "Intense cravings"], severity: "High" },
      { day: 3, symptoms: ["Headaches", "Increased appetite", "Trouble sleeping"], severity: "High" },
      { day: 5, symptoms: ["Irritability", "Fatigue", "Difficulty concentrating"], severity: "Medium" },
      { day: 7, symptoms: ["Cravings", "Restlessness"], severity: "Medium" },
      { day: 14, symptoms: ["Occasional cravings", "Slight irritability"], severity: "Low" },
      { day: 30, symptoms: ["Rare cravings in trigger situations"], severity: "Low" },
    ];
  };

  // Effect to check for unlocked badges that need to be logged as milestones
  useEffect(() => {
    if (!currentQuitAttempt?.start_date || !milestones) return;
    
    const daysSinceQuit = getDaysSinceQuit();
    
    // Find badges that should be unlocked but aren't in milestones
    const earnedBadges = ACHIEVEMENT_BADGES.filter(badge => daysSinceQuit >= badge.days);
    const loggedMilestoneTypes = milestones.map(m => m.milestone_type);
    
    // Find first unlogged badge that should be earned
    const unloggedBadge = earnedBadges.find(badge => 
      !loggedMilestoneTypes.includes(badge.id)
    );
    
    if (unloggedBadge) {
      // Auto-log the milestone
      logMilestone({
        milestoneType: unloggedBadge.id,
        daysSmokesFree: daysSinceQuit,
        healthImprovements: [],
        celebrationNotes: `Automatically logged ${unloggedBadge.name} achievement`
      });
      
      // Show toast notification for achievement
      toast({
        title: "Achievement Unlocked!",
        description: `${unloggedBadge.name}: ${unloggedBadge.description}`,
      });
    }
  }, [currentQuitAttempt, milestones, getDaysSinceQuit]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Smoke-Free Journey</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/cravings')}>
            Manage Cravings
          </Button>
          <Button onClick={() => navigate('/quit-plan')}>
            View Quit Plan
          </Button>
        </div>
      </div>

      {!currentQuitAttempt ? (
        <Card className="text-center py-10">
          <CardHeader>
            <CardTitle className="text-xl">Start Your Quit Journey</CardTitle>
            <CardDescription>
              You haven't created a quit plan yet. Create one to track your progress!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="max-w-lg mx-auto">
              Begin your journey toward a tobacco-free life. Our app helps you track progress, manage cravings, celebrate milestones, and see health improvements in real time.
            </p>
            <Button onClick={() => navigate('/quit-plan')}>
              Create Quit Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Smoke-Free Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {getDaysSinceQuit()} days
                </div>
                <p className="text-muted-foreground">
                  Since {format(new Date(currentQuitAttempt.start_date), 'MMM d, yyyy')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Current Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold text-orange-500">
                    {getDaysSinceQuit()} days
                  </div>
                  <Flame className="h-6 w-6 text-orange-500" />
                </div>
                <Progress value={getDaysSinceQuit() % 7 * (100/7)} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {7 - (getDaysSinceQuit() % 7)} days until next weekly milestone
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Next Health Milestone
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getUpcomingMilestones().length > 0 ? (
                  <>
                    <div className="text-md font-medium">
                      {getUpcomingMilestones()[0]?.description}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      in {getUpcomingMilestones()[0]?.daysUntil} days
                      <span className="block">
                        {format(getUpcomingMilestones()[0]?.date, 'MMM d, yyyy')}
                      </span>
                    </p>
                  </>
                ) : (
                  <p className="text-muted-foreground">
                    You've reached all tracked health milestones!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="withdrawal">Withdrawal</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="support">Support</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      Recent Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-2 flex-wrap">
                        {getEarnedBadges().slice(0, 5).map((badge) => (
                          <TooltipProvider key={badge.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className="flex items-center gap-1 p-1.5">
                                  {badge.icon}
                                  <span>{badge.name}</span>
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{badge.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                        
                        {getEarnedBadges().length === 0 && (
                          <p className="text-muted-foreground">
                            Keep going! You'll earn your first badge after 24 hours.
                          </p>
                        )}
                      </div>
                      
                      {getEarnedBadges().length > 0 && (
                        <div className="pt-2">
                          <div className="text-sm font-medium">Upcoming achievements</div>
                          {getUpcomingBadges().map((badge) => (
                            <div key={badge.id} className="flex justify-between items-center text-sm mt-1">
                              <span className="flex items-center gap-1">
                                {badge.icon} {badge.name}
                              </span>
                              <span className="text-muted-foreground">
                                in {badge.days - getDaysSinceQuit()} days
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <MoneySaved 
                  daysSinceQuit={getDaysSinceQuit()} 
                  dailyCost={currentQuitAttempt.daily_cost || 0} 
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <TriggerPatternAnalysis />
                <HealthImprovements daysSinceQuit={getDaysSinceQuit()} />
              </div>
            </TabsContent>
            
            <TabsContent value="withdrawal">
              <WithdrawalTracker 
                startDate={currentQuitAttempt.start_date}
                daysSinceQuit={getDaysSinceQuit()}
                withdrawalTimeline={getWithdrawalTimeline()}
              />
            </TabsContent>
            
            <TabsContent value="achievements">
              <Card>
                <CardHeader>
                  <CardTitle>Your Smoke-Free Achievements</CardTitle>
                  <CardDescription>
                    Track your journey and celebrate your success
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-3">
                    {ACHIEVEMENT_BADGES.map((badge) => {
                      const isEarned = getDaysSinceQuit() >= badge.days;
                      return (
                        <Card key={badge.id} className={`overflow-hidden ${isEarned ? 'border-amber-200 bg-amber-50/30' : 'opacity-70'}`}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                              {badge.icon}
                              {badge.name}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <p className="text-sm">{badge.description}</p>
                          </CardContent>
                          <CardFooter className="pt-0">
                            {isEarned ? (
                              <Badge className="bg-green-600">
                                Achieved!
                              </Badge>
                            ) : (
                              <p className="text-xs text-muted-foreground">
                                In {badge.days - getDaysSinceQuit()} days
                              </p>
                            )}
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="support">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Community Support
                    </CardTitle>
                    <CardDescription>
                      Connect with others on the same journey
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-3 border rounded-md">
                        <Avatar>
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">Join the Quit Smoking Forum</p>
                          <p className="text-sm text-muted-foreground">Share experiences and get advice</p>
                        </div>
                        <Button variant="secondary" className="ml-auto" size="sm">
                          Join
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-4 p-3 border rounded-md">
                        <Avatar>
                          <AvatarFallback>GS</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">Find a Quit Buddy</p>
                          <p className="text-sm text-muted-foreground">Get matched with someone at a similar stage</p>
                        </div>
                        <Button variant="secondary" className="ml-auto" size="sm">
                          Find
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Crisis Support
                    </CardTitle>
                    <CardDescription>
                      Help when you need it most
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>If you're having strong cravings or feeling like you might relapse:</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between p-2 border rounded-md">
                        <span className="font-medium">Quitline</span>
                        <span className="text-blue-600">1-800-QUIT-NOW</span>
                      </div>
                      
                      <div className="flex justify-between p-2 border rounded-md">
                        <span className="font-medium">Text Support</span>
                        <span className="text-blue-600">Text "QUIT" to 47848</span>
                      </div>
                      
                      <Link to="/cravings">
                        <Button variant="default" className="w-full mt-2">
                          Use Craving Tools
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
