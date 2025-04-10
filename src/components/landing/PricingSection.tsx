import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const pricingPlansData = [
  {
    name: "Basic",
    price: "$0",
    period: "Free forever",
    description: "Essential focus tools for individuals",
    features: [
      "Standard Pomodoro Timer",
      "Basic Task Management",
      "Limited Website Blocking (3 sites)",
      "7-Day Focus History",
      "Community Support"
    ],
    cta: "Start Free",
    ctaLink: "/easier-focus/auth/signup", 
    highlighted: false
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "per month",
    description: "Advanced features for productivity enthusiasts",
    features: [
      "Advanced Pomodoro & Flow Timers",
      "ADHD Task Breakdown Tool",
      "Unlimited Website & App Blocking",
      "Full Analytics Dashboard",
      "Energy Management Tools",
      "Unlimited History & Reporting",
      "Priority Support"
    ],
    cta: "Try Pro Free for 14 Days",
    ctaLink: "/easier-focus/auth/signup?plan=pro", 
    highlighted: true
  },
  {
    name: "Teams",
    price: "$7.99",
    period: "per user/month",
    description: "Collaborative focus for teams",
    features: [
      "All Pro Features",
      "Team Focus Sessions",
      "Group Accountability Tools",
      "Team Analytics Dashboard",
      "Admin Controls & User Management",
      "API Access (Beta)",
      "Dedicated Support Manager"
    ],
    cta: "Contact Sales",
    ctaLink: "/easier-focus/contact", 
    highlighted: false
  }
];

// Animation variants
const sectionVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

const gridVariants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 80 } }
};

const PricingSection: React.FC = () => {
  return (
    <motion.section 
      id="pricing" 
      className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted/30 relative"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {/* Optional: Subtle pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(var(--foreground) 0.5px, transparent 0.5px)', backgroundSize: '15px 15px' }}></div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16 md:mb-20">
          <motion.div 
            className="inline-block rounded-lg bg-primary/10 border border-primary/20 px-3 py-1 text-sm font-medium text-primary shadow-sm"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Simple Pricing
          </motion.div>
          <motion.h2 
            className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-foreground"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Choose the Plan That's Right for You
          </motion.h2>
          <motion.p 
            className="max-w-[900px] text-muted-foreground md:text-xl/relaxed"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Start free and upgrade anytime. No hidden fees, cancel anytime.
          </motion.p>
        </div>
        
        <motion.div 
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 items-stretch"
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {pricingPlansData.map((plan, i) => (
            <motion.div key={i} variants={itemVariants} className="flex group/card">
              <Card 
                className={cn(
                  "flex flex-col h-full w-full border rounded-xl overflow-hidden relative",
                  "transition-all duration-300 ease-out",
                  plan.highlighted 
                    ? 'border-primary/80 shadow-xl shadow-primary/15 scale-100 lg:scale-105 z-10 bg-card' 
                    : 'border-border/60 bg-card hover:shadow-lg hover:shadow-muted/10 hover:scale-[1.02] hover:border-border'
                )}
              >
                {/* Subtle glow for highlighted card */}
                {plan.highlighted && <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50 rounded-xl z-0"></div>}
                
                <div className="relative z-10 flex flex-col h-full">
                  {plan.highlighted && (
                    <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-center py-2 text-sm font-semibold rounded-t-xl shadow-inner">
                      Most Popular
                    </div>
                  )}
                  <CardHeader className={cn("p-6", plan.highlighted && "pt-5")}>
                    <CardTitle className="text-2xl font-semibold text-foreground">{plan.name}</CardTitle>
                    <div className="mt-2 flex items-baseline gap-x-1.5">
                      <span className="text-4xl font-bold tracking-tight text-foreground">{plan.price}</span>
                      {plan.period && <span className="text-muted-foreground text-sm font-medium">{plan.period}</span>}
                    </div>
                    <CardDescription className="mt-3 min-h-[40px] text-muted-foreground/90">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow p-6 pt-0">
                    <ul className="space-y-3.5 mt-6 border-t border-border/50 pt-6">
                      {plan.features.map((feature, j) => (
                        <li key={j} className="flex items-start group/item">
                          <CheckCircle2 className="h-5 w-5 text-primary/80 mr-3 mt-0.5 flex-shrink-0 transition-colors duration-200 group-hover/item:text-primary" />
                          <span className="text-sm text-muted-foreground leading-relaxed transition-colors duration-200 group-hover/item:text-foreground/90">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <div className="p-6 pt-4 mt-auto">
                    <Link to={plan.ctaLink} className="block w-full">
                      <Button 
                        className={cn(
                          "w-full transition-all duration-300 ease-out group",
                          plan.highlighted ? "hover:bg-primary/90 active:bg-primary/80 focus-visible:ring-primary/50" : "hover:bg-muted/80 active:bg-muted focus-visible:ring-ring/70",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        )}
                        size="lg"
                        variant={plan.highlighted ? "default" : "outline"}
                      >
                        {plan.cta}
                        {plan.highlighted && <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1.5">→</span>}
                      </Button>
                    </Link>
                  </div>
                </div> {/* End relative z-10 wrapper */}
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default PricingSection;