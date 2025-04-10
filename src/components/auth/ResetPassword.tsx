import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../AuthProvider";
import { Loader2, ArrowLeft, Check } from "lucide-react";

// Form schema
const formSchema = z
  .object({
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof formSchema>;

export default function ResetPassword() {
  const { updatePassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Extract token from URL
    const searchParams = new URLSearchParams(location.search);
    const accessToken = searchParams.get('token');
    setToken(accessToken);
    
    if (!accessToken) {
      toast({
        title: "Invalid Reset Link",
        description: "The password reset link is invalid or has expired",
        variant: "destructive",
      });
    }
  }, [location]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!token) {
      toast({
        title: "Error",
        description: "No reset token found",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await updatePassword(token, data.password);
      setIsComplete(true);
      toast({
        title: "Password Reset Successful",
        description: "Your password has been updated",
        variant: "default",
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Password update error:", error);
      }
      
      toast({
        title: "Error updating password",
        description: (error as Error)?.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isComplete) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
          <Check className="text-green-600 h-6 w-6" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Password Reset Complete</h1>
          <p className="text-muted-foreground">
            Your password has been successfully reset. You can now log in with your new password.
          </p>
        </div>
        
        <Button asChild className="w-full">
          <Link to="/login">
            Go to Login
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Reset Password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your new password below
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            New Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={!token}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={!token}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading || !token}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>

      <div className="text-center">
        <Link
          to="/login"
          className="text-sm text-primary hover:underline inline-flex items-center"
        >
          <ArrowLeft className="mr-1 h-3 w-3" />
          Back to Login
        </Link>
      </div>
    </div>
  );
} 