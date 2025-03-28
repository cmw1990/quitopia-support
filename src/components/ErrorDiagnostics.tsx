import React, { useState } from 'react';
import { useErrorScanner } from '../hooks/useErrorScanner';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { AlertCircle, Info, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';

interface ErrorDiagnosticsProps {
  className?: string;
  showControls?: boolean;
  maxHeight?: string;
  interval?: number;
}

const ErrorDiagnostics: React.FC<ErrorDiagnosticsProps> = ({
  className = '',
  showControls = true,
  maxHeight = '500px',
  interval = 0
}) => {
  const [automaticScanning, setAutomaticScanning] = useState(true);
  const [showConsoleOutput, setShowConsoleOutput] = useState(true);
  
  const { 
    scanResults, 
    isScanning, 
    lastScanned, 
    performScan, 
    clearResults, 
    errorSummary 
  } = useErrorScanner({
    automaticScanning,
    scanInterval: interval,
    consoleOutput: showConsoleOutput
  });
  
  // Helper function to get appropriate badge color based on severity
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 hover:bg-red-600';
      case 'high': return 'bg-orange-500 hover:bg-orange-600';
      case 'medium': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'low': return 'bg-green-500 hover:bg-green-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };
  
  // Helper function to get appropriate icon for error type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'api': return <AlertCircle className="h-4 w-4 mr-1" />;
      case 'render': return <AlertCircle className="h-4 w-4 mr-1" />;
      case 'network': return <AlertCircle className="h-4 w-4 mr-1" />;
      case 'auth': return <AlertCircle className="h-4 w-4 mr-1" />;
      default: return <Info className="h-4 w-4 mr-1" />;
    }
  };
  
  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  
  return (
    <Card className={`${className} bg-card shadow-md border border-border rounded-lg`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            Error Diagnostics
            <Badge variant="outline" className="ml-2">
              {errorSummary.totalErrors} total
            </Badge>
            
            {errorSummary.critical > 0 && (
              <Badge className={getSeverityColor('critical')}>
                {errorSummary.critical} critical
              </Badge>
            )}
            
            {errorSummary.high > 0 && (
              <Badge className={getSeverityColor('high')}>
                {errorSummary.high} high
              </Badge>
            )}
          </div>
          
          {lastScanned && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTime(lastScanned)}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Last scanned at {lastScanned.toLocaleString()}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardTitle>
        
        <CardDescription>
          Diagnostic tool to identify and fix errors in the application
        </CardDescription>
      </CardHeader>
      
      {showControls && (
        <div className="px-6 pb-2 pt-0 flex flex-wrap gap-4 items-center justify-between">
          <Button 
            onClick={performScan} 
            disabled={isScanning}
            variant="outline"
            size="sm"
          >
            {isScanning ? 'Scanning...' : 'Scan Now'}
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-scan"
                checked={automaticScanning}
                onCheckedChange={setAutomaticScanning}
              />
              <Label htmlFor="auto-scan">Auto scan</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="console-output"
                checked={showConsoleOutput}
                onCheckedChange={setShowConsoleOutput}
              />
              <Label htmlFor="console-output">Console output</Label>
            </div>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={() => clearResults()} 
                    variant="ghost" 
                    size="icon"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clear all results</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}
      
      <CardContent>
        {errorSummary.totalErrors === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
            <h3 className="text-lg font-medium">All Clear!</h3>
            <p className="text-muted-foreground">No errors detected in scanned routes</p>
          </div>
        ) : (
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Routes</TabsTrigger>
              <TabsTrigger value="critical">Critical</TabsTrigger>
              <TabsTrigger value="bytype">By Type</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <ScrollArea className="h-full" style={{ maxHeight }}>
                <Accordion type="single" collapsible className="w-full">
                  {scanResults.map((result, index) => (
                    <AccordionItem value={`item-${index}`} key={`${result.path}-${index}`}>
                      <AccordionTrigger className="flex justify-between items-center px-4">
                        <div className="flex items-center gap-2">
                          <span>{result.path}</span>
                          <Badge variant="outline">{result.errors.length} errors</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        {result.errors.length === 0 ? (
                          <div className="px-4 py-2 text-green-600 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            No errors on this route
                          </div>
                        ) : (
                          <div className="space-y-2 px-4 py-2">
                            {result.errors.map((error, errorIndex) => (
                              <div 
                                key={errorIndex} 
                                className={`p-3 rounded-md text-sm ${
                                  error.severity === 'critical' ? 'bg-red-100 text-red-800' : 
                                  error.severity === 'high' ? 'bg-orange-100 text-orange-800' : 
                                  error.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-green-100 text-green-800'
                                }`}
                              >
                                <div className="flex justify-between mb-1">
                                  <div className="flex items-center">
                                    {getTypeIcon(error.type)}
                                    <span className="font-medium capitalize">
                                      {error.type} Error
                                    </span>
                                  </div>
                                  <Badge className={getSeverityColor(error.severity)}>
                                    {error.severity}
                                  </Badge>
                                </div>
                                <div className="font-mono text-xs overflow-x-auto">
                                  {error.message}
                                </div>
                                <div className="text-xs mt-1 text-right">
                                  {formatTime(error.timestamp)}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="critical">
              <ScrollArea className="h-full" style={{ maxHeight }}>
                {scanResults.flatMap(result => 
                  result.errors
                    .filter(error => error.severity === 'critical' || error.severity === 'high')
                    .map((error, errorIndex) => (
                      <div 
                        key={`${result.path}-${errorIndex}`} 
                        className={`p-3 rounded-md text-sm mb-2 ${
                          error.severity === 'critical' ? 'bg-red-100 text-red-800' : 
                          'bg-orange-100 text-orange-800'
                        }`}
                      >
                        <div className="flex justify-between mb-1">
                          <div className="flex items-center">
                            {getTypeIcon(error.type)}
                            <span className="font-medium capitalize">
                              {error.type} Error on {result.path}
                            </span>
                          </div>
                          <Badge className={getSeverityColor(error.severity)}>
                            {error.severity}
                          </Badge>
                        </div>
                        <div className="font-mono text-xs overflow-x-auto">
                          {error.message}
                        </div>
                      </div>
                    ))
                ).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
                    <h3 className="text-lg font-medium">No Critical Errors!</h3>
                    <p className="text-muted-foreground">No critical or high severity errors detected</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {scanResults.flatMap(result => 
                      result.errors
                        .filter(error => error.severity === 'critical' || error.severity === 'high')
                        .map((error, errorIndex) => (
                          <div 
                            key={`${result.path}-${errorIndex}`} 
                            className={`p-3 rounded-md text-sm ${
                              error.severity === 'critical' ? 'bg-red-100 text-red-800' : 
                              'bg-orange-100 text-orange-800'
                            }`}
                          >
                            <div className="flex justify-between mb-1">
                              <div className="flex items-center">
                                {getTypeIcon(error.type)}
                                <span className="font-medium capitalize">
                                  {error.type} Error on {result.path}
                                </span>
                              </div>
                              <Badge className={getSeverityColor(error.severity)}>
                                {error.severity}
                              </Badge>
                            </div>
                            <div className="font-mono text-xs overflow-x-auto">
                              {error.message}
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="bytype">
              <Tabs defaultValue="api">
                <TabsList className="mb-4">
                  <TabsTrigger value="api">API</TabsTrigger>
                  <TabsTrigger value="render">Render</TabsTrigger>
                  <TabsTrigger value="network">Network</TabsTrigger>
                  <TabsTrigger value="auth">Auth</TabsTrigger>
                  <TabsTrigger value="other">Other</TabsTrigger>
                </TabsList>
                
                {['api', 'render', 'network', 'auth', 'other'].map(errorType => (
                  <TabsContent value={errorType} key={errorType}>
                    <ScrollArea className="h-full" style={{ maxHeight }}>
                      {scanResults.flatMap(result => 
                        result.errors
                          .filter(error => error.type === errorType)
                          .map((error, errorIndex) => (
                            <div 
                              key={`${result.path}-${errorIndex}`} 
                              className={`p-3 rounded-md text-sm mb-2 ${
                                error.severity === 'critical' ? 'bg-red-100 text-red-800' : 
                                error.severity === 'high' ? 'bg-orange-100 text-orange-800' : 
                                error.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-green-100 text-green-800'
                              }`}
                            >
                              <div className="flex justify-between mb-1">
                                <div className="flex items-center">
                                  {getTypeIcon(error.type)}
                                  <span className="font-medium capitalize">
                                    {result.path}
                                  </span>
                                </div>
                                <Badge className={getSeverityColor(error.severity)}>
                                  {error.severity}
                                </Badge>
                              </div>
                              <div className="font-mono text-xs overflow-x-auto">
                                {error.message}
                              </div>
                            </div>
                          ))
                      ).length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
                          <h3 className="text-lg font-medium">No {errorType.charAt(0).toUpperCase() + errorType.slice(1)} Errors</h3>
                          <p className="text-muted-foreground">No errors of this type detected</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {scanResults.flatMap(result => 
                            result.errors
                              .filter(error => error.type === errorType)
                              .map((error, errorIndex) => (
                                <div 
                                  key={`${result.path}-${errorIndex}`} 
                                  className={`p-3 rounded-md text-sm ${
                                    error.severity === 'critical' ? 'bg-red-100 text-red-800' : 
                                    error.severity === 'high' ? 'bg-orange-100 text-orange-800' : 
                                    error.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                                    'bg-green-100 text-green-800'
                                  }`}
                                >
                                  <div className="flex justify-between mb-1">
                                    <div className="flex items-center">
                                      {getTypeIcon(error.type)}
                                      <span className="font-medium capitalize">
                                        {result.path}
                                      </span>
                                    </div>
                                    <Badge className={getSeverityColor(error.severity)}>
                                      {error.severity}
                                    </Badge>
                                  </div>
                                  <div className="font-mono text-xs overflow-x-auto">
                                    {error.message}
                                  </div>
                                </div>
                              ))
                          )}
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>
                ))}
              </Tabs>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default ErrorDiagnostics; 