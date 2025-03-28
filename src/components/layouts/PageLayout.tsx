import React from 'react';
import { motion } from 'framer-motion';
import { useAnimation } from '../../contexts/AnimationContext';
import { PageTitle } from '../ui/page-title';

interface PageLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  decorative?: boolean;
  colorScheme?: "default" | "primary" | "secondary" | "gradient";
}

export const PageLayout = ({ 
  title, 
  description, 
  children, 
  subtitle,
  icon,
  actions,
  decorative = true,
  colorScheme = "default"
}: PageLayoutProps) => {
  const { prefersReducedMotion, getTransition } = useAnimation();
  
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

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        ...getTransition(),
        duration: 0.6
      }
    }
  };

  const mainVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        ...getTransition(),
        delay: 0.2
      }
    }
  };

  // Decorative background elements
  const BackgroundDecoration = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div 
        className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/3 rounded-full blur-3xl opacity-60"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.6 }}
        transition={{ duration: 1.5 }}
      />
      <motion.div 
        className="absolute bottom-20 left-20 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-2xl opacity-40"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.4 }}
        transition={{ duration: 1.5, delay: 0.3 }}
      />
    </div>
  );

  return (
    <motion.div 
      className="flex flex-col min-h-screen relative"
      variants={containerVariants}
      initial={prefersReducedMotion ? "visible" : "hidden"}
      animate="visible"
    >
      {decorative && <BackgroundDecoration />}
      
      <motion.header 
        className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-10"
        variants={headerVariants}
      >
        <div className="container mx-auto py-4">
          <PageTitle 
            title={title}
            subtitle={subtitle || description}
            icon={icon}
            actions={actions}
            colorScheme={colorScheme}
            decorative={decorative}
          />
        </div>
      </motion.header>
      
      <motion.main 
        className="flex-1 bg-muted/10 relative z-0 py-6"
        variants={mainVariants}
      >
        {children}
      </motion.main>
    </motion.div>
  );
}; 