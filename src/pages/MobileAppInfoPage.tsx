import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smartphone,
  Brain,
  Bell,
  ZapOff,
  Battery,
  Download,
  Shield,
  CheckCircle,
  Clock,
  FileDown,
  ArrowRight,
  Zap,
  Check,
  QrCode,
  CircleSlash,
  Gauge,
  Activity,
  Moon,
  Wifi,
  WifiOff,
  Sparkles,
  ArrowDown,
  RefreshCw,
  Repeat,
  Calendar,
  Home,
  Settings2,
  BarChart,
  MessageSquare,
  Users
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TopNav } from "@/components/layout/TopNav";
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/components/AuthProvider';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Loader } from '@/components/ui/loader';

// Feature card component with hover effects
const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  features = [], 
  isPremium = false 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  features?: string[];
  isPremium?: boolean;
}) => (
  <Card className="h-full transition-all hover:shadow-md hover:border-primary/30 hover:scale-[1.02]">
    <CardHeader>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <CardTitle className="flex items-center">
            {title}
            {isPremium && (
              <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300">
                <Sparkles className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}
          </CardTitle>
        </div>
      </div>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    {features.length > 0 && (
      <CardContent>
        <ul className="space-y-1">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm">
              <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    )}
  </Card>
);

const AppReviewCard = ({ 
  name, 
  rating, 
  review, 
  platform, 
  date 
}: { 
  name: string; 
  rating: number; 
  review: string; 
  platform: 'iOS' | 'Android'; 
  date: string;
}) => (
  <Card className="h-full transition-all hover:shadow-sm hover:border-muted/80">
    <CardHeader className="pb-2">
      <div className="flex justify-between items-center">
        <CardTitle className="text-base font-medium">{name}</CardTitle>
        <Badge variant={platform === 'iOS' ? 'outline' : 'secondary'} className="font-normal">
          {platform}
        </Badge>
      </div>
      <div className="flex items-center mt-1">
        {Array(5).fill(0).map((_, i) => (
          <span key={i} className={`text-lg ${i < rating ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}>
            ★
          </span>
        ))}
        <span className="text-xs text-muted-foreground ml-2">{date}</span>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-sm">{review}</p>
    </CardContent>
  </Card>
);

// Version info for mobile apps
const appVersions = {
  ios: {
    version: "3.2.1",
    minOSVersion: "iOS 14.0+",
    lastUpdated: "2 weeks ago",
    size: "42 MB",
    inAppPurchases: true
  },
  android: {
    version: "3.2.0",
    minOSVersion: "Android 9.0+",
    lastUpdated: "3 weeks ago", 
    size: "38 MB",
    inAppPurchases: true
  }
};

// User reviews
const userReviews = [
  { 
    name: "Jennifer K.", 
    rating: 5, 
    review: "This app has completely transformed how I manage my ADHD. The focus timer with variable interval options is exactly what I needed.",
    platform: 'iOS' as const, 
    date: "Apr 2, 2023" 
  },
  { 
    name: "Michael T.", 
    rating: 5, 
    review: "The ability to block distractions and track focus patterns over time has helped me identify when I'm most productive.",
    platform: 'Android' as const, 
    date: "Mar 28, 2023" 
  },
  { 
    name: "Sarah L.", 
    rating: 4, 
    review: "Great app overall. I especially love the task breakdown feature that helps with executive function. Would give 5 stars if the widgets were more customizable.",
    platform: 'iOS' as const, 
    date: "Apr 10, 2023" 
  },
  { 
    name: "David R.", 
    rating: 5, 
    review: "The integration with my calendar and the way it helps me plan my focus sessions around meetings has been a game changer.",
    platform: 'Android' as const, 
    date: "Apr 5, 2023" 
  }
];

const MobileApp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'ios' | 'android'>('ios');
  const [emailInput, setEmailInput] = useState('');
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string>("item-1");
  
  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Mock checking if app is already installed (would use actual API in production)
  useEffect(() => {
    const checkInstallation = () => {
      // For demo purposes, we'll randomly set this
      const hasApp = localStorage.getItem('hasInstalledApp') === 'true';
      setIsInstalled(hasApp);
    };
    
    checkInstallation();
  }, []);

  // Handle download click with progress simulation
  const handleDownload = () => {
    if (!isOnline) {
      showOfflineWarning();
      return;
    }
    
    setIsDownloading(true);
    setDownloadProgress(0);
    
    // Simulate download progress
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        const newValue = prev + Math.random() * 10;
        if (newValue >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsDownloading(false);
            setIsInstalled(true);
            localStorage.setItem('hasInstalledApp', 'true');
            toast({
              title: "Download Complete",
              description: "Easier Focus has been installed successfully.",
            });
          }, 500);
          return 100;
        }
        return newValue;
      });
    }, 300);
  };

  // Handle store button click (would open app store in production)
  const handleOpenStore = () => {
    if (!isOnline) {
      showOfflineWarning();
      return;
    }
    
    window.open(selectedPlatform === 'ios' ? 'https://apps.apple.com' : 'https://play.google.com', '_blank');
  };

  // Handle email link sending
  const handleSendLink = () => {
    if (!isOnline) {
      showOfflineWarning();
      return;
    }
    
    if (!emailInput.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }
    
    setIsEmailSending(true);
    
    // Simulate email sending
    setTimeout(() => {
      setIsEmailSending(false);
      setEmailInput('');
      toast({
        title: "Link Sent",
        description: `Download link has been sent to ${emailInput}`,
      });
    }, 1500);
  };

  // Show offline warning toast
  const showOfflineWarning = () => {
    toast({
      title: "You're Offline",
      description: "Please check your internet connection and try again.",
      variant: "destructive"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      
      {/* Offline Indicator */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-100 p-2 text-sm text-center flex items-center justify-center gap-2"
          >
            <WifiOff className="h-4 w-4" />
            <span>You're currently offline. Some features may not be available.</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Hero section */}
      <section className="container mx-auto px-4 py-16 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Text content */}
          <div className="space-y-6 text-center md:text-left relative z-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary">
                Easier Focus <span className="block md:inline">Mobile App</span>
              </h1>
            </motion.div>
            
            <motion.p 
              className="text-xl text-muted-foreground"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Transform your productivity with our ADHD-friendly focus management app. Available for iOS and Android.
            </motion.p>
            
            <motion.div
              className="flex flex-wrap gap-4 justify-center md:justify-start"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Button 
                size="lg" 
                onClick={() => {
                  setSelectedPlatform('ios');
                  if (isInstalled) {
                    toast({
                      title: "App Already Installed",
                      description: "You already have Easier Focus installed on this device."
                    });
                  } else {
                    handleOpenStore();
                  }
                }}
                className="gap-2"
              >
                <Download className="h-5 w-5" />
                Download for iOS
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => {
                  setSelectedPlatform('android');
                  if (isInstalled) {
                    toast({
                      title: "App Already Installed",
                      description: "You already have Easier Focus installed on this device."
                    });
                  } else {
                    handleOpenStore();
                  }
                }}
                className="gap-2"
              >
                <Download className="h-5 w-5" />
                Download for Android
              </Button>
            </motion.div>
            
            <motion.div
              className="flex items-center justify-center md:justify-start space-x-2 pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Badge variant="outline" className="text-sm font-normal">
                Latest: v{appVersions.ios.version}
              </Badge>
              <Badge variant="outline" className="text-sm font-normal">
                {appVersions.ios.size}
              </Badge>
              <Badge variant="outline" className="text-sm font-normal">
                {appVersions.ios.minOSVersion}
              </Badge>
            </motion.div>
            
            <motion.div
              className="pt-6 flex justify-center md:justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Button 
                variant="ghost" 
                onClick={() => setQrDialogOpen(true)}
                className="gap-2"
              >
                <QrCode className="h-4 w-4" />
                QR Code Download
              </Button>
            </motion.div>
          </div>
          
          {/* Phone mockup */}
          <motion.div
            className="relative flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl">
              <div className="w-[148px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
              <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
              <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
              <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
              <div className="rounded-[2rem] overflow-hidden w-[272px] h-[572px] bg-white dark:bg-gray-800">
                <div className="relative">
                  {/* App UI mockup - this would be a screenshot or interactive demo */}
                  <div className="bg-gradient-to-b from-primary/80 to-primary w-full h-[100px] pt-6">
                    <div className="flex justify-between items-center px-4">
                      <div className="text-white font-bold">Easier Focus</div>
                      <div className="flex space-x-2">
                        <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center">
                          <Bell className="h-3 w-3 text-white" />
                        </div>
                        <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center">
                          <Settings2 className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-[85px] left-3 right-3 rounded-lg bg-white dark:bg-gray-900 shadow-lg p-3">
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-sm font-bold">Focus Timer</div>
                      <Badge variant="outline" className="text-xs">Premium</Badge>
                    </div>
                    <div className="flex justify-center mb-4">
                      <div className="w-32 h-32 rounded-full border-8 border-primary/20 flex items-center justify-center">
                        <div className="text-2xl font-mono font-bold">25:00</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <Button variant="outline" size="sm" className="text-xs h-8">Focus</Button>
                      <Button variant="ghost" size="sm" className="text-xs h-8">Short</Button>
                      <Button variant="ghost" size="sm" className="text-xs h-8">Long</Button>
                    </div>
                    <Button className="w-full">Start Session</Button>
                  </div>
                  
                  {/* Bottom navigation */}
                  <div className="absolute bottom-0 left-0 right-0 h-14 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex justify-around items-center px-2">
                    <div className="flex flex-col items-center">
                      <Home className="h-5 w-5 text-primary" />
                      <span className="text-[10px] text-primary">Home</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">Focus</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Brain className="h-5 w-5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">ADHD</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <BarChart className="h-5 w-5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">Stats</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute -right-20 bottom-32 hidden lg:block">
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full h-auto py-6 px-6"
                onClick={() => setActiveAccordion(activeAccordion === "item-1" ? "item-2" : "item-1")}
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        </div>
        
        {/* Background decorations */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      </section>
      
      {/* App features */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">Comprehensive Mobile Features</h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to improve focus, manage ADHD symptoms, and boost productivity - in your pocket.
          </p>
        </div>
        
        <Accordion type="single" collapsible value={activeAccordion} onValueChange={setActiveAccordion} className="w-full max-w-6xl mx-auto mb-16">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-xl font-bold py-6">Core Features</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                <FeatureCard
                  icon={<Clock className="h-5 w-5" />}
                  title="Enhanced Focus Timer"
                  description="An ADHD-optimized timer with flow state tracking"
                  features={[
                    "Flow state visualization",
                    "Customizable work intervals",
                    "Distraction logging",
                    "Ambient sounds integration",
                    "Energy level tracking"
                  ]}
                />
                
                <FeatureCard
                  icon={<Brain className="h-5 w-5" />}
                  title="ADHD Support Tools"
                  description="Features designed specifically for ADHD management"
                  features={[
                    "Context switching assistance",
                    "Task breakdown helpers",
                    "Working memory support",
                    "Visual cues and reminders",
                    "Body doubling sessions"
                  ]}
                  isPremium
                />
                
                <FeatureCard
                  icon={<CircleSlash className="h-5 w-5" />}
                  title="Distraction Blocker"
                  description="Take control of your digital environment"
                  features={[
                    "App usage limiting",
                    "Notification management",
                    "Focus mode automation",
                    "Distraction pattern analysis",
                    "Screen time insights"
                  ]}
                />
                
                <FeatureCard
                  icon={<Battery className="h-5 w-5" />}
                  title="Energy Management"
                  description="Track and optimize your mental energy levels"
                  features={[
                    "Energy level visualization",
                    "Optimal focus time recommendations",
                    "Anti-fatigue techniques",
                    "Sleep quality integration",
                    "Recovery strategies"
                  ]}
                />
                
                <FeatureCard
                  icon={<Activity className="h-5 w-5" />}
                  title="Focus Analytics"
                  description="Data-driven insights to improve your focus"
                  features={[
                    "Focus session trends",
                    "Distraction pattern analysis",
                    "Energy level tracking",
                    "Productivity metrics",
                    "Custom reports"
                  ]}
                  isPremium
                />
                
                <FeatureCard
                  icon={<Users className="h-5 w-5" />}
                  title="Community Features"
                  description="Connect with others on your focus journey"
                  features={[
                    "Body doubling sessions",
                    "Accountability partners",
                    "Group challenges",
                    "Achievement sharing",
                    "Focus tips community"
                  ]}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-xl font-bold py-6">Premium Features</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                <FeatureCard
                  icon={<Sparkles className="h-5 w-5" />}
                  title="Advanced Focus Insights"
                  description="Deeper analytics and personalized recommendations"
                  features={[
                    "AI-powered focus recommendations",
                    "Personalized focus strategies",
                    "Long-term trend analysis",
                    "Focus score benchmarking",
                    "Weekly focus reports"
                  ]}
                  isPremium
                />
                
                <FeatureCard
                  icon={<Calendar className="h-5 w-5" />}
                  title="Calendar Integration"
                  description="Align your focus sessions with your schedule"
                  features={[
                    "Energy-based scheduling",
                    "Focus time blocking",
                    "Meeting preparation reminders",
                    "Context switching buffers",
                    "Focus forecasting"
                  ]}
                  isPremium
                />
                
                <FeatureCard
                  icon={<MessageSquare className="h-5 w-5" />}
                  title="Focus Coach"
                  description="Get personalized guidance from focus experts"
                  features={[
                    "1:1 coaching sessions",
                    "Personalized focus plans",
                    "Expert technique guidance",
                    "Progress accountability",
                    "ADHD-specific strategies"
                  ]}
                  isPremium
                />
                
                <FeatureCard
                  icon={<Check className="h-5 w-5" />}
                  title="Priority Support"
                  description="Get help when you need it most"
                  features={[
                    "24/7 help access",
                    "Priority response times",
                    "Custom feature requests",
                    "Early access to new features",
                    "Personalized onboarding"
                  ]}
                  isPremium
                />
                
                <FeatureCard
                  icon={<Repeat className="h-5 w-5" />}
                  title="Sync Across Devices"
                  description="Seamless experience across all your devices"
                  features={[
                    "Unlimited device syncing",
                    "Cross-platform compatibility",
                    "Real-time data updates",
                    "Offline mode with sync",
                    "Cloud backup for all data"
                  ]}
                  isPremium
                />
                
                <FeatureCard
                  icon={<Shield className="h-5 w-5" />}
                  title="Advanced Digital Wellbeing"
                  description="Take complete control of your digital environment"
                  features={[
                    "Advanced app blocking",
                    "Website restriction",
                    "Custom blocking schedules",
                    "Focus environment automation",
                    "Distraction-free modes"
                  ]}
                  isPremium
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        {/* Feature comparison */}
        <div className="max-w-5xl mx-auto mt-20">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold mb-2">Compare Free vs Premium</h3>
            <p className="text-muted-foreground">See how our premium features can take your focus to the next level</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Feature</th>
                  <th className="text-center p-4">Free</th>
                  <th className="text-center p-4 bg-primary/5">Premium</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Basic Focus Timer", free: true, premium: true },
                  { name: "Flow State Tracking", free: false, premium: true },
                  { name: "Distraction Logging", free: true, premium: true },
                  { name: "Ambient Sounds", free: true, premium: true },
                  { name: "Energy Level Tracking", free: false, premium: true },
                  { name: "Basic ADHD Support", free: true, premium: true },
                  { name: "Advanced ADHD Features", free: false, premium: true },
                  { name: "Basic Analytics", free: true, premium: true },
                  { name: "Advanced Analytics", free: false, premium: true },
                  { name: "Body Doubling", free: false, premium: true },
                  { name: "Calendar Integration", free: false, premium: true },
                  { name: "Multi-device Sync", free: "Limited", premium: "Unlimited" }
                ].map((feature, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-4 font-medium">{feature.name}</td>
                    <td className="p-4 text-center">
                      {feature.free === true ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : feature.free === false ? (
                        <CircleSlash className="h-5 w-5 text-red-300 mx-auto" />
                      ) : (
                        <span className="text-sm text-muted-foreground">{feature.free}</span>
                      )}
                    </td>
                    <td className="p-4 text-center bg-primary/5">
                      {feature.premium === true ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : feature.premium === false ? (
                        <CircleSlash className="h-5 w-5 text-red-300 mx-auto" />
                      ) : (
                        <span className="text-sm text-primary">{feature.premium}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="text-center mt-10">
            <Button size="lg" className="gap-2">
              <Sparkles className="h-5 w-5" />
              Upgrade to Premium
            </Button>
          </div>
        </div>
      </section>
      
      {/* User Reviews */}
      <section className="container mx-auto px-4 py-16 bg-gradient-to-b from-background to-primary/5 rounded-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">What Users Say</h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
            Hear from our community about how Easier Focus has helped them
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {userReviews.map((review, index) => (
            <AppReviewCard key={index} {...review} />
          ))}
        </div>
        
        <div className="flex justify-center mt-8">
          <Button variant="outline" className="gap-2" onClick={() => showOfflineWarning()}>
            View More Reviews
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      </section>
      
      {/* Get App Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold">Get The App Today</h2>
            <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
              Start improving your focus and productivity on the go
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
            <Button 
              className="w-full md:w-auto" 
              size="lg" 
              onClick={() => handleOpenStore()}
            >
              <Smartphone className="mr-2 h-5 w-5" />
              Download App
            </Button>
            
            <div className="text-center text-muted-foreground">or</div>
            
            <div className="flex flex-col w-full md:w-auto gap-4">
              <div className="flex gap-2">
                <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full"
                />
                <Button 
                  variant="outline" 
                  onClick={handleSendLink}
                  disabled={isEmailSending}
                >
                  {isEmailSending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Link"
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                We'll email you a download link for the app
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Download Easier Focus Mobile</DialogTitle>
            <DialogDescription>
              Scan this QR code with your phone camera to download the app
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-6">
            <div className="border border-border p-4 bg-white rounded-md">
              <div className="w-48 h-48 bg-[url('/qr-placeholder.png')] bg-contain bg-no-repeat bg-center">
                {/* This would be an actual QR code image in production */}
                <div className="w-full h-full flex items-center justify-center">
                  <QrCode className="h-24 w-24 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2 items-center flex-1">
              <Input 
                placeholder="Email me the download link" 
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
              <Button onClick={handleSendLink} disabled={isEmailSending}>
                {isEmailSending ? <Loader className="h-4 w-4 animate-spin" /> : "Send"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MobileApp; 