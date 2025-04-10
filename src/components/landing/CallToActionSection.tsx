import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Animation variants
const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6,
      ease: [0.6, 0.05, -0.01, 0.9] // Custom ease for a smoother effect
    } 
  }
};

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.5,
      delay: 0.2, 
      ease: "easeOut"
    }
  }
};

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      delay: 0.4,
      type: "spring",
      stiffness: 100
    }
  }
};


const CallToActionSection: React.FC = () => {
  return (
    <motion.section 
      className="w-full py-20 md:py-28 lg:py-36 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-t-3xl mt-[-40px] z-10 relative overflow-hidden"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      {/* Enhanced background elements */}
      <div 
        className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2280%22%20height%3D%2280%22%20viewBox%3D%220%200%2080%2080%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]
        opacity-100 mix-blend-soft-light"
      ></div>
      {/* Animated Blurs */}
      <motion.div 
        className="absolute -bottom-1/3 left-[-10%] w-3/5 h-3/5 bg-white/10 rounded-full blur-[120px] opacity-40 pointer-events-none"
        animate={{ scale: [1, 1.05, 1], x: [0, 10, 0], y: [0, -5, 0] }}
        transition={{ duration: 15, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      ></motion.div>
      <motion.div 
        className="absolute -top-1/3 right-[-10%] w-1/2 h-1/2 bg-white/15 rounded-full blur-[100px] opacity-30 pointer-events-none"
        animate={{ scale: [1, 1.03, 1], x: [0, -8, 0], y: [0, 8, 0] }}
        transition={{ duration: 18, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: 3 }}
      ></motion.div>

      <div className="container relative z-10 px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-6 text-center">
          <motion.h2 
            className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl"
            variants={textVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            Ready to Master Your Focus?
          </motion.h2>
          <motion.p 
            className="max-w-[600px] text-primary-foreground/80 md:text-xl"
            variants={textVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Stop letting distractions win. Start building momentum and achieve your goals with Easier Focus today.
          </motion.p>
          <motion.div 
            className="mt-8"
            variants={buttonVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Link to="/easier-focus/auth/signup"> 
              <Button 
                size="xl" 
                className={cn(
                  "group bg-background text-primary hover:bg-gray-100 transition-all duration-300 ease-out",
                  "px-10 py-4 text-lg font-semibold shadow-lg hover:shadow-xl",
                  "transform hover:scale-105 active:scale-100 focus-visible:ring-2 focus-visible:ring-background focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                )}
              >
                Try Easier Focus Free
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
            <p className="mt-4 text-sm text-primary-foreground/70 font-medium">14-day free trial on Pro features. No credit card required.</p>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default CallToActionSection;