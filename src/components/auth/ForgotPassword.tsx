import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../AuthProvider";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { handleError } from "../../utils/error-handler";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";

// Form schema
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
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

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await resetPassword(data.email);
      setIsSubmitted(true);
      toast({
        title: "Reset Email Sent",
        description: "Check your email for password reset instructions.",
        variant: "default",
      });
    } catch (error) {
      handleError(error, "ForgotPassword.onSubmit", "Request Processing Error");
      toast({
        title: "Request Processed",
        description: "If your email is registered, you will receive instructions.",
        variant: "default",
      });
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    setIsSubmitted(false);
    reset();
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
                <CardTitle className="text-2xl">Check Your Email</CardTitle>
                <CardDescription>
                  We've sent a password reset link to your email address. Please follow the instructions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <Button asChild className="w-full" variant="outline">
                    <Link to="/login">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Login
                    </Link>
                  </Button>
                  <p className="text-center text-sm text-muted-foreground pt-2">
                    Didn't receive an email?{" "}
                    <button
                      type="button"
                      className="font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                      onClick={handleTryAgain}
                    >
                      Try sending again
                    </button>
                  </p>
              </CardContent>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Forgot Your Password?</CardTitle>
                <CardDescription>
                  No problem. Enter your email below and we'll send you a link to reset it.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email Address</Label> 
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      {...register("email")}
                      aria-invalid={errors.email ? "true" : "false"}
                    />
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

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                    aria-live="polite"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending Reset Link...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="justify-center">
                 <Button asChild variant="ghost" className="text-sm text-muted-foreground hover:text-primary">
                   <Link to="/login">
                    <ArrowLeft className="mr-1 h-3 w-3" />
                    Back to Login
                  </Link>
                 </Button>
              </CardFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
} 