import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  BrainCircuit,
  ArrowRight, 
  CheckCircle, 
  ShieldCheck,
  Timer, 
  Users, 
  ArrowRightLeft, 
  BatteryCharging,
  Zap,
  BarChart2,
  Star,
  ExternalLink,
  GitBranch,
  Sparkles,
  LightbulbIcon,
  Focus,
  Coffee,
  MoveRight,
  ChevronRight,
  FileText,
  Play,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  ArrowDown,
  Check,
  Headphones,
  CheckCircle2,
  Laptop,
  BookOpen,
  Heart,
  ListChecks,
  Activity,
  TrendingUp,
  UserPlus
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/components/auth/AuthProvider';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Logo } from '@/components/ui/logo';
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { LandingHeader } from '@/components/layout/LandingHeader';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  }
};

// Floating animation for hero elements - Slower duration
const floatingAnimation = {
  y: ['-3px', '3px'],
  transition: {
    repeat: Infinity,
    repeatType: 'reverse' as const,
    duration: 4.5, // Increased duration for slower effect
    ease: 'easeInOut'
  }
};

// Combined & Refined Features List
const featuresListHero = [
  { text: 'ADHD-Centric Task Management' },
  { text: 'AI-Powered Focus Timer & Flow Tracking' },
  { text: 'Personalized Energy Optimization' },
  { text: 'Intelligent Distraction Blocking' },
  { text: 'Community Body Doubling' },
  { text: 'Context Switching Support' },
  { text: 'Digital Wellness Insights' },
];

// Detailed features combining best of all files - UPDATED PATHS
const detailedFeatures = [
  {
    title: "Executive Function Support",
    description: "Tools to aid working memory, task initiation, planning, and organization – crucial for ADHD.",
    icon: BrainCircuit,
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    // path: '/easier-focus/app/executive-function', // Keep commented - Route not ready
  },
  {
    title: "Advanced Flow Timer",
    description: "Track focus, manage distractions, and utilize ambient sounds with our enhanced Pomodoro & flow state system.",
    icon: Timer,
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    path: '/easier-focus/app/pomodoro',
  },
  {
    title: "Intelligent Distraction Blocking",
    description: "Minimize disruptions with AI-powered website/app blocking and personalized environment optimization.",
    icon: ShieldCheck,
    color: "text-red-700",
    bgColor: "bg-red-50",
    path: '/easier-focus/app/blocker',
  },
  {
    title: "Community Body Doubling",
    description: "Work alongside others virtually in scheduled or on-demand sessions for accountability and focus.",
    icon: Users,
    color: "text-teal-700",
    bgColor: "bg-teal-50",
    path: '/easier-focus/app/community',
  },
  {
    title: "Personalized Energy Management",
    description: "Track energy patterns, understand correlations with focus, and optimize your schedule accordingly.",
    icon: BatteryCharging,
    color: "text-green-700",
    bgColor: "bg-green-50",
    path: '/easier-focus/app/mood',
  },
  {
    title: "ADHD-Friendly Task Management",
    description: "Visually organize tasks, break down projects, estimate cognitive load, and prioritize effectively.",
    icon: ListChecks,
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    path: '/easier-focus/app/tasks',
  },
  {
    title: "Context Switching Assistant",
    description: "Reduce cognitive load when transitioning between tasks with structured protocols and mental preparation.",
    icon: ArrowRightLeft,
    color: "text-cyan-700",
    bgColor: "bg-cyan-50",
    path: '/easier-focus/app/context-switching',
  },
  {
    title: "Digital Wellness & Anti-Googlitis",
    description: "Build healthier tech habits, manage 'research rabbit holes', and track your digital well-being.",
    icon: Heart,
    color: "text-pink-700",
    bgColor: "bg-pink-50",
    // Assuming this might be part of strategies or a dedicated section TBD
    // path: '/easier-focus/app/anti-googlitis', // Path TBD/Route Missing - Comment out link
  },
  {
    title: "Insightful Analytics",
    description: "Track focus patterns, productivity trends, and distraction triggers with detailed, actionable reports.",
    icon: BarChart2,
    color: "text-indigo-700",
    bgColor: "bg-indigo-50",
    path: '/easier-focus/app/analytics',
  }
];

