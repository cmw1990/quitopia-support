import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, Save, Brain, ArrowUp, ArrowDown, Activity, BrainCircuit, AlertCircle, Clock, BarChart2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { db } from "@/lib/supabase";

interface SymptomEntry {
  id?: string;
  user_id: string;
  date: string; // ISO string
  attention: number;
  hyperactivity: number;
  impulsivity: number;
  organization: number;
  emotional_regulation: number;
  time_management: number;
  motivation: number;
  notes: string;
  factors: string[];
  created_at?: string;
}

interface SymptomStats {
  weeklyAverage: {
    attention: number;
    hyperactivity: number;
    impulsivity: number;
    organization: number;
    emotional_regulation: number;
    time_management: number;
    motivation: number;
  };
  trends: {
    attention: "up" | "down" | "stable";
    hyperactivity: "up" | "down" | "stable";
    impulsivity: "up" | "down" | "stable";
    organization: "up" | "down" | "stable";
    emotional_regulation: "up" | "down" | "stable";
    time_management: "up" | "down" | "stable";
    motivation: "up" | "down" | "stable";
  };
  lastEntry?: SymptomEntry;
}

export function SymptomTracker() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Form state
  const [date, setDate] = useState<Date>(new Date());
  const [symptoms, setSymptoms] = useState({
    attention: 5,
    hyperactivity: 5,
    impulsivity: 5,
    organization: 5,
    emotional_regulation: 5,
    time_management: 5,
    motivation: 5,
  });
  const [notes, setNotes] = useState("");
  const [factors, setFactors] = useState<string[]>([]);
  const [availableFactors] = useState([
    "Sleep deprivation",
    "Poor nutrition",
    "High stress",
    "Physical exercise",
    "Medication timing",
    "Caffeine",
    "Screen time",
    "Social interactions",
    "Environment changes",
    "Weather changes"
  ]);
  
  // Data state
  const [entries, setEntries] = useState<SymptomEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<SymptomStats>({
    weeklyAverage: {
      attention: 0,
      hyperactivity: 0,
      impulsivity: 0,
      organization: 0,
      emotional_regulation: 0,
      time_management: 0,
      motivation: 0
    },
    trends: {
      attention: "stable",
      hyperactivity: "stable",
      impulsivity: "stable",
      organization: "stable",
      emotional_regulation: "stable",
      time_management: "stable",
      motivation: "stable"
    }
  });
  
  // Load user's symptom entries
  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user]);
  
  // Fetch entries from database
  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await db
        .from("adhd_symptom_tracker")
        .select("*")
        .eq("user_id", user?.id)
        .order("date", { ascending: false });
        
      if (error) throw error;
      
      // Convert data to SymptomEntry type
      const formattedEntries = data as SymptomEntry[];
      setEntries(formattedEntries);
      
      // Calculate stats
      calculateStats(formattedEntries);
      
      // Set form to today's entry if it exists, otherwise default values
      const todayEntry = formattedEntries.find(
        entry => entry.date.substring(0, 10) === new Date().toISOString().substring(0, 10)
      );
      
      if (todayEntry) {
        setDate(new Date(todayEntry.date));
        setSymptoms({
          attention: todayEntry.attention,
          hyperactivity: todayEntry.hyperactivity,
          impulsivity: todayEntry.impulsivity,
          organization: todayEntry.organization,
          emotional_regulation: todayEntry.emotional_regulation,
          time_management: todayEntry.time_management,
          motivation: todayEntry.motivation,
        });
        setNotes(todayEntry.notes);
        setFactors(todayEntry.factors);
      }
    } catch (error) {
      console.error("Error fetching symptom entries:", error);
      toast({
        title: "Error loading data",
        description: "Could not fetch your symptom data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate statistics from entries
  const calculateStats = (entries: SymptomEntry[]) => {
    // Get entries from the last 7 days
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekEntries = entries.filter(
      entry => new Date(entry.date) >= oneWeekAgo
    );
    
    // Calculate weekly averages
    const weeklyAverage = weekEntries.length > 0 
      ? {
          attention: Math.round(weekEntries.reduce((sum, entry) => sum + entry.attention, 0) / weekEntries.length),
          hyperactivity: Math.round(weekEntries.reduce((sum, entry) => sum + entry.hyperactivity, 0) / weekEntries.length),
          impulsivity: Math.round(weekEntries.reduce((sum, entry) => sum + entry.impulsivity, 0) / weekEntries.length),
          organization: Math.round(weekEntries.reduce((sum, entry) => sum + entry.organization, 0) / weekEntries.length),
          emotional_regulation: Math.round(weekEntries.reduce((sum, entry) => sum + entry.emotional_regulation, 0) / weekEntries.length),
          time_management: Math.round(weekEntries.reduce((sum, entry) => sum + entry.time_management, 0) / weekEntries.length),
          motivation: Math.round(weekEntries.reduce((sum, entry) => sum + entry.motivation, 0) / weekEntries.length)
        }
      : {
          attention: 5,
          hyperactivity: 5,
          impulsivity: 5,
          organization: 5,
          emotional_regulation: 5,
          time_management: 5,
          motivation: 5
        };
      
    // Calculate trends (need at least 2 entries to determine a trend)
    const trends: any = {
      attention: "stable",
      hyperactivity: "stable",
      impulsivity: "stable",
      organization: "stable",
      emotional_regulation: "stable",
      time_management: "stable",
      motivation: "stable"
    };
    
    if (weekEntries.length >= 2) {
      // Sort entries by date (oldest first)
      const sortedEntries = [...weekEntries].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      // Get first and last entries
      const firstEntry = sortedEntries[0];
      const lastEntry = sortedEntries[sortedEntries.length - 1];
      
      // Compare and determine trends
      Object.keys(trends).forEach((symptom) => {
        const firstValue = firstEntry[symptom as keyof SymptomEntry] as number;
        const lastValue = lastEntry[symptom as keyof SymptomEntry] as number;
        
        if (lastValue - firstValue >= 1) {
          trends[symptom] = "up";
        } else if (firstValue - lastValue >= 1) {
          trends[symptom] = "down";
        } else {
          trends[symptom] = "stable";
        }
      });
    }
    
    setStats({
      weeklyAverage,
      trends,
      lastEntry: entries[0]
    });
  };
  
  // Save a new entry or update existing one
  const saveEntry = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to track your symptoms",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    // Format the entry
    const entryData: SymptomEntry = {
      user_id: user.id,
      date: date.toISOString(),
      attention: symptoms.attention,
      hyperactivity: symptoms.hyperactivity,
      impulsivity: symptoms.impulsivity,
      organization: symptoms.organization,
      emotional_regulation: symptoms.emotional_regulation,
      time_management: symptoms.time_management,
      motivation: symptoms.motivation,
      notes: notes,
      factors: factors
    };
    
    try {
      // Check if an entry already exists for this date
      const existingEntryIndex = entries.findIndex(
        entry => entry.date.substring(0, 10) === date.toISOString().substring(0, 10)
      );
      
      let result;
      
      if (existingEntryIndex >= 0) {
        // Update existing entry
        const existingEntry = entries[existingEntryIndex];
        
        result = await db
          .from("adhd_symptom_tracker")
          .update(entryData)
          .eq("id", existingEntry.id);
        
        if (result.error) throw result.error;
        
        // Update local state
        const updatedEntries = [...entries];
        updatedEntries[existingEntryIndex] = {...entryData, id: existingEntry.id, created_at: existingEntry.created_at};
        setEntries(updatedEntries);
        
        toast({
          title: "Entry updated",
          description: `Your symptom tracking for ${format(date, "PPP")} has been updated.`
        });
      } else {
        // Insert new entry
        result = await db
          .from("adhd_symptom_tracker")
          .insert(entryData);
        
        if (result.error) throw result.error;
        
        toast({
          title: "Entry saved",
          description: `Your symptom tracking for ${format(date, "PPP")} has been saved.`
        });
        
        // Refresh entries to get the new data with IDs
        fetchEntries();
      }
    } catch (error) {
      console.error("Error saving symptom entry:", error);
      toast({
        title: "Error saving data",
        description: "Could not save your symptom data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Toggle a factor in the factors array
  const toggleFactor = (factor: string) => {
    if (factors.includes(factor)) {
      setFactors(factors.filter(f => f !== factor));
    } else {
      setFactors([...factors, factor]);
    }
  };
  
  // Get the trend icon for a symptom
  const getTrendIcon = (trend: "up" | "down" | "stable", symptomName: string) => {
    if (symptomName === "organization" || symptomName === "motivation") {
      // For these symptoms, up is good
      if (trend === "up") {
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      } else if (trend === "down") {
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      }
    } else {
      // For attention difficulties, hyperactivity, etc., down is good
      if (trend === "up") {
        return <ArrowUp className="h-4 w-4 text-red-500" />;
      } else if (trend === "down") {
        return <ArrowDown className="h-4 w-4 text-green-500" />;
      }
    }
    
    return null; // Stable trend, no icon
  };
  
  return (
    <div>
      <Tabs defaultValue="track">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="track" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Track Symptoms
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="track">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-primary" />
                ADHD Symptom Tracker
              </CardTitle>
              <CardDescription>
                Track your ADHD symptoms over time to identify patterns and improve management strategies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Selector */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => date && setDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Symptom Sliders */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm">Symptom Severity (1-10)</h3>
                
                <div className="space-y-4">
                  {/* Attention */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="attention" className="text-sm">Attention Difficulties</Label>
                      <span className="text-sm font-medium">{symptoms.attention}</span>
                    </div>
                    <Slider 
                      id="attention"
                      min={1} 
                      max={10} 
                      step={1} 
                      value={[symptoms.attention]} 
                      onValueChange={(value) => setSymptoms({...symptoms, attention: value[0]})}
                    />
                    <p className="text-xs text-muted-foreground">
                      Difficulty sustaining attention, easily distracted
                    </p>
                  </div>
                  
                  {/* Hyperactivity */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="hyperactivity" className="text-sm">Hyperactivity</Label>
                      <span className="text-sm font-medium">{symptoms.hyperactivity}</span>
                    </div>
                    <Slider 
                      id="hyperactivity"
                      min={1} 
                      max={10} 
                      step={1} 
                      value={[symptoms.hyperactivity]} 
                      onValueChange={(value) => setSymptoms({...symptoms, hyperactivity: value[0]})}
                    />
                    <p className="text-xs text-muted-foreground">
                      Restlessness, fidgeting, difficulty staying still
                    </p>
                  </div>
                  
                  {/* Impulsivity */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="impulsivity" className="text-sm">Impulsivity</Label>
                      <span className="text-sm font-medium">{symptoms.impulsivity}</span>
                    </div>
                    <Slider 
                      id="impulsivity"
                      min={1} 
                      max={10} 
                      step={1} 
                      value={[symptoms.impulsivity]} 
                      onValueChange={(value) => setSymptoms({...symptoms, impulsivity: value[0]})}
                    />
                    <p className="text-xs text-muted-foreground">
                      Acting without thinking, interrupting, making hasty decisions
                    </p>
                  </div>
                  
                  {/* Organization */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="organization" className="text-sm">Organization</Label>
                      <span className="text-sm font-medium">{symptoms.organization}</span>
                    </div>
                    <Slider 
                      id="organization"
                      min={1} 
                      max={10} 
                      step={1} 
                      value={[symptoms.organization]} 
                      onValueChange={(value) => setSymptoms({...symptoms, organization: value[0]})}
                    />
                    <p className="text-xs text-muted-foreground">
                      Higher scores indicate better organization skills
                    </p>
                  </div>
                  
                  {/* Emotional Regulation */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="emotional_regulation" className="text-sm">Emotional Regulation</Label>
                      <span className="text-sm font-medium">{symptoms.emotional_regulation}</span>
                    </div>
                    <Slider 
                      id="emotional_regulation"
                      min={1} 
                      max={10} 
                      step={1} 
                      value={[symptoms.emotional_regulation]} 
                      onValueChange={(value) => setSymptoms({...symptoms, emotional_regulation: value[0]})}
                    />
                    <p className="text-xs text-muted-foreground">
                      Mood swings, frustration tolerance, emotional responses
                    </p>
                  </div>
                  
                  {/* Time Management */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="time_management" className="text-sm">Time Management</Label>
                      <span className="text-sm font-medium">{symptoms.time_management}</span>
                    </div>
                    <Slider 
                      id="time_management"
                      min={1} 
                      max={10} 
                      step={1} 
                      value={[symptoms.time_management]} 
                      onValueChange={(value) => setSymptoms({...symptoms, time_management: value[0]})}
                    />
                    <p className="text-xs text-muted-foreground">
                      Higher scores indicate better time management
                    </p>
                  </div>
                  
                  {/* Motivation */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="motivation" className="text-sm">Motivation</Label>
                      <span className="text-sm font-medium">{symptoms.motivation}</span>
                    </div>
                    <Slider 
                      id="motivation"
                      min={1} 
                      max={10} 
                      step={1} 
                      value={[symptoms.motivation]} 
                      onValueChange={(value) => setSymptoms({...symptoms, motivation: value[0]})}
                    />
                    <p className="text-xs text-muted-foreground">
                      Higher scores indicate better motivation
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Contributing Factors */}
              <div className="space-y-2">
                <Label>Contributing Factors</Label>
                <div className="flex flex-wrap gap-2">
                  {availableFactors.map((factor) => (
                    <Button
                      key={factor}
                      variant={factors.includes(factor) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleFactor(factor)}
                    >
                      {factor}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Select factors that may have influenced your symptoms today
                </p>
              </div>
              
              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Enter any additional notes about your day..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={saveEntry} 
                disabled={isLoading} 
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Activity className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Entry
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Symptom Insights
              </CardTitle>
              <CardDescription>
                Analyze your symptom patterns to identify trends and triggers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {entries.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No data yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start tracking your symptoms to see insights and trends
                  </p>
                </div>
              ) : (
                <>
                  {/* Symptom Overview */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Weekly Average</h3>
                    <div className="space-y-4">
                      {Object.entries(stats.weeklyAverage).map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="text-sm capitalize">
                                {key.replace(/_/g, ' ')}
                              </span>
                              {stats.trends[key as keyof typeof stats.trends] && (
                                <span>
                                  {getTrendIcon(
                                    stats.trends[key as keyof typeof stats.trends],
                                    key
                                  )}
                                </span>
                              )}
                            </div>
                            <span className="text-sm font-medium">{value}/10</span>
                          </div>
                          <Progress value={value * 10} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Common Factors */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Common Contributing Factors</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {availableFactors
                        .map(factor => {
                          const count = entries
                            .filter(entry => entry.factors.includes(factor))
                            .length;
                          return { factor, count };
                        })
                        .filter(({ count }) => count > 0)
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 6)
                        .map(({ factor, count }) => (
                          <div 
                            key={factor} 
                            className="flex justify-between items-center bg-muted p-2 rounded-md"
                          >
                            <span className="text-sm">{factor}</span>
                            <span className="text-xs text-muted-foreground">
                              {count} {count === 1 ? 'day' : 'days'}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                  
                  {/* Recent Entries */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Recent Entries</h3>
                    <div className="space-y-2">
                      {entries.slice(0, 5).map(entry => (
                        <Card key={entry.id} className="bg-muted">
                          <CardContent className="p-3">
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                  {format(new Date(entry.date), "PP")}
                                </span>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 px-2" 
                                onClick={() => {
                                  setDate(new Date(entry.date));
                                  setSymptoms({
                                    attention: entry.attention,
                                    hyperactivity: entry.hyperactivity,
                                    impulsivity: entry.impulsivity,
                                    organization: entry.organization,
                                    emotional_regulation: entry.emotional_regulation,
                                    time_management: entry.time_management,
                                    motivation: entry.motivation,
                                  });
                                  setNotes(entry.notes);
                                  setFactors(entry.factors);
                                  const tabElement = document.querySelector('[data-state="inactive"][value="track"]') as HTMLElement;
                                  if (tabElement) tabElement.click();
                                }}
                              >
                                Edit
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-2">
                              <div className="flex justify-between">
                                <span className="text-xs">Attention:</span>
                                <span className="text-xs font-medium">{entry.attention}/10</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs">Hyperactivity:</span>
                                <span className="text-xs font-medium">{entry.hyperactivity}/10</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs">Impulsivity:</span>
                                <span className="text-xs font-medium">{entry.impulsivity}/10</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs">Organization:</span>
                                <span className="text-xs font-medium">{entry.organization}/10</span>
                              </div>
                            </div>
                            
                            {entry.factors.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {entry.factors.map(factor => (
                                  <span 
                                    key={factor} 
                                    className="text-xs bg-background px-2 py-1 rounded-full"
                                  >
                                    {factor}
                                  </span>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 