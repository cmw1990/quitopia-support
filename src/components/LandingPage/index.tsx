import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { ArrowRight, Zap, ShieldCheck, BrainCircuit, BarChartBig, Lightbulb, Sparkles } from 'lucide-react';

// Example: Subtle animated shape for the background
const AnimatedShape = () => (
  <motion.div
    className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full filter blur-3xl opacity-50 animate-pulse-slow"
    animate={{
      scale: [1, 1.1, 1],
      rotate: [0, 10, 0],
    }}
    transition={{
      duration: 15,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "mirror",
    }}
  />
);

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: "easeOut" }
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { duration: 0.5, ease: "easeOut" }
  },
};

export function LandingPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-background to-purple-50 overflow-x-hidden dark:from-blue-950/30 dark:via-background dark:to-purple-950/30">
      {/* Add subtle background shapes */}
      <AnimatedShape />
      <motion.div 
        className="absolute top-1/2 right-1/4 w-72 h-72 bg-purple-500/5 rounded-full filter blur-3xl opacity-40 animate-pulse-slow"
        animate={{ scale: [1, 1.05, 1], x: [0, 20, 0], y: [0, -15, 0]}}
        transition={{ duration: 18, ease: "easeInOut", repeat: Infinity, repeatType: "mirror"}} 
      />

      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 50, delay: 0.2 }}
        className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold tracking-tight text-primary">
             EasierFocus
           </Link>
           <div className="space-x-2 sm:space-x-4">
            <Button asChild variant="ghost">
              <Link to="/auth/login">Login</Link>
            </Button>
            <Button asChild>
               <Link to="/auth/signup">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
             </Button>
          </div>
        </div>
      </motion.nav>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <motion.section
           variants={sectionVariants}
           initial="hidden"
           animate="visible"
           className="text-center max-w-4xl mx-auto mb-24 sm:mb-32"
         >
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight"
           >
            Stop Fighting Distractions. <br className="hidden sm:inline"/> Find Your <span className="text-primary">Effortless Flow</span>.
           </motion.h1>
           <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground mb-10 sm:mb-12"
           >
            EasierFocus combines cutting-edge tools for <span className="text-foreground font-medium">ADHD support, distraction blocking, energy management,</span> and <span className="text-foreground font-medium">deep work</span> into one seamless platform. Reclaim your time and energy.
           </motion.p>
           <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4"
           >
             <Button asChild size="lg" className="text-lg w-full sm:w-auto">
               <Link to="/auth/signup">
                 Begin Your Focus Journey <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
             </Button>
          </motion.div>
         </motion.section>

        <motion.section 
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mb-24 sm:mb-32"
         >
           <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 sm:mb-16">Everything You Need to Focus</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
             <motion.div variants={cardVariants}>
              <Card className="h-full bg-background/70 backdrop-blur-sm border border-border/50 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/30">
                 <CardHeader className="flex flex-row items-start gap-4 p-5 pb-2">
                   <div className="bg-primary/10 p-3 rounded-lg mt-1">
                    <BarChartBig className="h-6 w-6 text-primary" />
                   </div>
                   <CardTitle className="text-xl">Focus Timer & Analytics</CardTitle>
                </CardHeader>
                 <CardContent>
                   <CardDescription>
                    Use Pomodoro or custom timers, track sessions, identify peak focus times, and visualize your progress with detailed analytics.
                  </CardDescription>
                </CardContent>
               </Card>
            </motion.div>
            
            <motion.div variants={cardVariants}>
              <Card className="h-full bg-background/70 backdrop-blur-sm border border-border/50 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/30">
                <CardHeader className="flex flex-row items-start gap-4 p-5 pb-2">
                   <div className="bg-primary/10 p-3 rounded-lg mt-1">
                     <ShieldCheck className="h-6 w-6 text-primary" />
                   </div>
                   <CardTitle className="text-xl">Intelligent Distraction Blocking</CardTitle>
                </CardHeader>
                 <CardContent>
                   <CardDescription>
                     Block websites, apps, or keywords during focus sessions. Customize blocklists and allow exceptions for true deep work.
                   </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
            
             <motion.div variants={cardVariants}>
               <Card className="h-full bg-background/70 backdrop-blur-sm border border-border/50 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/30">
                 <CardHeader className="flex flex-row items-start gap-4 p-5 pb-2">
                   <div className="bg-primary/10 p-3 rounded-lg mt-1">
                     <BrainCircuit className="h-6 w-6 text-primary" />
                   </div>
                   <CardTitle className="text-xl">ADHD-Friendly Tools</CardTitle>
                </CardHeader>
                 <CardContent>
                   <CardDescription>
                    Task breakdown assistance, motivation systems, noise generators, and strategies specifically designed for ADHD brains.
                  </CardDescription>
                </CardContent>
               </Card>
            </motion.div>

             <motion.div variants={cardVariants}>
               <Card className="h-full bg-background/70 backdrop-blur-sm border border-border/50 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/30">
                 <CardHeader className="flex flex-row items-start gap-4 p-5 pb-2">
                   <div className="bg-primary/10 p-3 rounded-lg mt-1">
                     <Zap className="h-6 w-6 text-primary" />
                   </div>
                   <CardTitle className="text-xl">Energy & Fatigue Management</CardTitle>
                </CardHeader>
                 <CardContent>
                   <CardDescription>
                     Track energy levels, get smart break reminders, and utilize anti-fatigue techniques to maintain peak mental stamina all day.
                   </CardDescription>
                </CardContent>
               </Card>
             </motion.div>

            <motion.div variants={cardVariants}>
               <Card className="h-full bg-background/70 backdrop-blur-sm border border-border/50 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/30">
                 <CardHeader className="flex flex-row items-start gap-4 p-5 pb-2">
                   <div className="bg-primary/10 p-3 rounded-lg mt-1">
                     <Lightbulb className="h-6 w-6 text-primary" />
                   </div>
                   <CardTitle className="text-xl">Personalized Insights</CardTitle>
                </CardHeader>
                 <CardContent>
                   <CardDescription>
                     Discover your optimal work patterns and receive AI-powered suggestions for focus techniques and scheduling.
                   </CardDescription>
                </CardContent>
               </Card>
            </motion.div>

             <motion.div variants={cardVariants}>
               <Card className="h-full bg-background/70 backdrop-blur-sm border border-border/50 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/30">
                 <CardHeader className="flex flex-row items-start gap-4 p-5 pb-2">
                   <div className="bg-primary/10 p-3 rounded-lg mt-1">
                      <Sparkles className="h-6 w-6 text-primary" />
                   </div>
                   <CardTitle className="text-xl">And Much More...</CardTitle>
                </CardHeader>
                 <CardContent>
                   <CardDescription>
                     Body doubling, focus music integration, advanced task management, community features, and continuous updates.
                   </CardDescription>
                </CardContent>
               </Card>
            </motion.div>

           </div>
         </motion.section>

        <motion.section 
           variants={sectionVariants}
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true, amount: 0.2 }}
           className="text-center mb-24 sm:mb-32"
         >
           <h2 className="text-3xl sm:text-4xl font-bold mb-12 sm:mb-16">Rediscover Your Productivity Power</h2>
           {/* Remove or replace placeholder testimonials for now */}
           {/* 
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
             {[1, 2, 3].map((i) => (
               <motion.div variants={cardVariants} key={i}>
                 <Card className="h-full">
                   <CardContent className="pt-6">
                     <p className="italic text-muted-foreground mb-4">"EasierFocus changed the game for my productivity. The distraction blocker is a lifesaver!"</p>
                     <p className="font-semibold">- Happy User {i}</p>
                     <p className="text-sm text-muted-foreground">Freelance Developer</p>
                  </CardContent>
                 </Card>
               </motion.div>
            ))}
           </div>
           */}
         </motion.section>
      </main>

       <motion.footer 
        className="bg-muted/60 border-t border-border/50 pt-16 pb-8"
      >
         <div className="container mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
             <div className="col-span-2 lg:col-span-1">
               <h3 className="text-lg font-semibold mb-4">EasierFocus</h3>
               <p className="text-sm text-muted-foreground">
                 Master your focus, conquer distractions, and unlock your peak potential.
               </p>
             </div>
             <div>
              <h4 className="font-semibold mb-4 text-foreground">Product</h4>
               <ul className="space-y-2 text-sm">
                 <li><span className="text-muted-foreground">Features (Coming Soon)</span></li>
                 <li><span className="text-muted-foreground">Pricing (Coming Soon)</span></li>
               </ul>
             </div>
            <div>
               <h4 className="font-semibold mb-4 text-foreground">Company</h4>
               <ul className="space-y-2 text-sm">
                 <li><span className="text-muted-foreground">About Us (Coming Soon)</span></li>
                 <li><span className="text-muted-foreground">Blog (Coming Soon)</span></li>
               </ul>
             </div>
             <div>
               <h4 className="font-semibold mb-4 text-foreground">Resources</h4>
               <ul className="space-y-2 text-sm">
                 <li><span className="text-muted-foreground">Guides (Coming Soon)</span></li>
                 <li><span className="text-muted-foreground">Support (Coming Soon)</span></li>
                 <li><span className="text-muted-foreground">FAQ (Coming Soon)</span></li>
               </ul>
             </div>
             <div>
               <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
               <ul className="space-y-2 text-sm">
                 <li><span className="text-muted-foreground">Privacy Policy (Coming Soon)</span></li>
                 <li><span className="text-muted-foreground">Terms of Service (Coming Soon)</span></li>
               </ul>
             </div>
           </div>
           <div className="mt-12 pt-8 border-t border-border/60 text-center text-sm text-muted-foreground">
             <p>&copy; {new Date().getFullYear()} EasierFocus by Well-Charged. All rights reserved.</p>
           </div>
         </div>
       </motion.footer>
    </div>
  );
}