// Combined & Refined Testimonials
const testimonials = [
  {
    quote: "The AI-powered distraction prediction is incredible. It literally alerts me before I fall into a distraction spiral. EasierFocus has transformed my productivity.",
    author: "Alex C.",
    role: "Software Engineer with ADHD",
  },
  {
    quote: "Body doubling sessions are a game-changer. It's like having an accountability partner on demand. The energy management tools have also been surprisingly effective.",
    author: "Morgan J.",
    role: "Marketing Director",
  },
  {
    quote: "As a student, the Flow Timer and Anti-Googlitis features are lifesavers. I'm getting more done in less time, without feeling overwhelmed.",
    author: "Taylor P.",
    role: "Graduate Student",
  },
  {
    quote: "Finally, a focus app that *gets* ADHD. The task breakdown and executive function support make daunting projects feel manageable. Highly recommend!",
    author: "Jamie T.",
    role: "Graphic Designer",
  },
  {
    quote: "I've tried many focus apps, but EasierFocus stands out with its personalized strategies and truly insightful analytics. It's like having a personal focus coach.",
    author: "David L.",
    role: "Entrepreneur",
  }
];

// Helper to get initials from name
const getInitials = (name: string): string => {
  const names = name.split(' ');
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
};

// Stats data - Refined
const stats = [
  { value: '92%', label: 'Reported Focus Improvement', icon: BrainCircuit },
  { value: '75K+', label: 'Active Users', icon: Users },
  { value: '4.9 ★', label: 'Average User Rating', icon: Star },
  { value: '60%', label: 'Reduction in Distractions', icon: ShieldCheck }
];

// Refined Use Cases
const useCases = {
  adhd: {
    title: 'Optimize for ADHD',
    description: 'Tackle executive function challenges, manage impulsivity, and regulate attention with tools built for neurodivergent minds.',
    features: [
      'Task breakdown & visualization tools',
      'Cognitive load estimation & management',
      'Impulsivity control via Anti-Googlitis',
      'Scheduled & on-demand body doubling',
      'Energy-based planning & focus strategies'
    ],
    cta: 'Explore ADHD Tools',
    icon: BrainCircuit
  },
  productivity: {
    title: 'Boost Productivity',
    description: 'Maximize deep work, minimize context switching costs, and build sustainable high-performance habits.',
    features: [
      'Flow state timer with analytics',
      'Advanced distraction blocking',
      'Context switching assistance',
      'Productivity trend analysis',
      'Integration with calendar systems (coming soon)'
    ],
    cta: 'Enhance Productivity',
    icon: Zap
  },
  wellness: {
    title: 'Improve Digital Wellness',
    description: 'Build a healthier relationship with technology, reduce digital fatigue, and protect your mental energy.',
    features: [
      'Digital wellness tracking & scoring',
      'Mindful technology usage prompts',
      'Scheduled digital detox periods',
      'Anti-Googlitis to prevent doomscrolling',
      'Personalized wellness insights'
    ],
    cta: 'Cultivate Wellness',
    icon: Heart
  }
};

// Pricing Plans - Simplified structure from LandingPage.tsx, content adapted
const pricingPlans = [
  {
    name: "Free",
    price: "0",
    description: "Essential tools to begin your focus journey",
    features: [
      "Basic Focus Timer",
      "Limited Distraction Blocking",
      "Energy Level Tracking",
      "Community Forum Access",
      "7-Day Focus History"
    ],
    cta: "Get Started Free",
    popular: false
  },
  {
    name: "Pro",
    price: "9.99",
    description: "Unlock your full potential",
    features: [
      "Everything in Free, plus:",
      "Advanced AI Focus Timer & Flow Tracking",
      "Comprehensive Distraction Blocking",
      "Unlimited Body Doubling Sessions",
      "ADHD Task Management & EF Support",
      "Context Switching Assistance",
      "Full Digital Wellness Suite",
      "Detailed Analytics & Reporting",
      "Priority Support"
    ],
    cta: "Start 14-Day Free Trial",
    popular: true
  },
  {
    name: "Team",
    price: "Contact",
    description: "For collaborative focus",
    features: [
      "Everything in Pro, plus:",
      "Centralized Team Management",
      "Team Analytics Dashboard",
      "Group Body Doubling",
      "Admin & Billing Controls",
      "Dedicated Onboarding & Support"
    ],
    cta: "Contact Sales",
    popular: false
  }
];

