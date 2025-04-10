
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight, Focus, Brain, Shield, Zap, Battery, Check } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <motion.h1 
                className="text-4xl md:text-6xl font-bold leading-tight tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Master Your Focus,<br />
                <span className="text-primary">Unlock Your Potential</span>
              </motion.h1>
              
              <motion.p 
                className="text-lg text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                EasierFocus is the all-in-one platform designed to help you beat distractions,
                manage energy levels, and create optimized workflows for ADHD and focus challenges.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Button size="lg" asChild>
                  <Link to="/auth/signup">
                    Get Started for Free
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                
                <Button variant="outline" size="lg" asChild>
                  <Link to="/app/dashboard">Explore Features</Link>
                </Button>
              </motion.div>
            </div>
            
            <motion.div 
              className="flex-1"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <img 
                src="/images/hero-dashboard.webp" 
                alt="EasierFocus Dashboard" 
                className="rounded-lg shadow-xl max-w-full h-auto"
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/600x400/3b82f6/ffffff?text=EasierFocus+Dashboard';
                }}
              />
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Designed for Your Focus Journey</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A comprehensive suite of tools to help you overcome distractions,
              optimize your energy, and accomplish more with less effort.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Focus}
              title="Focus Enhancement"
              description="Customizable timers, distraction blocking, and focus analytics to help you get into flow state faster."
            />
            
            <FeatureCard 
              icon={Brain}
              title="ADHD Support"
              description="Task breakdown, body doubling, and executive function tools designed specifically for ADHD brains."
            />
            
            <FeatureCard 
              icon={Shield}
              title="Distraction Management"
              description="Block websites, track patterns, and create a distraction-free environment for deep work."
            />
            
            <FeatureCard 
              icon={Zap}
              title="Energy Optimization"
              description="Track energy levels, manage fatigue, and schedule tasks according to your energy patterns."
            />
            
            <FeatureCard 
              icon={Battery}
              title="Anti-Fatigue Systems"
              description="Prevent burnout with strategic breaks, exercises, and fatigue monitoring."
            />
            
            <FeatureCard 
              icon={Check}
              title="Task Management"
              description="Prioritize tasks based on energy requirements, difficulty, and deadlines for maximum productivity."
            />
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by People Like You</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              See how EasierFocus has transformed the productivity and well-being of our users.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard 
              quote="This app changed my relationship with work. The distraction blocker and focus timer have doubled my productivity."
              name="Alex K."
              title="Software Developer"
            />
            
            <TestimonialCard 
              quote="As someone with ADHD, I've tried everything. EasierFocus is the first app that actually understands how my brain works."
              name="Jamie L."
              title="Graphic Designer"
            />
            
            <TestimonialCard 
              quote="The energy tracking feature helped me identify when I work best. Now I schedule important tasks during peak energy hours."
              name="Sam T."
              title="Marketing Manager"
            />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/10">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Focus?</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Join thousands of users who have revolutionized their productivity with EasierFocus.
          </p>
          <Button size="lg" asChild>
            <Link to="/auth/signup">Get Started for Free</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => {
  return (
    <motion.div 
      className="bg-card rounded-lg p-6 border shadow-sm h-full flex flex-col"
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground flex-1">{description}</p>
    </motion.div>
  );
};

// Testimonial Card Component
const TestimonialCard = ({ quote, name, title }: { quote: string, name: string, title: string }) => {
  return (
    <motion.div 
      className="bg-card rounded-lg p-6 border shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <p className="italic mb-4">&ldquo;{quote}&rdquo;</p>
      <div>
        <p className="font-semibold">{name}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
    </motion.div>
  );
};

export default LandingPage;
