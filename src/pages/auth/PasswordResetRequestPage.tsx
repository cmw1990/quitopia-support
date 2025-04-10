import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/supabase-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Mail } from 'lucide-react';

export const PasswordResetRequestPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const { toast } = useToast();

  const handleResetRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // IMPORTANT: Configure the redirect URL in your Supabase project settings!
      // Go to Authentication -> URL Configuration -> Site URL & Additional Redirect URLs
      // The redirect URL should point to where your PasswordUpdatePage is hosted.
      // For local development, it might be http://localhost:5173/update-password
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
          // redirectTo: 'http://localhost:5173/update-password', // Example - Ensure this matches your deployment/local setup
      });

      if (error) {
        throw error;
      }

      setMessage('Password reset instructions have been sent to your email address. Please check your inbox (and spam folder).');
      toast({
          title: "Check Your Email",
          description: "Password reset instructions sent successfully."
      })
      setEmail(''); // Clear email field on success

    } catch (error: any) {
      console.error('Password Reset Request Error:', error);
      setMessage('Failed to send password reset email. Please check the email address and try again.');
       toast({
           title: "Error",
           description: error.message || "Failed to send password reset email.",
           variant: "destructive"
       })
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Reset Your Password</CardTitle>
          <CardDescription>Enter your email address and we'll send you a link to reset your password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetRequest} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                 <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                 <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                 />
              </div>
            </div>
            
            {message && (
              <p className={`text-sm ${message.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
                {message}
              </p>
            )}

            <Button type="submit" disabled={isLoading || !email} className="w-full">
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
           <div className="mt-4 text-center text-sm">
              Remember your password?{" "}
              <Link to="/login" className="underline hover:text-primary">
                Sign in
              </Link>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}; 