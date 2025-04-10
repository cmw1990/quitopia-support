import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Ban, BarChartHorizontalBig, AlertCircle } from 'lucide-react';

const DistractionBlockerPage: React.FC = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-3 mb-2">
          <Ban className="h-7 w-7 text-primary" />
         <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Distraction Blocker Analytics</h1>
      </div>
      <p className="text-muted-foreground">
         Analyze your distraction patterns and blocker effectiveness. (Requires data logging from blocker integration).
      </p>

      <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChartHorizontalBig size={18}/> Blocking Summary</CardTitle>
              <CardDescription>Overview of blocking activity.</CardDescription>
          </CardHeader>
          <CardContent>
              <Alert variant="default" className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                  <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertTitle className="text-blue-800 dark:text-blue-200">Data Unavailable</AlertTitle>
                  <AlertDescription className="text-blue-700 dark:text-blue-300 text-sm">
                      Analytics data will appear here once the distraction blocking integration is active and logging data.
                      Currently, you can configure the blocker in Settings.
                  </AlertDescription>
              </Alert>
              {/* Placeholder for charts/stats once data is available */}
              {/* Example: Most blocked sites, blocked attempts over time, etc. */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-40 bg-muted rounded-md flex items-center justify-center text-sm text-muted-foreground italic">
                      (Chart: Top Blocked Domains)
                  </div>
                   <div className="h-40 bg-muted rounded-md flex items-center justify-center text-sm text-muted-foreground italic">
                       (Stat: Total Blocks Today)
                  </div>
              </div>
          </CardContent>
      </Card>

       {/* Placeholder for other analytics sections */}
       {/* e.g., Pattern Analysis, Override Logs */}

    </div>
  );
};

export default DistractionBlockerPage; 