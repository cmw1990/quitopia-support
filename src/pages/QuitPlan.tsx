import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SUPABASE_URL, SUPABASE_KEY } from "@/integrations/supabase/db-client";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Calendar, CigaretteOff, DollarSign, Heart, ArrowUpRight, Brain, Clock, Zap, Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow, format, differenceInDays, addDays } from "date-fns";

// Health recovery milestones based on scientific research
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

export default function QuitPlan() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [targetDate, setTargetDate] = useState("");
  const [initialUsage, setInitialUsage] = useState("");
  const [dailyCost, setDailyCost] = useState("");
  const [targetUsage, setTargetUsage] = useState("");
  const [strategy, setStrategy] = useState<"cold_turkey" | "taper_down" | "nrt_assisted" | "harm_reduction">("taper_down");
  const [productType, setProductType] = useState("cigarette");
  const [triggers, setTriggers] = useState<string[]>([]);
  const [reasons, setReasons] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("create");

  // Common triggers for smoking
  const COMMON_TRIGGERS = [
    { id: "stress", label: "Stress & Anxiety" },
    { id: "social", label: "Social Situations" },
    { id: "boredom", label: "Boredom" },
    { id: "alcohol", label: "After Alcohol" },
    { id: "meals", label: "After Meals" },
    { id: "morning", label: "Morning Routine" },
    { id: "driving", label: "While Driving" },
    { id: "breaks", label: "Work Breaks" },
  ];

  // Common reasons for quitting
  const COMMON_REASONS = [
    { id: "health", label: "Improve Health" },
    { id: "family", label: "For Family/Children" },
    { id: "money", label: "Save Money" },
    { id: "freedom", label: "Break Addiction" },
    { id: "smell", label: "Improve Smell/Taste" },
    { id: "appearance", label: "Better Appearance" },
    { id: "fitness", label: "Improve Fitness" },
    { id: "example", label: "Set Good Example" },
  ];

  // Nicotine product types
  const PRODUCT_TYPES = [
    { value: "cigarette", label: "Cigarettes" },
    { value: "vape", label: "Vape/E-cigarette" },
    { value: "cigar", label: "Cigars" },
    { value: "smokeless", label: "Smokeless Tobacco" },
    { value: "pipe", label: "Pipe Tobacco" },
    { value: "multiple", label: "Multiple Products" },
  ];

  // Fetch current quit plan using SSOT8001 compliant direct REST API call
  const { data: currentPlan, isLoading: isLoadingPlan } = useQuery({
    queryKey: ['quit-plan'],
    queryFn: async () => {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/quit_attempts8?user_id=eq.${session?.user?.id}&order=created_at.desc&limit=1`,
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

      const data = await response.json();
      return data[0] || null;
    },
    enabled: !!session?.user?.id,
  });

  // Create a new quit plan with direct REST API call (SSOT8001 compliant)
  const createPlan = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/quit_attempts8`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${session?.access_token}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          user_id: session?.user?.id,
          substance_type: productType,
          start_date: new Date().toISOString(),
          daily_cost: parseFloat(dailyCost) || 0,
          notes: JSON.stringify({
            initialUsage,
            targetUsage,
            strategy,
            targetDate,
            triggers,
            reasons
          }),
          created_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || response.statusText);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quit-plan'] });
      toast({
        title: "Quit Plan Created",
        description: "Your personalized quit plan has been saved!",
      });
      setActiveTab("view");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create quit plan: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Effect to set form values from existing plan
  useEffect(() => {
    if (currentPlan) {
      try {
        const notes = JSON.parse(currentPlan.notes || "{}");
        if (notes.initialUsage) setInitialUsage(notes.initialUsage);
        if (notes.targetUsage) setTargetUsage(notes.targetUsage);
        if (notes.strategy) setStrategy(notes.strategy);
        if (notes.targetDate) setTargetDate(notes.targetDate);
        if (notes.triggers) setTriggers(notes.triggers);
        if (notes.reasons) setReasons(notes.reasons);
        if (currentPlan.substance_type) setProductType(currentPlan.substance_type);
        if (currentPlan.daily_cost) setDailyCost(currentPlan.daily_cost.toString());
      } catch (e) {
        console.error("Error parsing plan notes:", e);
      }
    }
  }, [currentPlan]);

  // Calculate days since quit date
  const getDaysSinceQuit = () => {
    if (!currentPlan?.start_date) return 0;
    return differenceInDays(new Date(), new Date(currentPlan.start_date));
  };

  // Calculate money saved
  const getMoneySaved = () => {
    const days = getDaysSinceQuit();
    const dailyCostNum = currentPlan?.daily_cost || 0;
    return (days * dailyCostNum).toFixed(2);
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
        date: addDays(new Date(currentPlan?.start_date || new Date()), milestone.days)
      }));
  };

  // Get achieved health milestones
  const getAchievedMilestones = () => {
    const daysSinceQuit = getDaysSinceQuit();
    return HEALTH_MILESTONES
      .filter(milestone => milestone.days <= daysSinceQuit)
      .sort((a, b) => b.days - a.days);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createPlan.mutate();
  };

  // Calculate the right coping strategies based on triggers
  const getCopingStrategies = () => {
    const strategies: { [key: string]: string } = {
      stress: "Try deep breathing or a short mindfulness session when stressed.",
      social: "Plan responses for when offered tobacco. Bring nicotine replacement.",
      boredom: "Keep a list of activities for when cravings hit (games, walks, calls).",
      alcohol: "Limit alcohol while quitting, or switch environments when drinking.",
      meals: "Replace post-meal cigarettes with a walk, fruit, or brushing teeth.",
      morning: "Change your morning routine - exercise, shower, or different breakfast.",
      driving: "Keep car tobacco-free, try new music, or take different routes.",
      breaks: "Find a tobacco-free break area or buddy up with non-smoking colleagues."
    };
    
    return triggers.map(trigger => ({
      trigger,
      strategy: strategies[trigger] || "Identify your pattern and plan an alternative action."
    }));
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Your Quit Plan</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/nicotine')}>
            Nicotine Tracker
          </Button>
          <Button variant="outline" onClick={() => navigate('/cravings')}>
            Manage Cravings
          </Button>
        </div>
      </div>

      <Tabs defaultValue={currentPlan ? "view" : "create"} className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Create/Edit Plan</TabsTrigger>
          <TabsTrigger value="view" disabled={!currentPlan}>View Progress</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="space-y-4 mt-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CigaretteOff className="h-5 w-5" />
                    Usage Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="productType">Product Type</Label>
                    <Select value={productType} onValueChange={setProductType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product type" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="initialUsage">Current Daily Usage</Label>
                    <Input 
                      id="initialUsage" 
                      placeholder="e.g., 20 cigarettes per day" 
                      value={initialUsage} 
                      onChange={(e) => setInitialUsage(e.target.value)} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dailyCost">Daily Cost ($)</Label>
                    <Input 
                      id="dailyCost" 
                      type="number"
                      step="0.01"
                      placeholder="Daily spending on tobacco" 
                      value={dailyCost} 
                      onChange={(e) => setDailyCost(e.target.value)} 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="strategy">Quit Strategy</Label>
                    <RadioGroup value={strategy} onValueChange={(value: any) => setStrategy(value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cold_turkey" id="cold_turkey" />
                        <Label htmlFor="cold_turkey">Cold Turkey (Quit Immediately)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="taper_down" id="taper_down" />
                        <Label htmlFor="taper_down">Taper Down Gradually</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="nrt_assisted" id="nrt_assisted" />
                        <Label htmlFor="nrt_assisted">NRT Assisted (Patches, Gum, etc.)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="harm_reduction" id="harm_reduction" />
                        <Label htmlFor="harm_reduction">Harm Reduction (Switch Products)</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  {strategy === "taper_down" && (
                    <div className="space-y-2">
                      <Label htmlFor="targetUsage">Target Usage (Before Quitting)</Label>
                      <Input 
                        id="targetUsage" 
                        placeholder="e.g., 5 cigarettes per day" 
                        value={targetUsage} 
                        onChange={(e) => setTargetUsage(e.target.value)} 
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="targetDate">Target Quit Date</Label>
                    <Input 
                      id="targetDate" 
                      type="date" 
                      value={targetDate} 
                      onChange={(e) => setTargetDate(e.target.value)} 
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Personalize Your Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>What Triggers Your Tobacco Use?</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {COMMON_TRIGGERS.map((trigger) => (
                        <div key={trigger.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={trigger.id}
                            checked={triggers.includes(trigger.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setTriggers([...triggers, trigger.id]);
                              } else {
                                setTriggers(triggers.filter(t => t !== trigger.id));
                              }
                            }}
                          />
                          <Label htmlFor={trigger.id}>{trigger.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Your Reasons for Quitting</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {COMMON_REASONS.map((reason) => (
                        <div key={reason.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={reason.id}
                            checked={reasons.includes(reason.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setReasons([...reasons, reason.id]);
                              } else {
                                setReasons(reasons.filter(r => r !== reason.id));
                              }
                            }}
                          />
                          <Label htmlFor={reason.id}>{reason.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button type="submit" className="w-full" disabled={createPlan.isPending}>
              {createPlan.isPending ? "Saving..." : currentPlan ? "Update Quit Plan" : "Create Quit Plan"}
            </Button>
          </form>
        </TabsContent>
        
        <TabsContent value="view" className="space-y-6 mt-4">
          {currentPlan && (
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
                      Since {format(new Date(currentPlan.start_date), 'MMM d, yyyy')}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Money Saved
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      ${getMoneySaved()}
                    </div>
                    <p className="text-muted-foreground">
                      Based on ${currentPlan.daily_cost}/day
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Health Recovery
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-medium">
                      {getAchievedMilestones().length} milestones reached
                    </div>
                    <p className="text-muted-foreground">
                      {getUpcomingMilestones()[0]?.description}
                      <span className="block text-sm mt-1">
                        in {getUpcomingMilestones()[0]?.daysUntil} days
                      </span>
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      Health Journey
                    </CardTitle>
                    <CardDescription>
                      Your body is healing with each smoke-free day
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ScrollArea className="h-[300px] pr-4">
                      {getAchievedMilestones().length > 0 ? (
                        <div className="space-y-4">
                          {getAchievedMilestones().map((milestone, index) => (
                            <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                              <div className="h-7 w-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                                <Heart className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="font-medium">{milestone.description}</div>
                                <div className="text-sm text-muted-foreground">
                                  {milestone.days < 1 
                                    ? `After ${Math.round(milestone.days * 24)} hours` 
                                    : `After ${milestone.days} days`}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10 text-muted-foreground">
                          Your health improvements will appear here once you've quit.
                        </div>
                      )}
                    </ScrollArea>
                      
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Upcoming health improvements</div>
                      {getUpcomingMilestones().map((milestone, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span>{milestone.description}</span>
                          <span className="text-muted-foreground">
                            {format(milestone.date, 'MMM d')} ({milestone.daysUntil} days)
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Coping Strategies
                    </CardTitle>
                    <CardDescription>
                      Personalized strategies for your triggers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {getCopingStrategies().length > 0 ? (
                      <div className="space-y-4">
                        {getCopingStrategies().map((item, index) => (
                          <div key={index} className="space-y-1">
                            <div className="font-medium">For {COMMON_TRIGGERS.find(t => t.id === item.trigger)?.label || item.trigger}</div>
                            <p className="text-sm text-muted-foreground">{item.strategy}</p>
                          </div>
                        ))}
                        <div className="pt-2">
                          <Button variant="outline" className="w-full" onClick={() => navigate('/cravings')}>
                            Track Cravings <ArrowUpRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground space-y-3">
                        <p>No triggers identified yet.</p>
                        <Button variant="outline" onClick={() => setActiveTab("create")}>
                          Update Your Plan
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}