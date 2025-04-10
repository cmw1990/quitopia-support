import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Consistent animation variants
const subtleHoverEffect = "transition-transform duration-200 ease-out group-hover:scale-105";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

const imageVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { delay: 0.4, duration: 0.5 } }
};

const HeroSection: React.FC = () => {
  return (
    <section className="w-full min-h-[calc(100vh-56px)] flex items-center overflow-hidden relative py-16 md:py-24 lg:py-32 bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Enhanced Background decorative elements */}
      <div className="absolute inset-0 z-0 opacity-15 overflow-hidden">
        <motion.span 
          className="absolute top-[10%] left-[15%] w-72 h-72 bg-primary/20 rounded-full filter blur-[80px]"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
        ></motion.span>
        <motion.span 
          className="absolute bottom-[15%] right-[10%] w-60 h-60 bg-secondary/20 rounded-full filter blur-[70px]"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.8, ease: "easeInOut" }}
        ></motion.span>
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <Zap className="absolute top-10 right-10 h-28 w-28 text-primary/10 transform rotate-12 opacity-60" />
          <Zap className="absolute bottom-16 left-10 h-20 w-20 text-secondary/10 transform -rotate-12 opacity-50" />
        </motion.div>
      </div>

      <motion.div 
        className="container px-4 md:px-6 z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          {/* Text Content Column */}
          <motion.div className="flex flex-col justify-center space-y-6" variants={itemVariants}>
            <motion.h1 
              className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl xl:text-7xl/none bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 pb-2"
              variants={itemVariants}
            >
              Master Your Focus, <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary">Unlock Your Potential</span>
            </motion.h1>
            <motion.p 
              className="max-w-[600px] text-muted-foreground md:text-xl leading-relaxed"
              variants={itemVariants}
            >
              The ultimate toolkit for <strong className="text-foreground">enhanced productivity, ADHD support,</strong> and <strong className="text-foreground">peak energy management</strong>. Overcome distractions and achieve deep, meaningful work.
            </motion.p>
            <motion.div 
              className="flex flex-col gap-3 min-[400px]:flex-row"
              variants={itemVariants}
            >
              <Link to="/easier-focus/auth/signup"> 
                <Button size="lg" className="px-8 w-full sm:w-auto group transition-all duration-300 ease-out hover:shadow-lg hover:shadow-primary/40 hover:scale-105 active:scale-100">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/easier-focus/auth/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto transition-all duration-300 ease-out hover:bg-accent/60 hover:border-primary/50 hover:scale-105 active:scale-100">
                  Log In
                </Button>
              </Link>
            </motion.div>
            <motion.div 
              className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground pt-2"
              variants={itemVariants}
            >
              <div className="flex items-center group">
                <CheckCircle2 className={cn("mr-1.5 h-4 w-4 text-primary", subtleHoverEffect)} />
                <span className={cn("transition-colors duration-200 group-hover:text-foreground/80", subtleHoverEffect)}>No credit card required</span>
              </div>
              <div className="flex items-center group">
                <CheckCircle2 className={cn("mr-1.5 h-4 w-4 text-primary", subtleHoverEffect)} />
                <span className={cn("transition-colors duration-200 group-hover:text-foreground/80", subtleHoverEffect)}>14-day free Pro trial</span>
              </div>
              <div className="flex items-center group">
                <CheckCircle2 className={cn("mr-1.5 h-4 w-4 text-primary", subtleHoverEffect)} />
                <span className={cn("transition-colors duration-200 group-hover:text-foreground/80", subtleHoverEffect)}>Cancel anytime</span>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Image/Animation Column - Using a more dynamic placeholder SVG */}
          <motion.div 
            className="relative lg:pl-6 mt-12 lg:mt-0"
            variants={imageVariants}
          >
            <div className={cn(
              "relative overflow-hidden rounded-2xl border border-border/20 bg-gradient-to-br from-muted/50 to-muted/20 shadow-xl shadow-primary/10",
              "aspect-[16/10] flex items-center justify-center",
              "transition-all duration-500 ease-out hover:shadow-primary/20 hover:scale-[1.02] group"
            )}>
              {/* Enhanced SVG Placeholder - Replace with actual product animation/image */}
              <svg className="w-full h-full object-contain p-6 md:p-10 text-primary opacity-70 group-hover:opacity-90 transition-opacity duration-300" viewBox="0 0 200 125" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="svg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: 'currentColor', stopOpacity: 0.8}} />
                    <stop offset="100%" style={{stopColor: 'currentColor', stopOpacity: 0.4}} />
                  </linearGradient>
                  <filter id="svg-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <motion.rect 
                  x="10" y="10" width="180" height="105" rx="10" 
                  fill="url(#svg-gradient)" 
                  stroke="currentColor" strokeWidth="1" strokeOpacity="0.3"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.7 }}
                />
                {/* Abstract UI elements */}
                <motion.line x1="30" y1="30" x2="170" y2="30" stroke="currentColor" strokeWidth="2" strokeOpacity="0.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8, duration: 0.8 }} />
                <motion.rect x="30" y="45" width="60" height="15" rx="3" fill="currentColor" fillOpacity="0.2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 30 }} transition={{ delay: 1.0, duration: 0.5 }} />
                <motion.rect x="110" y="45" width="60" height="15" rx="3" fill="currentColor" fillOpacity="0.2" initial={{ opacity: 0, x: 120 }} animate={{ opacity: 1, x: 110 }} transition={{ delay: 1.1, duration: 0.5 }} />
                <motion.circle cx="50" cy="80" r="15" fill="currentColor" fillOpacity="0.3" filter="url(#svg-glow)" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.3, duration: 0.6 }} />
                <motion.path d="M100 70 L120 90 L140 70" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeOpacity="0.6" initial={{ pathLength: 0, pathOffset: 1 }} animate={{ pathLength: 1, pathOffset: 0 }} transition={{ delay: 1.5, duration: 1 }} />
              </svg>
              
              {/* Subtle overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent rounded-2xl pointer-events-none"></div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;