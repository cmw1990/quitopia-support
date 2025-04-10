import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TopNav } from "@/components/layout/TopNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Correct import for useAuth hook
import { useAuth } from "@/components/AuthProvider"; 
import { useToast } from "@/hooks/useToast";
import { 
  Brain, Clock, Ban, Target, BarChart3, Activity, Battery, User, ArrowRight, Check, Info, 
  ExternalLink
} from "lucide-react";

const WebApp = () => {
  const { session, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useEffect(() => {
    // If the user is not authenticated after the auth check completes, show the auth prompt
    if (!authLoading && !session) {
      setShowAuthPrompt(true);
    }
  }, [session, authLoading]);

  // Function to handle navigation to app features
  const navigateToFeature = (path: string) => {
    if (session) {
      navigate(path);
    } else {
      toast({
        title: "Authentication Required",
        description: "Please sign in or create an account to access this feature.",
        variant: "default",
      });
      navigate("/auth");
    }
  };

  // Features data
  const features = [
    {
      name: "Focus Timer",
      description: "Customizable pomodoro and deep work timers with focus tracking",
      icon: <Clock className="h-5 w-5 text-primary" />,
      path: "/app/focus-tools",
      benefits: ["Tracks focus time", "Distraction logging", "Break reminders"]
    },
    {
      name: "Distraction Blocker",
      description: "Block websites, apps, and notifications during focus times",
      icon: <Ban className="h-5 w-5 text-primary" />,
      path: "/app/blocker",
      benefits: ["Website blocking", "App blocking", "Scheduled blocking"]
    },
    {
      name: "ADHD Support",
      description: "Task breakdown tools and executive function support",
      icon: <Target className="h-5 w-5 text-primary" />,
      path: "/app/adhd-support",
      benefits: ["Task breakdown", "Body doubling", "ADHD strategies"]
    },
    {
      name: "Energy Management",
      description: "Track and optimize your mental energy throughout the day",
      icon: <Battery className="h-5 w-5 text-primary" />,
      path: "/app/energy-support",
      benefits: ["Energy tracking", "Fatigue management", "Recovery strategies"]
    },
    {
      name: "Focus Analytics",
      description: "Detailed analytics on your focus habits and patterns",
      icon: <BarChart3 className="h-5 w-5 text-primary" />,
      path: "/app/analytics",
      benefits: ["Focus trends", "Distraction patterns", "Productivity insights"]
    },
    {
      name: "Dashboard",
      description: "Your personal focus command center with all key metrics",
      icon: <Activity className="h-5 w-5 text-primary" />,
      path: "/app/dashboard",
      benefits: ["Focus score", "Daily progress", "Goal tracking"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl font-bold text-primary">
            Easier Focus Web Application
          </h1>
          <p className="text-xl text-muted-foreground">
            Your complete focus management system for overcoming ADHD challenges, 
            blocking distractions, and optimizing mental energy.
          </p>
          
          {session ? (
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" onClick={() => navigate("/app/dashboard")}>
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/app/focus-session")}>
                Start Focus Session
                <Clock className="ml-2 h-5 w-5" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" onClick={() => navigate("/auth")}>
                Sign In
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/auth?signup=true")}>
                Create Account
                <User className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Auth Prompt (shows only when user is not authenticated) */}
      {showAuthPrompt && (
        <section className="container mx-auto px-4 mb-16">
          <Card className="max-w-3xl mx-auto border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Authentication Required
              </CardTitle>
              <CardDescription>
                Please sign in or create an account to use the full features of Easier Focus
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  While you can explore the interface, you'll need to authenticate to:
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    "Save your focus sessions", 
                    "Track your progress over time",
                    "Create personalized focus plans",
                    "Access your data across devices", 
                    "Unlock advanced features",
                    "Get personalized recommendations"
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex flex-wrap gap-4 w-full">
                <Button className="flex-1" onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => navigate("/auth?signup=true")}>
                  Create Account
                </Button>
              </div>
            </CardFooter>
          </Card>
        </section>
      )}
      
      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Comprehensive Focus Features</h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
            Everything you need to master focus, overcome ADHD challenges, and optimize your mental energy
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="border-2 hover:border-primary hover:shadow-lg transition-all cursor-pointer"
              onClick={() => navigateToFeature(feature.path)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, bIndex) => (
                    <li key={bIndex} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full justify-between">
                  Explore Feature <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-16 bg-primary/5">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">What Our Users Say</h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
            Hear from people who have transformed their focus and productivity with Easier Focus
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              quote: "Since using Easier Focus, I've increased my deep work time by 120%. The ADHD support features are game-changing for me.",
              name: "Alex K.",
              title: "UX Designer with ADHD",
              avatar: "👨‍🎨"
            },
            {
              quote: "The energy management tools helped me recognize when I'm most productive and schedule my most important work during those times.",
              name: "Sarah L.",
              title: "Marketing Director",
              avatar: "👩‍💼"
            },
            {
              quote: "Body doubling sessions have completely transformed how I work. I'm finally able to start difficult tasks without procrastinating.",
              name: "Michael T.",
              title: "Software Engineer",
              avatar: "👨‍💻"
            }
          ].map((testimonial, index) => (
            <Card key={index} className="border border-border">
              <CardContent className="pt-6">
                <div className="text-3xl mb-4">{testimonial.avatar}</div>
                <p className="italic text-lg mb-6">"{testimonial.quote}"</p>
                <div>
                  <p className="font-medium">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">How We Compare</h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
            See why Easier Focus offers the most comprehensive solution for focus and ADHD management
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-4 text-left">Features</th>
                <th className="p-4 text-center bg-primary/10 font-bold">Easier Focus</th>
                <th className="p-4 text-center">Regular Pomodoro Apps</th>
                <th className="p-4 text-center">ADHD Planners</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  feature: "Flow State Tracking",
                  easierFocus: true,
                  pomodoro: false,
                  adhdPlanner: false
                },
                {
                  feature: "ADHD-Specific Support",
                  easierFocus: true,
                  pomodoro: false,
                  adhdPlanner: true
                },
                {
                  feature: "Energy Level Management",
                  easierFocus: true,
                  pomodoro: false,
                  adhdPlanner: false
                },
                {
                  feature: "Body Doubling Sessions",
                  easierFocus: true,
                  pomodoro: false,
                  adhdPlanner: false
                },
                {
                  feature: "Distraction Analytics",
                  easierFocus: true,
                  pomodoro: false,
                  adhdPlanner: false
                },
                {
                  feature: "Context Switching Support",
                  easierFocus: true,
                  pomodoro: false,
                  adhdPlanner: false
                }
              ].map((row, index) => (
                <tr key={index} className="border-b">
                  <td className="p-4 font-medium">{row.feature}</td>
                  <td className="p-4 text-center bg-primary/5">
                    {row.easierFocus ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <Ban className="h-5 w-5 text-red-300 mx-auto" />}
                  </td>
                  <td className="p-4 text-center">
                    {row.pomodoro ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <Ban className="h-5 w-5 text-red-300 mx-auto" />}
                  </td>
                  <td className="p-4 text-center">
                    {row.adhdPlanner ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <Ban className="h-5 w-5 text-red-300 mx-auto" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-16 bg-primary/5">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
            Got questions? We've got answers.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto space-y-6">
          {[
            {
              question: "How is Easier Focus different from other productivity apps?",
              answer: "Easier Focus is specifically designed for people with focus challenges and ADHD. We combine proven focus techniques with ADHD-specific strategies, energy management, and comprehensive analytics to provide a complete solution tailored to your unique needs."
            },
            {
              question: "Do I need to be diagnosed with ADHD to use Easier Focus?",
              answer: "Absolutely not! While our features are extremely helpful for people with ADHD, they're beneficial for anyone looking to improve their focus, combat digital distractions, or optimize their mental energy throughout the day."
            },
            {
              question: "Can I use Easier Focus on multiple devices?",
              answer: "Yes! Your account syncs across all devices, so you can access your data and settings from your computer, phone, or tablet. The web application works on any modern browser, and we have native mobile apps available for download."
            },
            {
              question: "Is my data private and secure?",
              answer: "Privacy and security are our top priorities. We use industry-standard encryption and security practices to protect your data. We never sell your personal information to third parties, and you maintain complete control over your data."
            }
          ].map((faq, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-xl flex items-start gap-2">
                  <Info className="h-5 w-5 text-primary shrink-0 mt-1" />
                  {faq.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold">Ready to Transform Your Focus?</h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of users who have improved their productivity, reduced distractions, and conquered ADHD challenges with Easier Focus.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-6">
            <Button size="lg" onClick={() => navigate("/auth?signup=true")}>
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/web-tools")}>
              Try Our Web Tools
              <ExternalLink className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
      
      {/* Platform Tabs */}
      <section className="container mx-auto px-4 py-16 bg-muted/30 rounded-xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Available Everywhere You Need Focus</h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
            Easier Focus is designed to support you across all your devices and work environments
          </p>
        </div>
        
        <Tabs defaultValue="webapp" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="webapp">Web App</TabsTrigger>
            <TabsTrigger value="mobileapp">Mobile App</TabsTrigger>
            <TabsTrigger value="browser">Browser Extension</TabsTrigger>
          </TabsList>
          
          <TabsContent value="webapp" className="p-6 bg-card rounded-lg mt-6 border">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-4">
                <h3 className="text-2xl font-bold">Easier Focus Web App</h3>
                <p>
                  Our comprehensive web application works on any device with a modern web browser,
                  providing full access to focus tools, analytics, and ADHD support.
                </p>
                <ul className="space-y-2">
                  {[
                    "Real-time focus tracking and analytics",
                    "Comprehensive distraction management",
                    "Detailed ADHD support features",
                    "Full task management system",
                    "Syncs across all devices automatically"
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button onClick={() => navigateToFeature("/app/dashboard")}>
                  Launch Web App
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="md:w-1/3 bg-muted rounded-lg p-4 flex items-center justify-center">
                <div className="aspect-video w-full bg-background rounded-md border flex items-center justify-center">
                  <p className="text-center text-muted-foreground">Web App Preview</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="mobileapp" className="p-6 bg-card rounded-lg mt-6 border">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-4">
                <h3 className="text-2xl font-bold">Easier Focus Mobile App</h3>
                <p>
                  Take your focus management on the go with our dedicated mobile application,
                  featuring optimized interfaces for smaller screens and mobile-specific features.
                </p>
                <ul className="space-y-2">
                  {[
                    "Mobile-optimized focus timers and tools",
                    "Notification blocking on mobile devices",
                    "Location-based focus settings",
                    "Offline support for focus sessions",
                    "Integration with phone's Do Not Disturb"
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button onClick={() => navigate("/mobileapp")}>
                  Learn About Mobile App
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="md:w-1/3 bg-muted rounded-lg p-4 flex items-center justify-center">
                <div className="aspect-[9/16] w-2/3 bg-background rounded-md border flex items-center justify-center">
                  <p className="text-center text-muted-foreground">Mobile App Preview</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="browser" className="p-6 bg-card rounded-lg mt-6 border">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-4">
                <h3 className="text-2xl font-bold">Browser Extension</h3>
                <p>
                  Supercharge your focus directly in your browser with our extension, providing 
                  powerful website blocking, distraction management, and quick access to focus tools.
                </p>
                <ul className="space-y-2">
                  {[
                    "One-click website blocking",
                    "Distraction-free reading mode",
                    "Quick-access focus timer",
                    "YouTube distraction blocker",
                    "Social media newsfeed blocker"
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button disabled className="opacity-70">
                  Coming Soon
                  <Info className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="md:w-1/3 bg-muted rounded-lg p-4 flex items-center justify-center">
                <div className="aspect-square w-full bg-background rounded-md border flex items-center justify-center">
                  <p className="text-center text-muted-foreground">Extension Preview</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>
      
      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Brain className="h-6 w-6 text-primary" />
              <span className="text-xl font-semibold">Easier Focus</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Home</Link>
              <Link to="/tools" className="text-sm text-muted-foreground hover:text-foreground">Web Tools</Link>
              <Link to="/webapp" className="text-sm text-muted-foreground hover:text-foreground">Web App</Link>
              <Link to="/mobileapp" className="text-sm text-muted-foreground hover:text-foreground">Mobile App</Link>
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms of Use</Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Easier Focus. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WebApp; 