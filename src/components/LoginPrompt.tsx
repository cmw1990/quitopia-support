import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, LogIn, UserPlus } from 'lucide-react';

export function LoginPrompt() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card className="max-w-md w-full mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Authentication Required</CardTitle>
          <CardDescription>
            Please sign in to access your personalized dashboard and track your progress.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Your health journey data is private and secure. Sign in to continue your progress.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            className="w-full" 
            onClick={() => navigate('/auth/login')}
          >
            <LogIn className="mr-2 h-4 w-4" />
            Sign In
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => navigate('/auth/register')}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Create Account
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 