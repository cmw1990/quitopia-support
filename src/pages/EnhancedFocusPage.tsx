import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import EnhancedFocusTimer from "../components/focus/EnhancedFocusTimer";
import { Calendar, Clock, BarChart2, List, BookOpen, History } from "lucide-react";
import { useFocusStatsApi } from "../api/focusApi"; // Removed unused useFocusSettingsApi
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

const EnhancedFocus = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("timer");
  // const [userStats, setUserStats] = useState<any>(null); // No longer needed, use query result directly
  // const [isLoading, setIsLoading] = useState<boolean>(true); // Use query's loading state
  
  // Load focus statistics using the hook
  const {
    stats: userStats, // Renamed data to userStats for consistency below
    isLoading,
    error: statsError // Capture error state
  } = useFocusStatsApi();
  // Removed incorrect getStatsQuery call
  
  // useEffect to handle error toast (data loading handled by useQuery)
  // useEffect to handle error toast (data loading handled by useQuery)
  useEffect(() => {
    if (statsError) {
      console.error("Error loading focus statistics:", statsError);
      toast({
        title: "Error Loading Stats",
        description: statsError.message || "Failed to load your focus statistics.",
        variant: "destructive"
      });
    }
  }, [statsError, toast]);
  // Removed manual loading logic useEffect which was here
  
  // Process data for visualizations
  const dailyFocusData = userStats?.daily_focus_minutes 
    ? Array.isArray(userStats.daily_focus_minutes)
      ? userStats.daily_focus_minutes.map((minutes: number, index: number) => ({
          day: index + 1,
          minutes
        }))
      : []
    : [];
  
  const focusByTechniqueData = userStats?.focus_by_technique
    ? Object.entries(userStats.focus_by_technique).map(([name, value]) => ({
        name,
        value
      }))
    : [];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Focus Dashboard</h1>
        <p className="text-muted-foreground">
          Tools and insights to help you manage your focus and productivity.
        </p>
      </div>

      <Tabs 
        defaultValue="timer" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-4 md:w-[600px]">
          <TabsTrigger value="timer" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Timer</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            <span>Tasks</span>
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>Resources</span>
          </TabsTrigger>
        </TabsList>

        {/* Timer Tab */}
        <TabsContent value="timer" className="space-y-4">
          <EnhancedFocusTimer />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Focus Time
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userStats?.total_minutes || 0} min
                </div>
                <p className="text-xs text-muted-foreground">
                  +{userStats?.total_minutes ? Math.round(userStats.total_minutes * 0.1) : 0}% from last week
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Focus Score
                </CardTitle>
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userStats?.average_focus_score || 0}/100
                </div>
                <Progress 
                  value={userStats?.average_focus_score || 0} 
                  className="h-2 mt-2"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Completed Sessions
                </CardTitle>
                <History className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userStats?.total_sessions || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {userStats?.average_session_duration || 0} min avg duration
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Most Productive
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userStats?.most_productive_day || "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on focus score
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Daily Focus Minutes</CardTitle>
                <CardDescription>
                  Your focus time over the past week
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {dailyFocusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={dailyFocusData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="minutes"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No data available yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Session Types</CardTitle>
                <CardDescription>
                  Breakdown of your focus techniques
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {focusByTechniqueData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={focusByTechniqueData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {focusByTechniqueData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No data available yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Focus Tasks</CardTitle>
              <CardDescription>
                Manage tasks associated with your focus sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Tasks feature will be available soon. You can currently manage tasks within the timer tab.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Focus Techniques</CardTitle>
              <CardDescription>
                Learn about different focus methods and how to apply them
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Pomodoro Technique</h3>
                <p className="text-sm text-muted-foreground">
                  The Pomodoro Technique uses a timer to break work into intervals, traditionally 25 minutes in length, separated by short breaks. Each interval is known as a "pomodoro".
                </p>
                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                  <li>Decide on the task to be done</li>
                  <li>Set the timer for 25 minutes</li>
                  <li>Work on the task until the timer rings</li>
                  <li>Take a short break (5 minutes)</li>
                  <li>After four pomodoros, take a longer break (15-30 minutes)</li>
                </ul>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Deep Work</h3>
                <p className="text-sm text-muted-foreground">
                  Deep Work is a state of distraction-free concentration that pushes your cognitive capabilities to their limit. These efforts create new value, improve your skill, and are hard to replicate.
                </p>
                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                  <li>Schedule deep work blocks (typically 1-4 hours)</li>
                  <li>Create a distraction-free environment</li>
                  <li>Set clear goals for the deep work session</li>
                  <li>Take breaks between deep work sessions</li>
                  <li>Regularly review and improve your deep work process</li>
                </ul>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Time Blocking</h3>
                <p className="text-sm text-muted-foreground">
                  Time Blocking is a time management method that divides your day into blocks of time. Each block is dedicated to accomplishing a specific task or group of tasks.
                </p>
                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                  <li>Plan your day the night before or first thing in the morning</li>
                  <li>Assign specific time blocks for different activities</li>
                  <li>Include buffer time between blocks</li>
                  <li>Adjust blocks as needed throughout the day</li>
                  <li>Review your time blocks at the end of the day</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>ADHD Support</CardTitle>
              <CardDescription>
                Strategies specifically designed for ADHD brains
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Body Doubling</h3>
                <p className="text-sm text-muted-foreground">
                  Body doubling is when another person works alongside you. Their presence can help keep you focused and accountable. This can be virtual or in-person.
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Structured Procrastination</h3>
                <p className="text-sm text-muted-foreground">
                  Turn procrastination into a productivity tool by keeping a list of important but not urgent tasks. When avoiding a high-priority task, work on these instead.
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Implementation Intentions</h3>
                <p className="text-sm text-muted-foreground">
                  Create "if-then" plans for specific situations: "If X happens, then I will do Y." This helps create automatic responses to predictable circumstances.
                </p>
              </div>
              
              <Button variant="outline" className="mt-4 w-full">
                Explore More ADHD Strategies
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedFocus; 