import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn, signUp, getCurrentUser } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Battery, LogIn, Bug, RefreshCw, Info, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { testSupabaseConnection } from '@/integrations/supabase/test-connection';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SUPABASE_URL, SUPABASE_KEY } from '@/integrations/supabase/db-client';

interface AuthPageProps {
  mode?: 'signin' | 'signup';
  redirect?: string;
}

const AuthPage: React.FC<AuthPageProps> = ({ mode = 'signin', redirect = '/' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [debug, setDebug] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    getCurrentUser().then(({ data }) => {
      if (data?.user) {
        navigate('/app/care-connector/app/groups');
      }
      setLoading(false);
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await signUp({ email, password });
        if (error) throw error;
        // Show success message for signup
        toast({
          title: 'Check your email',
          description: 'We sent you a confirmation link to complete your registration.',
        });
        navigate(redirect);
      } else {
        console.log('Attempting to sign in with:', email);
        const { data, error } = await signIn({ email, password });
        
        if (error) {
          console.error('Sign in error:', error);
          setError(typeof error === 'object' ? 
            (error.message || 'Invalid email or password') : 
            'Authentication failed. Please try again.');
          throw error;
        }
        
        if (!data?.access_token) {
          console.error('Sign in failed: No access token received');
          throw new Error('Authentication failed: No access token received');
        }
        
        console.log('Sign in successful. Token stored in localStorage.');
        
        // Redirect on successful signin
        toast({
          title: "Signed in successfully",
          description: "Welcome back!",
        });
        navigate(redirect);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(typeof err === 'object' ? 
        (err.message || 'Authentication failed') : 
        'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const runConnectionTest = async () => {
    setLoading(true);
    setErrorDetails(null);
    const result = await testSupabaseConnection();
    setTestResult(result);
    setLoading(false);
    
    if (!result.success) {
      setErrorDetails(JSON.stringify(result.error, null, 2));
      toast({
        title: 'Connection Test Failed',
        description: result.message || 'Unknown error',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Connection Test Succeeded',
        description: 'Successfully connected to Supabase',
      });
    }
  };

  const useTestAccount = () => {
    setEmail('hertzofhopes@gmail.com');
    setPassword('J4913836j');
    toast({
      title: 'Demo Account Loaded',
      description: 'Using the demo account for testing',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-4">
            <Battery className="size-6 text-primary" />
            <span className="text-xl font-semibold">Mission Fresh</span>
            {/* Debug toggle */}
            <Button 
              variant="ghost" 
              size="icon"
              className="ml-auto"
              onClick={() => setDebug(!debug)}
            >
              <Bug className="h-4 w-4" />
            </Button>
          </div>
          <CardTitle className="text-2xl">{mode === 'signin' ? 'Sign in to your account' : 'Create a new account'}</CardTitle>
          <CardDescription>
            {mode === 'signin'
              ? 'Enter your email and password to access Mission Fresh'
              : 'Enter your email and password to create your account for Mission Fresh'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorDetails && (
            <Alert variant="destructive" className="mb-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Error Details</AlertTitle>
              <AlertDescription>
                <pre className="text-xs mt-2 p-2 bg-destructive/10 rounded-md overflow-auto max-h-32">
                  {errorDetails}
                </pre>
              </AlertDescription>
            </Alert>
          )}
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {mode === 'signin' ? 'Sign in' : 'Sign up'}
              </button>
            </div>
          </form>

          <div className="text-center">
            <button
              onClick={() => navigate(mode === 'signin' ? '/signup' : '/signin')}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              {mode === 'signin'
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>

          {/* Demo account button */}
          <div className="mt-4 pt-4 border-t text-center">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center mx-auto gap-2"
              onClick={useTestAccount}
            >
              <User className="h-4 w-4" />
              Use Demo Account
            </Button>
          </div>

          {/* Debug section */}
          {debug && (
            <div className="mt-6 pt-4 border-t">
              <h3 className="text-sm font-medium mb-2">Debug Tools</h3>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full flex items-center gap-2"
                onClick={runConnectionTest}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4" />
                Test Database Connection
              </Button>
              
              {testResult && (
                <div className="mt-3 p-3 bg-muted rounded-md text-xs overflow-auto max-h-32">
                  <pre className={testResult.success ? 'text-green-600' : 'text-red-600'}>
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                </div>
              )}
              
              <div className="mt-4">
                <h4 className="text-xs font-medium mb-1">Supabase Configuration</h4>
                <div className="text-xs p-2 bg-muted rounded overflow-auto">
                  URL: {SUPABASE_URL ? '✓ Set' : '❌ Missing'}<br />
                  Key: {SUPABASE_KEY ? '✓ Set' : '❌ Missing'}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
