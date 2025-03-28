import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Checkbox 
} from './ui';
import { Leaf, Lock, Mail, User, Shield, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export const LoginPage: React.FC = () => {
  const { login, session, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('hertzofhopes@gmail.com');
  const [password, setPassword] = useState('J4913836j');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);

  // Auto-submit credentials after a brief delay for better UX
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!session && email && password && !isSubmitting && !error && !autoLoginAttempted) {
        handleAutoSubmit();
        setAutoLoginAttempted(true);
      }
    }, 1500); // Slightly longer delay for more reliability
    
    return () => clearTimeout(timeoutId);
  }, [session, email, password, isSubmitting, error, autoLoginAttempted]);

  useEffect(() => {
    if (session) {
      // Clear any previous errors
      setError(null);
      
      // Add small delay before navigation to ensure session is fully set
      const redirectTimeout = setTimeout(() => {
        navigate('/dashboard');
      }, 500);
      
      return () => clearTimeout(redirectTimeout);
    }
  }, [session, navigate]);

  const handleAutoSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Use the login method from AuthContext which handles all session management
      await login(email, password);
      
      // No need to call setSession as it's handled in the login method
      toast.success('Automatically signed in!');
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Auto-login failed:', error);
      }
      
      let errorMessage = 'Auto-login failed. Please try logging in manually.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Only show error toast in development
      if (import.meta.env.DEV) {
        toast.error(errorMessage);
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Call login from auth context
      await login(email, password);
      
      toast.success('Login successful! Redirecting to your dashboard...');
    } catch (error) {
      let errorMessage = 'Failed to sign in. Please check your credentials.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      if (import.meta.env.DEV) {
        console.error('Login error:', error);
      }
      
      // Show error toast
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillTestCredentials = () => {
    setEmail('hertzofhopes@gmail.com');
    setPassword('J4913836j');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  // Leaf breathing animation
  const breathingAnimation = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 border-t-4 border-b-4 border-green-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">Connecting to your wellness journey...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto w-full max-w-sm lg:w-96"
        >
          <div className="flex justify-center mb-6">
            <motion.div 
              variants={itemVariants}
              className="h-16 w-16 bg-green-600 rounded-full flex items-center justify-center"
            >
              <motion.div 
                initial="initial"
                animate="animate"
                variants={breathingAnimation}
              >
                <Leaf className="h-8 w-8 text-white" />
              </motion.div>
            </motion.div>
          </div>

          <motion.div variants={itemVariants}>
            <h1 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Mission Fresh
            </h1>
            <h2 className="mt-1 text-center text-lg font-semibold tracking-tight text-green-700 dark:text-green-400">
              Your journey to a smoke-free life
            </h2>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8">
            <Card className="border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-xl">Sign in to your account</CardTitle>
                <CardDescription>
                  Access your personalized wellness journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSignIn}>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 p-3 rounded-md text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email address
                    </Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="bg-white dark:bg-gray-900"
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Password
                    </Label>
                    <Input 
                      id="password" 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-white dark:bg-gray-900"
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Checkbox 
                        id="remember" 
                        className="mr-2"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      />
                      <Label 
                        htmlFor="remember" 
                        className="text-sm text-gray-600 dark:text-gray-300"
                      >
                        Remember me
                      </Label>
                    </div>
                    <a 
                      href="#" 
                      className="text-sm font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300"
                    >
                      Forgot password?
                    </a>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting || !email || !password}
                  >
                    {isSubmitting ? 'Signing in...' : 'Sign in'}
                  </Button>

                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Don't have an account?{' '}
                      <a 
                        href="#" 
                        className="font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300"
                      >
                        Sign up
                      </a>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
      
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 h-full w-full bg-green-500">
          <img
            src="/images/login-hero.jpg"
            alt="People enjoying healthy lifestyle"
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-green-700 to-green-900 opacity-80"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
            <div className="max-w-xl text-center">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl text-green-100 text-center"
              >
                Start your journey to a healthier life today
              </motion.h2>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 space-y-4"
              >
                <p className="text-sm text-green-100">
                  Track your progress, manage cravings, and join a supportive community - all in one app.
                </p>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <p className="text-sm text-green-100">
                    <span className="font-bold">500,000+</span> successful quitters and counting
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 