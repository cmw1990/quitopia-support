import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/supabase-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Lock, Eye, EyeOff } from 'lucide-react';

export const PasswordUpdatePage: React.FC = () => {
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle the password update logic when the component mounts
  // Supabase redirects here with specific hash parameters after email link is clicked
  // We don't need to explicitly handle the token here if using updateUser
  // Supabase automatically signs the user in based on the token in the URL hash.
  
  useEffect(() => {
     // Optional: Check if user is already signed in via the reset link
     // This might involve checking supabase.auth.getSession() or listening to auth changes
     // If the user isn't signed in upon landing here, the updateUser call might fail.
     // Supabase *should* handle this session automatically via the hash.
  }, []);

  const handlePasswordUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      // User should be signed in automatically by Supabase via the URL hash
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        throw error;
      }
      
      setMessage('Your password has been updated successfully!');
      toast({
          title: "Password Updated",
          description: "You can now sign in with your new password.",
      });
      // Redirect to login page after a short delay
      setTimeout(() => navigate('/login'), 2000);

    } catch (error: any) {
      console.error('Password Update Error:', error);
      setError(error.message || 'Failed to update password. The link may have expired or been used already.');
      toast({
          title: "Error Updating Password",
          description: error.message || "Failed to update password.",
          variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleShowPassword = () => setShowPassword(!showPassword);
  const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Update Your Password</CardTitle>
          <CardDescription>Enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                 <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                 <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 pr-10"
                 />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 px-0"
                    onClick={toggleShowPassword}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                 >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                 </Button>
              </div>
            </div>

             <div className="space-y-1">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                 <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                 <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pl-10 pr-10"
                 />
                 <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 px-0"
                    onClick={toggleShowConfirmPassword}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                 >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                 </Button>
              </div>
            </div>
            
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            {message && (
              <p className="text-sm text-green-600">{message}</p>
            )}

            <Button type="submit" disabled={isLoading || !password || !confirmPassword} className="w-full">
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}; 