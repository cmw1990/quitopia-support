import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from '@/components/ui/use-toast'
import { handleError } from '../../utils/error-handler'
import { useAuth } from '../AuthProvider'

// Helper to check if token is stored in localStorage
const hasStoredToken = (): boolean => {
  try {
    const token = localStorage.getItem('supabase.auth.token');
    if (!token) return false;
    
    const parsedToken = JSON.parse(token);
    const accessToken = parsedToken?.currentSession?.access_token;
    
    // We only care if there's a token, not if it's expired
    // Tokens should only be removed on explicit sign out
    return !!accessToken;
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error checking token:', e);
    }
    return false;
  }
}

export const AuthButton = () => {
  const { user, signOut } = useAuth()
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      toast({
        title: "Success",
        description: "Logged out successfully"
      });
      navigate('/');
    } catch (error) {
      handleError(error, 'AuthButton.handleSignOut', 'Logout failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  if (loading) {
    return <Button disabled>Loading...</Button>
  }

  if (!user) {
    return (
      <Button onClick={handleLoginClick} variant="default">
        <LogIn className="size-4 mr-2" />
        Login
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative size-8 rounded-full">
          <User className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.email}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.id}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/dashboard')}>
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
          <LogOut className="size-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
