import { useState, useEffect } from 'react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Bug, 
  RefreshCw, 
  Shield, 
  User, 
  LogOut,
  Database, 
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import { SUPABASE_URL, SUPABASE_KEY } from '@/integrations/supabase/db-client';

export function AuthDebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [configStatus, setConfigStatus] = useState<boolean | null>(null);
  const [sessionStatus, setSessionStatus] = useState<boolean | null>(null);
  const [dbStatus, setDbStatus] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionDetails, setSessionDetails] = useState<any>(null);

  // Run initial status check
  useEffect(() => {
    if (isOpen) {
      runDiagnostics();
    }
  }, [isOpen]);

  const checkSupabaseConfig = () => {
    return !!SUPABASE_URL && !!SUPABASE_KEY;
  };

  const checkActiveSession = async () => {
    const storedSession = localStorage.getItem('supabase.auth.token');
    const session = storedSession ? JSON.parse(storedSession) : null;
    
    if (!session?.access_token) return false;

    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': SUPABASE_KEY
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Error checking session:', error);
      return false;
    }
  };

  const testDatabaseConnection = async () => {
    const storedSession = localStorage.getItem('supabase.auth.token');
    const session = storedSession ? JSON.parse(storedSession) : null;
    
    if (!session?.access_token) return false;

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/test_connection?select=id&limit=1`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': SUPABASE_KEY
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Error testing database connection:', error);
      return false;
    }
  };

  const runDiagnostics = async () => {
    setLoading(true);
    
    try {
      // Check config
      const configOk = checkSupabaseConfig();
      setConfigStatus(configOk);
      
      // Only proceed if config is OK
      if (configOk) {
        // Check session
        const sessionActive = await checkActiveSession();
        setSessionStatus(sessionActive);
        
        // Get session details if active
        if (sessionActive) {
          const storedSession = localStorage.getItem('supabase.auth.token');
          const session = storedSession ? JSON.parse(storedSession) : null;
          
          if (session?.access_token) {
            const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'apikey': SUPABASE_KEY
              }
            });

            if (response.ok) {
              const user = await response.json();
              setSessionDetails({
                user: user.email,
                expiresAt: new Date(session.expires_at).toLocaleString()
              });
            }
          }
        }
        
        // Check database
        const dbConnected = await testDatabaseConnection();
        setDbStatus(dbConnected);
      }
    } catch (error) {
      console.error('Error running diagnostics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY
        },
        body: JSON.stringify({
          email: 'demo@example.com',
          password: 'demo123'
        })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: Date.now() + (data.expires_in * 1000)
      }));

      // Re-run diagnostics after login
      await runDiagnostics();
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      const storedSession = localStorage.getItem('supabase.auth.token');
      const session = storedSession ? JSON.parse(storedSession) : null;
      
      if (session?.access_token) {
        await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': SUPABASE_KEY
          }
        });
      }

      localStorage.removeItem('supabase.auth.token');
      setSessionDetails(null);
      setSessionStatus(false);
      
      // Re-run diagnostics after logout
      await runDiagnostics();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatusBadge = ({ status }: { status: boolean | null }) => {
    if (status === null) return <Badge variant="outline">Unknown</Badge>;
    if (status === true) return <Badge className="bg-green-500 text-white hover:bg-green-600">Success</Badge>;
    return <Badge variant="destructive">Failed</Badge>;
  };

  // Fixed position button to toggle debug panel
  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50 rounded-full h-10 w-10"
        onClick={() => setIsOpen(true)}
      >
        <Bug className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Auth Diagnostics
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Troubleshoot authentication and database issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {/* Supabase Config */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Supabase Config</span>
              </div>
              <StatusBadge status={configStatus} />
            </div>

            {/* Auth Session */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Active Session</span>
              </div>
              <StatusBadge status={sessionStatus} />
            </div>

            {/* Database Connection */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span>Database Connection</span>
              </div>
              <StatusBadge status={dbStatus} />
            </div>
          </div>

          {/* Session Details */}
          {sessionStatus && sessionDetails && (
            <Alert className="mt-4">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Session Active</AlertTitle>
              <AlertDescription>
                <div className="text-xs mt-2">
                  <p><strong>User:</strong> {sessionDetails.user}</p>
                  <p><strong>Expires:</strong> {sessionDetails.expiresAt}</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alerts */}
          {configStatus === false && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Configuration Error</AlertTitle>
              <AlertDescription>
                Supabase configuration is missing or incomplete. Check environment variables.
              </AlertDescription>
            </Alert>
          )}

          {configStatus && sessionStatus === false && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Authentication Required</AlertTitle>
              <AlertDescription>
                No active session found. Please log in to access the application.
              </AlertDescription>
            </Alert>
          )}

          {configStatus && sessionStatus && dbStatus === false && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Database Connection Failed</AlertTitle>
              <AlertDescription>
                Connected to Supabase but unable to access the database. Check console for details.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={runDiagnostics}
              disabled={loading}
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              {loading ? 'Running...' : 'Run Diagnostics'}
            </Button>
            {sessionStatus ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={loading}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogin}
                disabled={loading}
              >
                <User className="h-4 w-4 mr-2" />
                Demo Login
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            Close
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 