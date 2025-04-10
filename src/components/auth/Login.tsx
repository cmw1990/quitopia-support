import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../AuthProvider";
import { Loader2, Eye, EyeOff, Mail, LockKeyhole, Info } from 'lucide-react';
import { handleError } from "../../utils/error-handler";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

// Form schema
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type FormData = z.infer<typeof formSchema>;

// Animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5,
};

const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: (localStorage.getItem('easier_focus_email') || ''),
      password: "",
    },
  });

  // Get redirect path from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || '/app/dashboard';

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setApiError(null);

    try {
      await signIn(data.email, data.password);
      
      // Store email for next time
      try {
        localStorage.setItem('easier_focus_email', data.email);
      } catch (storageError) {
        console.warn('Could not save email to localStorage:', storageError);
      }

      toast({
        title: "Login Successful",
        description: "Welcome back! Redirecting...",
        variant: "default",
      });
      
      // Redirect smoothly after a short delay to allow toast visibility
      setTimeout(() => {
           navigate(from, { replace: true });
      }, 500);

    } catch (error: any) {
        handleError(error, "Login.onSubmit", "Login failed"); 
        
        // Set specific API error message for display in the Alert
        let specificMessage = "Login failed. Please check credentials or network.";
         if (error?.message) {
             if (error.message.includes('Invalid login credentials') || error.message.includes('401') || error.message.includes('403')) {
                 specificMessage = "Invalid email or password. Please check and try again.";
             } else if (error.message.includes('timeout') || error.message.includes('network')) {
                 specificMessage = "Network error or timeout. Please check connection and try again.";
             } else {
                 specificMessage = error.message;
             }
         }
        setApiError(specificMessage);
        setIsLoading(false);
    } 
  };

  return (
    <motion.div 
      className="flex h-full items-center justify-center p-4"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome Back!</CardTitle>
          <CardDescription>
            Sign in to continue to your Easier Focus dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <AnimatePresence>
            {apiError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mb-4"
              >
                 <Alert variant="destructive">
                  <Info className="h-4 w-4" /> 
                  <AlertTitle>Login Error</AlertTitle>
                  <AlertDescription>{apiError}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="login-form">
             {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="pl-10"
                  {...register("email")}
                  aria-invalid={errors.email ? "true" : "false"}
                  data-testid="email-input"
                />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p 
                    className="text-sm text-destructive"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    aria-live="polite"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            
            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button asChild variant="link" className="h-auto p-0 text-sm">
                  <Link to="/forgot-password">Forgot password?</Link>
                </Button>
              </div>
              <div className="relative">
                 <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                 <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pl-10 pr-10" 
                  {...register("password")}
                  aria-invalid={errors.password ? "true" : "false"}
                  data-testid="password-input"
                />
                <Button 
                    variant="ghost" 
                    size="icon" 
                    type="button"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
               <AnimatePresence>
                {errors.password && (
                  <motion.p 
                    className="text-sm text-destructive"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    aria-live="polite"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
              aria-live="polite"
              data-testid="login-button"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          
          {/* Social Login Placeholders (Optional - Enhance or remove based on SSOT scope) */}
          {/* 
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <Button variant="outline" disabled={isLoading}> Placeholder: Google</Button>
             <Button variant="outline" disabled={isLoading}> Placeholder: GitHub</Button>
          </div>
          */}
          
        </CardContent>
        <CardFooter className="flex-col items-center space-y-2">
           <p className="text-center text-sm text-muted-foreground">
             Don't have an account?{" "}
            <Button asChild variant="link" className="h-auto p-0">
               <Link to="/register">Sign up</Link>
             </Button>
           </p>
           {/* Optional: Link to terms/privacy */}
           {/* <p className="text-xs text-muted-foreground">
              By signing in, you agree to our Terms and Privacy Policy.
           </p> */}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default Login; 