// FAQs - Taken from LandingPage.tsx, potentially refine later
const faqs = [
  {
    question: "How is EasierFocus specifically designed for ADHD?",
    answer: "We incorporate principles of cognitive behavioral therapy (CBT) and ADHD coaching. Features like visual timers, task chunking, gamification for dopamine regulation, body doubling, and executive function supports directly address common ADHD challenges."
  },
  {
    question: "Can I use EasierFocus on multiple devices?",
    answer: "Yes! Your subscription allows access via our web app and upcoming mobile apps (iOS & Android). Your data syncs seamlessly across all platforms."
  },
  {
    question: "What makes EasierFocus different from other focus apps?",
    answer: "Our holistic approach combines focus techniques, energy management, digital wellness, and specific ADHD support into one integrated platform. The AI-powered insights and community features also set us apart."
  },
  {
    question: "Is my data secure with EasierFocus?",
    answer: "Absolutely. We prioritize data privacy and security using industry-standard encryption (AES-256) and secure infrastructure. We comply with GDPR and CCPA. You own your data."
  },
  {
    question: "What if I'm not satisfied with the Pro plan?",
    answer: "We offer a 30-day money-back guarantee on our Pro plan. If EasierFocus doesn't meet your needs within the first month, contact support for a full refund, no questions asked."
  }
];

// FAQ Data (Define this near the top with other data arrays)
const faqData = [
  {
    question: "Is EasierFocus suitable for people without an ADHD diagnosis?",
    answer: "Absolutely! While designed with ADHD needs in mind, the focus techniques, task management, and digital wellness tools benefit anyone looking to improve concentration, productivity, and manage distractions in today's world."
  },
  {
    question: "How does the AI work in EasierFocus?",
    answer: "Our AI analyzes your focus patterns, energy levels, and common distractions (based on your usage and optional integrations) to provide personalized recommendations, predict potential focus dips, and suggest optimal work/break schedules."
  },
  {
    question: "What is Body Doubling?",
    answer: "Body Doubling is a productivity strategy where you work alongside another person (virtually in our app) to help maintain focus and accountability. It's particularly helpful for tasks that are easy to procrastinate on."
  },
  {
    question: "Is my data secure and private?",
    answer: "Yes, data security and user privacy are paramount. We use industry-standard encryption and secure infrastructure (Supabase). You have full control over your data and optional integrations. Please see our Privacy Policy for full details."
  },
  {
    question: "What platforms is EasierFocus available on?",
    answer: "EasierFocus is available as a web application accessible from any modern browser on desktop and mobile. Native mobile apps for iOS and Android are currently under development using Capacitor."
  },
  {
    question: "What does the free plan include?",
    answer: "The free plan offers access to core features like the basic Pomodoro timer, standard task management, and manual focus session tracking. Advanced AI features, detailed analytics, body doubling, and integrations are part of the Pro plan."
  }
];

// --- Helper Component for Feature Badge ---
const FeatureBadge: React.FC<{ text: string; index: number }> = ({ text, index }) => (
  <motion.div
    variants={itemVariants}
    custom={index} // Pass index for staggered animation delay
    className="relative"
    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
  >
    <Badge 
      variant="secondary"
      className="text-sm font-medium bg-white/80 backdrop-blur-sm shadow-sm border border-gray-200 px-4 py-2 cursor-default dark:bg-gray-800/80 dark:border-gray-700 dark:text-gray-300"
    >
      {text}
    </Badge>
    {/* Optional: Add subtle glow effect on hover? */}
  </motion.div>
);

