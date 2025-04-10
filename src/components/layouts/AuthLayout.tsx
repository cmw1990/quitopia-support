import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AuthLayout() {
  const location = useLocation();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 25, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut", delay: 0.1 } },
  };

  return (
    <motion.div 
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background via-muted/40 to-background overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-40 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl opacity-30 translate-x-1/2 translate-y-1/2"></div>

      <div className="relative z-10 w-full max-w-md">
        <motion.div 
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Link to="/" className="inline-flex items-center gap-2 group">
            <Brain className="h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-110" />
            <h1 className="text-3xl font-semibold text-foreground tracking-tight">
              Easier Focus
            </h1>
          </Link>
           <p className="text-muted-foreground text-sm mt-1.5">Find your flow.</p> 
        </motion.div>

        <motion.div
          variants={cardVariants}
          className={cn(
            "bg-card border border-border/60 rounded-xl shadow-lg dark:shadow-primary/10",
            "p-6 md:p-8"
          )}
        >
          <Outlet />
        </motion.div>
        
        <motion.div 
          className="mt-6 text-center text-sm text-muted-foreground/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {location.pathname.includes('/auth/login') ? (
            <p>
              Don't have an account?{' '}
              <Link to="/auth/signup" className="font-medium text-primary hover:text-primary/80 transition-colors duration-200">
                Sign up
              </Link>
            </p>
          ) : location.pathname.includes('/auth/signup') ? (
            <p>
              Already have an account?{' '}
              <Link to="/auth/login" className="font-medium text-primary hover:text-primary/80 transition-colors duration-200">
                Sign in
              </Link>
            </p>
          ) : location.pathname.includes('/forgot-password') ? (
            <p>
              Remember password?{' '}
              <Link to="/auth/login" className="font-medium text-primary hover:text-primary/80 transition-colors duration-200">
                Sign in
              </Link>
            </p>
          ) : null}
        </motion.div>
      </div>
      
      <motion.footer 
        className="relative z-10 mt-10 text-center text-xs text-muted-foreground/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <p>&copy; {new Date().getFullYear()} Well-Charged Inc. All rights reserved.</p>
        <div className="mt-2 space-x-4">
          <Link to="/privacy" className="hover:text-muted-foreground transition-colors">Privacy</Link>
          <span aria-hidden="true">·</span>
          <Link to="/terms" className="hover:text-muted-foreground transition-colors">Terms</Link>
          <span aria-hidden="true">·</span>
          <Link to="/contact" className="hover:text-muted-foreground transition-colors">Contact</Link>
        </div>
      </motion.footer>
    </motion.div>
  );
}

export default AuthLayout; 