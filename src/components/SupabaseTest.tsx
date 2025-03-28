import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { supabaseRestCall } from "../api/apiCompatibility";

interface TestResults {
  directRestApi: {
    success: boolean;
    message: string;
    data?: any;
  };
  compatibilityLayer: {
    success: boolean;
    message: string;
    data?: any;
  };
}

export function SupabaseTest() {
  const { session } = useAuth();
  const [results, setResults] = useState<TestResults>({
    directRestApi: {
      success: false,
      message: 'Not tested yet'
    },
    compatibilityLayer: {
      success: false,
      message: 'Not tested yet'
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const runTest = async () => {
    setIsLoading(true);
    const newResults: TestResults = {
      directRestApi: {
        success: false,
        message: 'Not tested yet'
      },
      compatibilityLayer: {
        success: false,
        message: 'Not tested yet'
      }
    };

    // Test direct REST API call
    try {
      const endpoint = '/rest/v1/profiles?select=*&limit=1';
      const directData = await supabaseRestCall(endpoint, {}, session);
      newResults.directRestApi = {
        success: true,
        message: 'Direct REST API call successful',
        data: directData
      };
    } catch (error) {
      newResults.directRestApi = {
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }

    // Test compatibility layer
    try {
      const user = await supabase.auth.getUser();
      newResults.compatibilityLayer = {
        success: true,
        message: 'Compatibility layer call successful',
        data: user
      };
    } catch (error) {
      newResults.compatibilityLayer = {
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }

    setResults(newResults);
    setIsLoading(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Supabase Integration Test</CardTitle>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={runTest} 
          disabled={isLoading}
          className="mb-4"
        >
          {isLoading ? 'Testing...' : 'Run Integration Test'}
        </Button>

        <div className="grid gap-4">
          <div className="border p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-2">Direct REST API</h3>
            <p className={`text-sm ${results.directRestApi.success ? 'text-green-500' : 'text-red-500'}`}>
              {results.directRestApi.message}
            </p>
            {results.directRestApi.data && (
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                {JSON.stringify(results.directRestApi.data, null, 2)}
              </pre>
            )}
          </div>

          <div className="border p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-2">Compatibility Layer</h3>
            <p className={`text-sm ${results.compatibilityLayer.success ? 'text-green-500' : 'text-red-500'}`}>
              {results.compatibilityLayer.message}
            </p>
            {results.compatibilityLayer.data && (
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                {JSON.stringify(results.compatibilityLayer.data, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SupabaseTest; 