// --- Component Start ---
export default function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [activeUseCaseTab, setActiveUseCaseTab] = useState('adhd');
  const heroRef = useRef(null);
  const featuresRef = useRef<HTMLDivElement>(null); // Ref for scrolling to features
  
  // Auto rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 7000); // Rotate testimonials every 7 seconds
    return () => clearInterval(interval);
  }, []);

  // Example parallax effect for background shapes/gradients
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);

  const handleGetStarted = () => {
    if (loading) return;
    if (user) {
      console.log('User is logged in, navigating to dashboard');
      navigate('/app/dashboard');
    } else {
      console.log('User is not logged in, staying on landing');
      navigate('/auth/signup');
    }
  };

  const handleLearnMore = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-black">
      <Helmet>
        <title>EasierFocus - World's Best Focus & Productivity App</title>
        <meta name="description" content="Achieve unparalleled focus and productivity with EasierFocus. AI-powered tools, ADHD support, energy management, and more. Get started today!" />
      </Helmet>
      
      {/* Replace placeholder with actual LandingHeader */}
      <LandingHeader /> 

      {/* --- Hero Section --- */}
      <motion.section 
        ref={heroRef}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative flex flex-col items-center justify-center pt-32 pb-24 md:pt-40 md:pb-32 text-center overflow-hidden z-10"
      >
        {/* Background Shapes with parallax */}
        <motion.div style={{ y: y1 }} className="absolute top-0 left-1/4 w-72 h-72 bg-purple-200/50 dark:bg-purple-900/30 rounded-full filter blur-3xl opacity-50 -z-10" />
        <motion.div style={{ y: y2 }} className="absolute bottom-0 right-1/4 w-72 h-72 bg-blue-200/50 dark:bg-blue-900/30 rounded-full filter blur-3xl opacity-50 -z-10" />
        {/* Floating icons - Changed icons */}
        <motion.div animate={floatingAnimation} className="absolute top-20 right-10 md:right-20 -z-10">
          <BrainCircuit className="w-16 h-16 text-teal-400/50 opacity-60 dark:text-teal-600/50" /> {/* Changed Icon & Opacity */}
        </motion.div>
        <motion.div animate={floatingAnimation} style={{ animationDelay: '1s' }} className="absolute bottom-10 left-10 md:left-20 -z-10">
          <Sparkles className="w-20 h-20 text-amber-400/50 opacity-60 dark:text-amber-600/50" /> {/* Changed Icon & Opacity */}
        </motion.div>
        
        {/* Badge */}
        <motion.div variants={itemVariants} className="mb-6">
          <Badge 
            variant="outline"
            className="py-1 px-3 rounded-full text-sm font-semibold bg-white/70 dark:bg-gray-800/70 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 shadow-md"
          >
            <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
            Unlock Your Peak Focus Potential
          </Badge>
        </motion.div>

        {/* Placeholder for a central visual element */}
        <motion.div variants={itemVariants} className="mb-8">
          {/* <img src="/path/to/hero-visual.svg" alt="EasierFocus visual representation" className="w-64 h-auto mx-auto" /> */}
          {/* Or a more complex animated component */}
        </motion.div>

        {/* Main Headline */}
        <motion.h1 
          variants={itemVariants}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-teal-500 dark:from-purple-400 dark:via-blue-400 dark:to-teal-300 text-transparent bg-clip-text"
        >
          Master Your Focus. Effortlessly.
        </motion.h1>

        {/* Sub-headline */}
        <motion.p 
          variants={itemVariants}
          className="max-w-xl md:max-w-2xl mx-auto text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8"
        >
          EasierFocus combines neuro-adaptive tools, AI insights, and community support to help you conquer distractions and achieve deep work.
        </motion.p>

        {/* Call to Action Buttons */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12"
        >
          <Button 
            size="lg" 
            onClick={handleGetStarted} 
            disabled={loading}
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg transform transition duration-300 ease-in-out hover:scale-105",
              loading && "opacity-50 cursor-not-allowed"
            )}
          >
            {loading ? "Loading..." : (user ? 'Go to Dashboard' : 'Get Started Free')}
            {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
          </Button>
          {/* Added Secondary CTA */}
          <Button 
            variant="outline" 
            size="lg" 
            onClick={handleLearnMore}
            className="font-semibold shadow-sm border-gray-300 dark:border-gray-700 dark:text-gray-300 transform transition duration-300 ease-in-out hover:scale-105 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Learn More
            <ArrowDown className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>

        {/* Feature Badges */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto"
        >
          {featuresListHero.map((feature, index) => (
            <FeatureBadge key={index} text={feature.text} index={index} />
          ))}
        </motion.div>
      </motion.section>

      {/* --- Other Sections --- */}
      
      {/* --- Features Section --- */}
      <section ref={featuresRef} id="features" className="py-20 md:py-28 bg-white dark:bg-gray-900 border-y dark:border-gray-800 relative">
        <div className="container mx-auto px-4">
          {/* Section Header */} 
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 md:mb-16 max-w-3xl mx-auto"
          >
            <Badge variant="outline" className="mb-4 text-sm py-1 px-3 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30">Core Capabilities</Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-gray-900 dark:text-white">A Holistic Toolkit for Enhanced Focus</h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">
              Leverage scientifically-backed features designed specifically for ADHD, focus challenges, and maximizing your cognitive potential.
            </p>
          </motion.div>
          
          {/* Feature Grid */} 
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {detailedFeatures.map((feature, idx) => {
              const FeatureIcon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants} 
                  className="flex"
                >
                  <Card 
                    className={cn(
                      "bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl w-full flex flex-col", 
                      "transition-all duration-300 ease-in-out",
                      "hover:shadow-xl hover:-translate-y-1.5 hover:border-purple-300 dark:hover:border-purple-600 dark:hover:bg-gray-800"
                    )}
                  >
                    <CardHeader className="flex flex-row items-center gap-4 pb-3">
                      <div className={cn(
                        "rounded-lg p-3 w-fit",
                        feature.bgColor || 'bg-purple-50', // Fallback bg color
                        'dark:bg-opacity-20' // Adjust opacity for dark mode
                      )}>
                        <FeatureIcon className={cn("h-6 w-6", feature.color || 'text-purple-700', 'dark:opacity-90')} />
                      </div>
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow pb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                    </CardContent>
                    {/* Conditionally render footer/link based on feature.path */}
                    {feature.path && (
                       <CardFooter className="pt-0 mt-auto pb-5 pr-5 justify-end"> 
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="group text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-300 px-3" 
                            asChild
                          >
                            <Link to={feature.path}> {/* Link is only rendered if path exists */}
                              Learn More 
                              <ChevronRight className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                            </Link>
                        </Button>
                       </CardFooter>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* --- Why Choose Us? (Differentiators) Section --- */}
      <section id="why-us" className="py-20 md:py-28 bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-black">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 md:mb-16 max-w-3xl mx-auto"
          >
            <Badge variant="outline" className="mb-4 text-sm py-1 px-3 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30">Our Difference</Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-gray-900 dark:text-white">Designed for Your Brain</h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">
              EasierFocus isn't just another productivity app. We build with neurodiversity and evidence-based science at the core.
            </p>
          </motion.div>

          {/* Differentiators Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {[ // Differentiators based on ssot8001
              {
                icon: LightbulbIcon,
                title: "Neurodiversity First",
                desc: "Optimized UI/UX for ADHD and focus challenges, reducing cognitive load."
              },
              {
                icon: BrainCircuit,
                title: "Evidence-Based Science",
                desc: "Features grounded in neuroscience and proven focus techniques."
              },
              {
                icon: GitBranch, // Representing personalization/adaptivity
                title: "Personalized & Adaptive",
                desc: "Tailored strategies and difficulty that adjusts to your cognitive state."
              }
            ].map((diff, index) => {
              const DiffIcon = diff.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="text-center p-6 bg-white/60 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 text-purple-700 dark:text-blue-300 shadow-sm">
                    <DiffIcon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{diff.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{diff.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* --- Testimonials Section --- */}
      <section id="testimonials" className="py-20 md:py-28 bg-gradient-to-b from-blue-50 via-purple-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 relative">
        <div className="container mx-auto px-4">
          {/* Section Header */} 
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 md:mb-16 max-w-3xl mx-auto"
          >
            <Badge variant="outline" className="mb-4 text-sm py-1 px-3 border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/30">Real Results</Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-gray-900 dark:text-white">Hear From Our Community</h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">
              Individuals with ADHD and focus challenges are transforming their productivity and well-being with EasierFocus.
            </p>
          </motion.div>
          
          {/* Testimonial Carousel/Slider */} 
          <div className="max-w-3xl mx-auto relative overflow-hidden">
            <AnimatePresence mode="wait"> {/* Use mode='wait' for smooth transitions */}
              <motion.div
                key={currentTestimonial} // Change key triggers animation
                initial={{ opacity: 0, x: 60 }} // Animate in from right
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }} // Animate out to left
                transition={{ duration: 0.4, ease: "easeInOut" }}
                // Enhanced Card Styling
                className="relative bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-gray-800/70 rounded-xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden"
              >
                 {/* Subtle background pattern (optional) */}
                 {/* <div className="absolute inset-0 opacity-5 dark:opacity-[0.03] bg-[url('/path/to/subtle-pattern.svg')]" /> */}

                <div className="relative z-10 flex flex-col items-center text-center">
                  {/* Quotation Marks - Enhanced Styling */}
                  <span className="text-7xl text-purple-200/80 dark:text-purple-800/50 font-serif absolute -top-3 -left-3 opacity-70">"</span>
                  <blockquote className="text-base sm:text-lg italic text-gray-700 dark:text-gray-300 mb-6">
                    {testimonials[currentTestimonial].quote}
                  </blockquote>
                  <span className="text-7xl text-purple-200/80 dark:text-purple-800/50 font-serif absolute -bottom-6 -right-3 opacity-70">"</span>
                  
                  {/* Author Info */} 
                  <div className="flex items-center gap-3 mt-4">
                    <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-purple-200 dark:border-purple-700">
                      {/* Corrected: Removed AvatarImage as testimonial.avatar doesn't exist */}
                      {/* <AvatarImage src={testimonials[currentTestimonial].avatar} alt={testimonials[currentTestimonial].author} /> */} 
                      <AvatarFallback>{getInitials(testimonials[currentTestimonial].author)}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <div className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white">{testimonials[currentTestimonial].author}</div>
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{testimonials[currentTestimonial].role}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* Navigation Dots - Enhanced */}
            <div className="flex justify-center mt-8 gap-2.5">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all duration-300 ease-in-out",
                    index === currentTestimonial 
                      ? 'bg-purple-600 dark:bg-purple-400 scale-125' 
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                  )}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- Stats Section --- */}
      <section className="py-16 bg-white dark:bg-gray-900 border-b dark:border-gray-800 relative">
        <div className="container mx-auto px-4">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            variants={containerVariants} // Stagger children
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {stats.map((stat, index) => {
              const StatIcon = stat.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants} // Individual item animation
                  className="text-center flex flex-col items-center"
                >
                  {/* Enhanced Icon Styling */}
                  <div className="mb-3 relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-tl from-purple-200 to-blue-200 dark:from-purple-800/50 dark:to-blue-800/50 rounded-full blur-md opacity-60 animate-pulse-slow"></div>
                    <div className="relative inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 text-purple-700 dark:text-blue-200 shadow-md">
                      <StatIcon className="h-6 w-6" />
                    </div>
                  </div>
                  {/* Stat Value */} 
                  <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">
                    {stat.value}
                  </h3>
                  {/* Stat Label */} 
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {stat.label}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* --- Use Cases Section --- */}
      <section id="use-cases" className="py-20 md:py-28 bg-gradient-to-b from-white via-purple-50 to-blue-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 relative">
         <div className="container mx-auto px-4">
           {/* Section Header */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, amount: 0.3 }}
             transition={{ duration: 0.5 }}
             className="text-center mb-12 md:mb-16 max-w-3xl mx-auto"
           >
             <Badge variant="outline" className="mb-4 text-sm py-1 px-3 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30">Tailored Solutions</Badge>
             <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-gray-900 dark:text-white">Focus Strategies for Your Needs</h2>
             <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">
               Whether managing ADHD, optimizing remote work, or improving study habits, EasierFocus adapts to you.
             </p>
           </motion.div>
           
           {/* Use Cases Tabs */} 
           <motion.div 
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, amount: 0.2 }}
             transition={{ duration: 0.6 }}
             className="max-w-4xl mx-auto"
           >
             <Tabs defaultValue={activeUseCaseTab} onValueChange={setActiveUseCaseTab} className="w-full">
               {/* Tabs List - Improved Styling */} 
               <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-100 dark:bg-gray-800 rounded-lg p-1.5 h-auto shadow-inner">
                 {Object.entries(useCases).map(([key, useCase]) => {
                   const UseCaseIcon = useCase.icon;
                   return (
                     <TabsTrigger 
                       key={key}
                       value={key} 
                       className={cn(
                         "flex items-center justify-center gap-2 rounded-md py-2.5 px-2 text-sm sm:text-base font-medium transition-colors duration-200",
                         "text-gray-600 dark:text-gray-400",
                         "data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-300 data-[state=active]:shadow-md",
                         "focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800"
                       )}
                     >
                       <UseCaseIcon className="h-5 w-5 shrink-0" /> 
                       <span className="hidden sm:inline">{useCase.title}</span>
                       {/* Simplified mobile label */} 
                       <span className="sm:hidden">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                     </TabsTrigger>
                   );
                 })}
               </TabsList>
               
               {/* Tabs Content - Enhanced Styling & Animation */} 
               {Object.entries(useCases).map(([key, useCase]) => (
                 <TabsContent 
                   key={key} 
                   value={key} 
                   className="mt-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                 >
                   <motion.div
                     // Animate content changes
                     initial={{ opacity: 0, y: 15 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.4, ease: "easeOut" }}
                     className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-lg rounded-xl overflow-hidden"
                   >
                     <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 p-6">
                       <CardTitle className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">{useCase.title}</CardTitle>
                       <CardDescription className="mt-2 text-base text-gray-600 dark:text-gray-400">{useCase.description}</CardDescription>
                     </CardHeader>
                     <CardContent className="p-6">
                       <h4 className="mb-3 font-semibold text-gray-700 dark:text-gray-300">Key Features:</h4>
                       <ul className="space-y-3">
                         {useCase.features.map((feature, index) => (
                           <li key={index} className="flex items-start gap-3">
                             <CheckCircle className="h-5 w-5 text-purple-500 dark:text-purple-400 shrink-0 mt-0.5" />
                             <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                           </li>
                         ))}
                       </ul>
                     </CardContent>
                     {/* Footer with CTA - Refined */}
                     <CardFooter className="bg-gray-50 dark:bg-gray-800/30 mt-auto p-6 border-t dark:border-gray-700">
                       <Button 
                          asChild 
                          className={cn(
                             buttonVariants(), 
                             "w-full sm:w-auto ml-auto", // Align right on larger screens
                             "bg-purple-600 hover:bg-purple-700 text-white"
                          )}
                          size="default" // Changed from "md" to "default"
                       >
                         {/* Link to signup or specific feature area */}
                         <Link to={"/auth/signup"}> 
                           {useCase.cta}
                           <ArrowRight className="ml-2 h-4 w-4" />
                         </Link>
                       </Button>
                     </CardFooter>
                   </motion.div>
                 </TabsContent>
               ))}
             </Tabs>
           </motion.div>
         </div>
       </section>

      {/* --- How It Works Section --- */}
      <section id="how-it-works" className="py-20 md:py-28 bg-white dark:bg-gray-900 relative">
        <div className="container mx-auto px-4">
          {/* Section Header */} 
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 md:mb-16 max-w-3xl mx-auto"
          >
            <Badge variant="outline" className="mb-4 text-sm py-1 px-3 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/30">Simple Steps</Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-gray-900 dark:text-white">Get Focused in Minutes</h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">
              Follow our simple process to integrate EasierFocus into your workflow and start achieving more.
            </p>
          </motion.div>
          
          {/* Steps Grid/Timeline */} 
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* Dashed line connecting steps on larger screens */} 
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gray-300 dark:bg-gray-700 border-t border-dashed border-gray-400 dark:border-gray-600 transform -translate-y-1/2" style={{ zIndex: 0 }}></div>
            
            {[ 
              { num: 1, title: "Sign Up & Personalize", desc: "Create your account and tell us about your focus goals and challenges.", icon: UserPlus },
              { num: 2, title: "Choose Your Tools", desc: "Explore features like the Flow Timer, Task Manager, or Body Doubling.", icon: Zap },
              { num: 3, title: "Track & Optimize", desc: "Gain insights from analytics and adapt your strategies for peak performance.", icon: BarChart2 }
            ].map((step, index) => {
              const StepIcon = step.icon;
              return (
                <motion.div 
                  key={index} 
                  variants={itemVariants}
                  className="relative z-10 flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="mb-4 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white font-bold text-xl shadow-lg">
                    {step.num}
                  </div>
                  <div className="mb-3 flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{step.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{step.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* --- ADDED Pricing Section --- */}
      <section id="pricing" className="py-20 md:py-28 bg-gradient-to-b from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-black">
        <div className="container mx-auto px-4">
          {/* Section Header */} 
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 md:mb-16 max-w-3xl mx-auto"
          >
            <Badge variant="outline" className="mb-4 text-sm py-1 px-3 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30">Simple Plans</Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-gray-900 dark:text-white">Choose Your Focus Plan</h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">
              Select the plan that best fits your needs and start enhancing your focus today.
            </p>
          </motion.div>
          
          {/* Pricing Grid */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch" // Use items-stretch for equal height cards
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {pricingPlans.map((plan, index) => (
              <motion.div 
                key={plan.name}
                variants={itemVariants} 
                className={cn("flex", plan.popular && "lg:scale-105")}
              >
                <Card className={cn(
                  "flex flex-col w-full rounded-xl border shadow-sm transition-all duration-300",
                  plan.popular 
                    ? "border-primary border-2 shadow-lg bg-primary/5 dark:bg-primary/10"
                    : "bg-card border-border hover:shadow-md"
                )}>
                  <CardHeader className={cn("pb-4", plan.popular && "pt-8")}>
                    {plan.popular && (
                      <Badge variant="default" className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-0.5 text-xs font-semibold">
                        Most Popular
                      </Badge>
                    )}
                    <CardTitle className="text-xl font-semibold mb-1 text-gray-900 dark:text-white">{plan.name}</CardTitle>
                    <CardDescription className="text-muted-foreground h-10">{plan.description}</CardDescription>
                    <div className="mt-4 flex items-baseline gap-1">
                      {plan.price === "Contact" ? (
                        <span className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Contact Us</span>
                      ) : (
                        <>
                          <span className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">${plan.price}</span>
                          <span className="text-sm text-muted-foreground">/ month</span>
                        </>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-3 pt-0 pb-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span className={cn(
                            "text-sm",
                            feature.toLowerCase().includes("everything in") ? "text-muted-foreground italic" : "text-gray-700 dark:text-gray-300"
                          )}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="mt-auto pt-0 border-t border-border/50 bg-card/50 dark:bg-gray-800/20 py-5">
                    <Button 
                      asChild 
                      size="lg"
                      className={cn(
                        "w-full font-semibold",
                        plan.popular ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                      )}
                    >
                      <Link to={plan.price === "Contact" ? '/contact' : '/auth/signup'}> 
                        {plan.cta}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- Final CTA Section --- */}
      <section className="py-20 md:py-28 bg-gradient-to-r from-purple-600 via-blue-600 to-teal-500 dark:from-purple-800 dark:via-blue-800 dark:to-teal-700 text-white">
        <div className="container mx-auto px-4">
           <motion.div
              initial={{ opacity: 0, y: 30 } as any}
              whileInView={{ opacity: 1, y: 0 } as any}
              transition={{ duration: 0.6, ease: "easeOut" } as any}
              viewport={{ once: true, amount: 0.3 } as any}
              className="max-w-3xl mx-auto text-center"
            >
             <Sparkles className="h-10 w-10 mx-auto mb-4 text-purple-200 dark:text-purple-300 opacity-80" />
             <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">Ready to Transform Your Focus?</h2>
             <p className="text-lg md:text-xl text-purple-100 dark:text-purple-200 mb-10 max-w-2xl mx-auto">
               Join thousands of users finding flow, managing ADHD, and building healthier digital habits. Start your journey today with a free trial.
             </p>
             <div className="flex flex-col sm:flex-row gap-4 justify-center">
               {/* Primary CTA Button */}
               <Button 
                  size="lg" 
                  onClick={handleGetStarted} // Uses the same logic as hero button
                  disabled={loading}
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "bg-white text-purple-700 hover:bg-gray-100",
                    "dark:bg-gray-100 dark:text-purple-800 dark:hover:bg-gray-200",
                    "shadow-lg hover:scale-[1.03] transition-transform duration-200 group",
                    loading && "opacity-50 cursor-not-allowed"
                  )}
                >
                 {loading ? "Loading..." : (user ? 'Go to Dashboard' : 'Start Free Trial')}
                 {!loading && <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />}
               </Button>
               {/* Optional: Secondary Button (e.g., Explore Features) - Uncommented and updated onClick */}
               <Button 
                  size="lg" 
                  variant="outline" 
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" }),
                    "border-purple-200 text-white hover:bg-white/10 hover:text-white",
                    "dark:border-purple-300 dark:hover:bg-white/15", 
                    "hover:scale-[1.03] transition-transform duration-200"
                  )}
                  onClick={handleLearnMore} // Use the same scroll handler as the hero secondary CTA
               >
                  Explore Features
               </Button> 
             </div>
           </motion.div>
        </div>
      </section>

      {/* --- FAQ Section --- */}
      <section id="faq" className="py-20 md:py-28 bg-gray-50 dark:bg-gray-950 border-t dark:border-gray-800 relative">
        <div className="container mx-auto px-4">
          {/* Section Header */} 
          <motion.div 
            initial={{ opacity: 0, y: 20 } as any}
            whileInView={{ opacity: 1, y: 0 } as any}
            viewport={{ once: true, amount: 0.3 } as any}
            transition={{ duration: 0.5 } as any}
            className="text-center mb-12 md:mb-16 max-w-3xl mx-auto"
          >
            <Badge variant="outline" className="mb-4 text-sm py-1 px-3 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800/50">Got Questions?</Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-gray-900 dark:text-white">Frequently Asked Questions</h2>
          </motion.div>
          
          {/* FAQ Accordion */} 
          <motion.div 
            initial={{ opacity: 0, y: 30 } as any}
            whileInView={{ opacity: 1, y: 0 } as any}
            viewport={{ once: true, amount: 0.2 } as any}
            transition={{ duration: 0.6 } as any}
            className="max-w-3xl mx-auto"
          >
            <Accordion type="single" collapsible className="w-full space-y-3">
              {faqData.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`faq-${index}`} 
                  className={cn(
                    "border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden",
                    "bg-white dark:bg-gray-800/60 shadow-sm transition-colors duration-200",
                    // Subtle hover/focus effect on the item itself
                    "hover:border-purple-200 dark:hover:border-purple-700 focus-within:ring-2 focus-within:ring-purple-400 focus-within:ring-offset-2 dark:focus-within:ring-offset-gray-950"
                  )}
                >
                  <AccordionTrigger 
                    className="text-left hover:no-underline px-5 py-4 text-base font-semibold text-gray-800 dark:text-gray-200 data-[state=open]:text-purple-700 dark:data-[state=open]:text-purple-300 transition-colors duration-200"
                  >
                    {faq.question}
                    {/* Chevron rotates automatically via shadcn component */}
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pt-1 pb-5 text-sm text-gray-600 dark:text-gray-400">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>
      
      {/* Use the imported LandingFooter */}      
      <LandingFooter /> 
    </div>
  );
} 
