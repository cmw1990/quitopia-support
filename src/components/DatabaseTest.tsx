import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { DatabaseService } from '../services/DatabaseService';
import { testSupabaseConnection, initializeBlockingTables } from '../integrations/supabase/test-connection';
import { Loader2, ShieldAlert, CheckCircle, DatabaseIcon, RefreshCw } from 'lucide-react';

export function DatabaseTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    message?: string;
    details?: string;
  }>({});
  const [initResult, setInitResult] = useState<{
    success?: boolean;
    message?: string;
    tablesModified?: boolean;
  }>({});

  async function testConnection() {
    setIsLoading(true);
    setTestResult({});
    setInitResult({});
    
    try {
      const result = await testSupabaseConnection();
      setTestResult({
        success: result.success,
        message: result.message,
        details: result.error ? JSON.stringify(result.error, null, 2) : undefined
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error instanceof Error ? error.stack : undefined
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function initTables() {
    setIsLoading(true);
    setInitResult({});
    
    try {
      const result = await initializeBlockingTables();
      setInitResult({
        success: result.success,
        message: result.message,
        tablesModified: result.tablesModified
      });
    } catch (error) {
      setInitResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DatabaseIcon className="h-5 w-5" />
          Database Connection Test
        </CardTitle>
        <CardDescription>
          Test your connection to the Supabase database and initialize tables
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        
        {testResult.success === true && (
          <div className="p-4 bg-green-50 text-green-700 rounded-md flex items-start gap-2">
            <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Connection successful!</p>
              <p className="text-sm">{testResult.message}</p>
              {testResult.details && (
                <pre className="mt-2 text-xs bg-green-100 p-2 rounded overflow-auto">
                  {testResult.details}
                </pre>
              )}
            </div>
          </div>
        )}
        
        {testResult.success === false && (
          <div className="p-4 bg-red-50 text-red-700 rounded-md flex items-start gap-2">
            <ShieldAlert className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Connection failed</p>
              <p className="text-sm">{testResult.message}</p>
              {testResult.details && (
                <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
                  {testResult.details}
                </pre>
              )}
            </div>
          </div>
        )}
        
        {initResult.success === true && (
          <div className="p-4 bg-blue-50 text-blue-700 rounded-md flex items-start gap-2">
            <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Tables initialized!</p>
              <p className="text-sm">{initResult.message}</p>
              <p className="text-sm mt-1">
                Tables modified: {initResult.tablesModified ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        )}
        
        {initResult.success === false && (
          <div className="p-4 bg-red-50 text-red-700 rounded-md flex items-start gap-2">
            <ShieldAlert className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Table initialization failed</p>
              <p className="text-sm">{initResult.message}</p>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={testConnection}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Test Connection
        </Button>
        
        <Button
          variant="outline"
          onClick={initTables}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <DatabaseIcon className="h-4 w-4" />}
          Initialize Tables
        </Button>
      </CardFooter>
    </Card>
  );
}
