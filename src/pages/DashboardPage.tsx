import React from 'react';
import { Navigate } from 'react-router-dom';
import { Container } from '@/components/layout/Container';
import { PageLayout } from '@/components/layouts/PageLayout';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FocusTracker } from '@/components/health/FocusTracker';
import { HealthWidget } from '@/components/widgets/HealthWidget';
import { StepTracker } from '@/components/health/StepTracker';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useAnimation } from '@/contexts/AnimationContext';
import { Loader } from '@/components/ui/loader';
import { User, Activity, LineChart, Home } from 'lucide-react';
import { useSession } from '@supabase/auth-helpers-react';

// Temporary NicotineTracker component
const NicotineTracker = () => {
  return (
    <div className="text-muted-foreground text-center py-4">
      Nicotine usage data will appear here.
    </div>
  );
};

export function DashboardPage() {
  const { user, session, loading } = useAuth();
  const { prefersReducedMotion, getTransition } = useAnimation();
  const sessionSupabase = useSession();
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        ...getTransition(),
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0,
      transition: {
        ...getTransition(),
        delay: i * 0.05
      }
    })
  };
  
  // If still loading, return loading indicator
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader variant="dots" color="primary" size="lg" text="Loading your dashboard..." />
      </div>
    );
  }
  
  // If not authenticated, show sign in page
  if (!session || !user) {
    return (
      <PageLayout 
        title="Welcome to Mission Fresh"
        description="Your journey to a healthier, smoke-free life begins here"
        icon={<Home className="h-6 w-6" />}
        colorScheme="gradient"
      >
        <Container>
          <motion.div 
            className="flex flex-col items-center justify-center min-h-[70vh]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h2 
              className="text-2xl font-semibold mb-4 bg-gradient-to-r from-emerald-600 to-blue-600 text-transparent bg-clip-text"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              Track Your Progress, Celebrate Your Success
            </motion.h2>
            
            <motion.p 
              className="text-lg mb-6 text-center max-w-md text-muted-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Please sign in to access your personalized dashboard and track your smoke-free journey.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                variant="default" 
                className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white"
                onClick={() => window.location.href = '/auth'}
                animated
              >
                Sign In
              </Button>
            </motion.div>
          </motion.div>
        </Container>
      </PageLayout>
    );
  }
  
  // Get first name for welcome message
  const firstName = user.email?.split('@')[0] || 'Friend';
  const capitalizedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
  
  return (
    <PageLayout 
      title={`Welcome, ${capitalizedFirstName}`}
      subtitle="Track your progress and stay on your smoke-free journey"
      icon={<User className="h-6 w-6" />}
      colorScheme="primary"
      actions={
        <Button size="sm" variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          Sync Health Data
        </Button>
      }
    >
      <Container>
        <motion.div 
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial={prefersReducedMotion ? "visible" : "hidden"}
          animate="visible"
        >
          {/* Health Widget with motion */}
          <motion.div variants={itemVariants} custom={0}>
            <HealthWidget 
              userId={user.id}
              size="lg"
              exportable={true}
              widgetTitle="Health Progress"
            />
          </motion.div>
          
          {/* Step Tracking with motion */}
          <motion.div variants={itemVariants} custom={1}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Step Tracking
                </CardTitle>
                <CardDescription>Monitor your physical activity</CardDescription>
              </CardHeader>
              <CardContent>
                <StepTracker />
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Focus Levels with motion */}
          <motion.div variants={itemVariants} custom={2}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-primary" />
                  Focus Levels
                </CardTitle>
                <CardDescription>Track your concentration and focus</CardDescription>
              </CardHeader>
              <CardContent>
                <FocusTracker session={sessionSupabase} />
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </Container>
    </PageLayout>
  );
} 