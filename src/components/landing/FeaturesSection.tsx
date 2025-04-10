import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Clock, Shield, Zap, BarChart, Sparkles, CheckCircle2 } from "lucide-react";
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Reusable subtle hover effect for list items
const subtleHoverEffect = "transition-transform duration-200 ease-out group-hover:scale-105";

const featuresData = [
  {
    title: "Advanced Pomodoro Timer",
    description: "Customize work/break intervals, track tasks, and maximize productivity with our advanced time management tools.",
    icon: <Clock className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />,
    benefits: [
      "Customizable work & break durations",
      "Task integration and tracking",
      "Visual and audio notifications",
      "Session history and statistics"
    ]
  },
  {
    title: "ADHD Task Breakdown",
    description: "Break complex tasks into manageable steps with templates designed specifically for ADHD and focus challenges.",
    icon: <Brain className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />,
    benefits: [
      "Task templates for different project types",
      "Progressive step completion tracking",
      "Priority and time estimate features",
      "Visual progress indicators"
    ]
  },
  {
    title: "Distraction Blocker",
    description: "Eliminate digital distractions with customizable website and app blocking to maintain deep focus.",
    icon: <Shield className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />,
    benefits: [
      "Website and application blocking",
      "Customizable block lists and schedules",
      "Distraction attempt tracking",
      "Focus mode with emergency override"
    ]
  },
  {
    title: "Energy Management",
    description: "Track and optimize your mental energy levels to schedule tasks during your peak productivity hours.",
    icon: <Zap className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />,
    benefits: [
      "Energy level tracking throughout the day",
      "Personalized energy pattern insights",
      "Activity impact analysis",
      "Optimal task scheduling recommendations"
    ]
  },
  {
    title: "Comprehensive Analytics",
    description: "Gain insights into your focus patterns, productivity trends, and improvement opportunities.",
    icon: <BarChart className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />,
    benefits: [
      "Focus time and score tracking",
      "Distraction pattern analysis",
      "Task completion analytics",
      "Personalized improvement recommendations"
    ]
  },
  {
    title: "Personalized Dashboard",
    description: "Get a bird's eye view of your focus journey with customizable widgets and progress tracking.",
    icon: <Sparkles className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />,
    benefits: [
      "Daily focus goal tracking",
      "Task and activity overview",
      "Quick access to essential tools",
      "Focus metrics and statistics"
    ]
  }
];

// Animation variants for the section and cards
const sectionVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

const cardContainerVariants = {
  hidden: { opacity: 1 }, // Keep container visible, children will stagger
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const cardVariants = {
  hidden: { y: 30, opacity: 0, scale: 0.95 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 50, damping: 10 } }
};

const FeaturesSection: React.FC = () => {
  return (
    <motion.section 
      className="w-full py-16 md:py-24 lg:py-32 bg-background"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }} // Trigger animation when 20% visible
    >
      {/* Subtle background pattern */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.02]"
        style={{ backgroundImage: 'radial-gradient(circle at center, currentColor 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      ></div>
      
      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16 md:mb-20">
          <motion.div 
            className="inline-block rounded-lg bg-primary/10 border border-primary/20 px-3 py-1 text-sm font-medium text-primary shadow-sm"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Powerful Tools
          </motion.div>
          <motion.h2 
            className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-foreground"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Everything You Need to Master Your Focus
          </motion.h2>
          <motion.p 
            className="max-w-[900px] text-muted-foreground md:text-xl/relaxed"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Scientifically-designed tools to overcome distractions, manage ADHD challenges, and optimize your mental energy.
          </motion.p>
        </div>
        
        <motion.div 
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          variants={cardContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }} // Trigger when grid starts entering view
        >
          {featuresData.map((feature, i) => (
            <motion.div key={i} variants={cardVariants} className="group">
              <Card className={cn(
                "flex flex-col h-full bg-card border border-border/50 rounded-xl overflow-hidden relative",
                "transition-all duration-300 ease-out",
                "hover:shadow-xl hover:shadow-primary/10 hover:border-primary/40 hover:-translate-y-1.5 hover:scale-[1.02]"
              )}>
                {/* Optional: Add a subtle glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                
                <CardHeader className="p-6 relative z-10">
                  <motion.div 
                    className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4 border border-border/60 shadow-inner group-hover:bg-primary/10 transition-colors duration-300"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.05, type: 'spring', stiffness: 100 }}
                  >
                    {/* Update icon definitions to include group-hover effect */}
                    {React.cloneElement(feature.icon, {
                      className: cn(
                        feature.icon.props.className,
                        "group-hover:scale-110 group-hover:rotate-[-5deg] transition-transform duration-300 ease-out"
                      )
                    })}
                  </motion.div>
                  <CardTitle className="text-xl font-semibold text-foreground">{feature.title}</CardTitle>
                  <CardDescription className="text-muted-foreground pt-1 min-h-[60px]">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow p-6 pt-0 relative z-10">
                  <ul className="space-y-2.5 mt-4 border-t border-border/50 pt-4">
                    {feature.benefits.map((benefit, j) => (
                      <li key={j} className="flex items-start group/item">
                        <CheckCircle2 className={cn("h-4 w-4 text-primary/80 mr-2.5 mt-[3px] flex-shrink-0 transition-all duration-200 group-hover/item:text-primary group-hover/item:scale-110", subtleHoverEffect.replace("group-hover:", "group-hover/item:"))} />
                        <span className={cn("text-sm text-muted-foreground transition-colors duration-200 group-hover/item:text-foreground/90", subtleHoverEffect.replace("group-hover:", "group-hover/item:"))}>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default FeaturesSection;