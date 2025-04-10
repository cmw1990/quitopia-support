import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Timer, 
  BarChart3, 
  Activity, 
  Brain, 
  Settings, 
  ArrowRightLeft,
  BellOff,
  Smartphone,
  Cog,
  ListChecks,
  LayoutDashboard,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="container py-8 space-y-10">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold">Easier Focus</h1>
        <p className="text-xl text-muted-foreground">Manage distractions and optimize focus for ADHD</p>
      </section>
      
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Pomodoro Timer
            </CardTitle>
            <CardDescription>
              Stay focused with customizable time intervals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Use the Pomodoro technique with customizable work and break times tailored to your attention span.
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/pomodoro" className="w-full">
              <Button className="w-full">Open Timer</Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Focus Stats
            </CardTitle>
            <CardDescription>
              Track your focus patterns and productivity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Visualize your focus trends, identify peak productivity periods, and track improvement over time.
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/focus-stats" className="w-full">
              <Button className="w-full">View Stats</Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Anti-Googlitis
            </CardTitle>
            <CardDescription>
              Manage internet distractions effectively
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Block distracting websites, provide helpful alternatives, and develop healthier browsing habits.
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/anti-googlitis" className="w-full">
              <Button className="w-full">Control Distractions</Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Executive Functions
            </CardTitle>
            <CardDescription>
              Support for working memory and task initiation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Tools to enhance memory capacity, simplify task initiation, and create implementation intentions.
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/executive-functions" className="w-full">
              <Button className="w-full">Enhance Functions</Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              Context Switching
            </CardTitle>
            <CardDescription>
              Transition smoothly between different tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Structured transition processes to reduce cognitive load when moving between different activities.
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/context-switching" className="w-full">
              <Button className="w-full">Switch Context</Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellOff className="h-5 w-5" />
              Notification Management
            </CardTitle>
            <CardDescription>
              Control digital interruptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Set up focus periods, manage notification rules, and analyze your interruption patterns.
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/notification-manager" className="w-full">
              <Button className="w-full">Manage Notifications</Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Digital Minimalism
            </CardTitle>
            <CardDescription>
              Simplify your digital environment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Identify and reduce digital clutter, track screen time, and create a more intentional relationship with technology.
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/digital-minimalism" className="w-full">
              <Button className="w-full">Declutter Digital Space</Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5" />
              Energy Scheduler
            </CardTitle>
            <CardDescription>
              Match tasks to your energy levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Plan your day based on energy levels, track ultradian rhythms, and optimize task scheduling.
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/energy-scheduler" className="w-full">
              <Button className="w-full">Schedule by Energy</Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </CardTitle>
            <CardDescription>
              Personalized overview of all tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Access all your most-used tools from a customizable dashboard tailored to your needs.
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/dashboard" className="w-full">
              <Button className="w-full">Go to Dashboard</Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Body Doubling
            </CardTitle>
            <CardDescription>
              Work alongside others to enhance focus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Virtual co-working and accountability sessions to overcome procrastination and improve productivity.
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/body-doubling" className="w-full">
              <Button className="w-full">Start Co-working</Button>
            </Link>
          </CardFooter>
        </Card>
      </section>
      
      <section className="mt-12 pt-6 border-t">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Customize Your Experience</h2>
            <p className="text-muted-foreground">Adjust settings to match your unique ADHD profile</p>
          </div>
          <Link to="/settings">
            <Button variant="outline">
              <Cog className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
} 