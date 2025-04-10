import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/supabase-client';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

const UpdatePasswordPage = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Note: Supabase handles the session verification implicitly when the user
    // navigates here from the password reset email link.
    // The session should contain the necessary info to allow password update.
    // useEffect could be used to check for session changes or specific URL params 
    // if needed, but usually `updateUser` handles it.

    useEffect(() => {
        // Optional: Check if the user is indeed in a password recovery state
        // This might involve checking URL fragments or Supabase auth state
        // For simplicity, we assume the user is authenticated for password update
        // if they reach this page via the correct link.
        const { data: authListener } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
            if (event === 'PASSWORD_RECOVERY') {
                 console.log('User in password recovery state.');
                // Can potentially extract tokens here if needed, but updateUser uses current session
            } else if (!session) {
                // If there's no session when expected, redirect
                // toast.error('Invalid session. Please request a new password reset.');
                // navigate('/auth/forgot-password');
            }
        });

        // Cleanup listener on component unmount
        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, [navigate]);

    const handleUpdatePassword = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            toast.error("Passwords do not match.");
            return;
        }
        
        if (password.length < 6) { // Example: Enforce minimum password length
             setError("Password must be at least 6 characters long.");
             toast.error("Password must be at least 6 characters long.");
             return;
        }

        setIsLoading(true);
        console.log('Attempting to update password...');

        // --- Replace Placeholder with Actual Supabase Call ---
        try {
            // The user should be authenticated via the link click at this point.
            // updateUser uses the current session to update the password.
            const { data, error: updateError } = await supabase.auth.updateUser({ 
                password: password 
            });

            if (updateError) throw updateError;
            
            console.log('Password update successful:', data);
            toast.success('Password updated successfully! You can now log in with your new password.');
            
            // Optional: Sign out the user after successful password update
            // This forces them to log in again with the new password.
            await supabase.auth.signOut();
            
            navigate('/auth/login'); // Redirect to login

        } catch (err: any) {
            console.error('Password update error:', err);
            setError(`Failed to update password: ${err.message || 'An unknown error occurred'}`);
            toast.error(`Failed to update password: ${err.message || 'An unknown error occurred'}`);
        } finally {
            setIsLoading(false);
        }
        // --- End Supabase Call ---
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl">Set New Password</CardTitle>
                    <CardDescription>
                        Enter and confirm your new password below.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleUpdatePassword}>
                    <CardContent className="grid gap-4">
                         {error && (
                            <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive">
                                {/* Optional: Add an alert icon */}
                                <p>{error}</p>
                            </div>
                        )}
                        <div className="grid gap-2">
                             <Label htmlFor="password">New Password</Label>
                            <Input 
                                id="password" 
                                type="password" 
                                placeholder="••••••••"
                                required 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                             />
                        </div>
                         <div className="grid gap-2">
                             <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input 
                                id="confirm-password" 
                                type="password" 
                                placeholder="••••••••"
                                required 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={isLoading}
                             />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col items-center space-y-4">
                        <Button type="submit" className="w-full" disabled={isLoading}>
                           {isLoading ? 'Updating Password...' : 'Update Password'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default UpdatePasswordPage; 