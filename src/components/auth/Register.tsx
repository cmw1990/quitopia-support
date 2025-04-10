import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../AuthProvider";
import { Loader2, Eye, EyeOff, Mail, LockKeyhole, CheckCircle, Info } from 'lucide-react';
import { handleError } from "../../utils/error-handler";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

// Form schema with password confirmation
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }), // Enforce 8 characters
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // Apply error to confirmPassword field
});

type FormData = z.infer<typeof formSchema>;

// Animation variants (consistent)
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

const Register: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false); // State to track submission success
  const [submittedEmail, setSubmittedEmail] = useState<string>(""); // Store email for success message
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setApiError(null);

    try {
      // Use signUp from AuthProvider (uses auth-service -> REST API)
      await signUp(data.email, data.password);
      
      setSubmittedEmail(data.email);
      setIsSubmitted(true); // Show success view
      reset(); // Clear the form
      
      // No toast here, the success view provides feedback
      
    } catch (error: any) {
      handleError(error, "Register.onSubmit", "Registration Failed");
      
      // Set specific API error message
      let specificMessage = "Registration failed. Please try again.";
       if (error?.message) {
            if (error.message.includes('User already registered')) {
                specificMessage = "An account with this email already exists. Try logging in.";
            } else {
                specificMessage = error.message;
            }
        }
      setApiError(specificMessage);
      
    } finally {
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
         <AnimatePresence mode="wait">
           {isSubmitted ? (
             // Success View (similar to ForgotPassword)
             <motion.div
               key="submitted"
               initial="initial"
               animate="in"
               exit="out"
               variants={pageVariants}
               transition={pageTransition}
             >
               <CardHeader className="text-center">
                 <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                   <CheckCircle className="h-6 w-6" />
                 </div>
                 <CardTitle className="text-2xl">Confirm Your Email</CardTitle>
                 <CardDescription>
                   We've sent a confirmation link to <strong>{submittedEmail}</strong>. Please check your inbox and follow the link to activate your account.
                 </CardDescription>
               </CardHeader>
               <CardContent>
                  <Button asChild className="w-full" variant="outline">
                     <Link to="/login">
                       Back to Login
                     </Link>
                   </Button>
               </CardContent>
             </motion.div>
           ) : (
             // Registration Form View
             <motion.div
               key="form"
               initial="initial"
               animate="in"
               exit="out"
               variants={pageVariants}
               transition={pageTransition}
             >
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Create Your Account</CardTitle>
                  <CardDescription>
                    Join Easier Focus and start improving your concentration today.
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
                          <AlertTitle>Registration Error</AlertTitle>
                          <AlertDescription>{apiError}</AlertDescription>
                        </Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                        />
                      </div>
                      <AnimatePresence>
                         {errors.email && (
                           <motion.p className="text-sm text-destructive" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} aria-live="polite">{errors.email.message}</motion.p>
                         )}
                      </AnimatePresence>
                    </div>
                    
                    {/* Password Field */}
                    <div className="space-y-1.5">
                       <Label htmlFor="password">Password</Label>
                       <div className="relative">
                         <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                         <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password (min. 8 chars)"
                          autoComplete="new-password"
                          className="pl-10 pr-10"
                          {...register("password")}
                          aria-invalid={errors.password ? "true" : "false"}
                        />
                        <Button variant="ghost" size="icon" type="button" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                       </div>
                       <AnimatePresence>
                         {errors.password && (
                           <motion.p className="text-sm text-destructive" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} aria-live="polite">{errors.password.message}</motion.p>
                         )}
                      </AnimatePresence>
                    </div>

                    {/* Confirm Password Field */}
                     <div className="space-y-1.5">
                       <Label htmlFor="confirmPassword">Confirm Password</Label>
                       <div className="relative">
                         <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                         <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          autoComplete="new-password"
                          className="pl-10 pr-10"
                          {...register("confirmPassword")}
                           aria-invalid={errors.confirmPassword ? "true" : "false"}
                        />
                        <Button variant="ghost" size="icon" type="button" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? "Hide password" : "Show password"}>
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                       </div>
                       <AnimatePresence>
                         {errors.confirmPassword && (
                           <motion.p className="text-sm text-destructive" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} aria-live="polite">{errors.confirmPassword.message}</motion.p>
                         )}
                      </AnimatePresence>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading} aria-live="polite">
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="flex-col items-center space-y-2">
                   <p className="text-center text-sm text-muted-foreground">
                     Already have an account?{" "}
                     <Button asChild variant="link" className="h-auto p-0">
                       <Link to="/login">Sign in</Link>
                     </Button>
                  </p>
                   {/* Optional: Link to terms/privacy */}
                   <p className="text-xs text-muted-foreground px-4 text-center">
                       By creating an account, you agree to our (non-existent yet) Terms of Service and Privacy Policy.
                   </p>
                </CardFooter>
             </motion.div>
           )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

export default Register; 