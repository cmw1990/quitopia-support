import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { simulateDeepLink, DeepLinkParams } from '@/utils/deepLink';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

// Test scenario interface
interface TestScenario {
  name: string;
  path: string;
  description: string;
  params?: DeepLinkParams;
}

/**
 * Component to test and demonstrate deep linking functionality
 */
export const DeepLinkHandler: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [customPath, setCustomPath] = useState<string>('');
  const [paramKey, setParamKey] = useState<string>('');
  const [paramValue, setParamValue] = useState<string>('');
  const [params, setParams] = useState<DeepLinkParams>({});
  
  // Predefined deep link test cases
  const testDeepLinks = [
    { name: "Home", path: "/" },
    { name: "Progress", path: "/progress" },
    { name: "Recipes", path: "/recipes" },
    { name: "NRT Directory", path: "/nrt-directory" },
    { name: "Community", path: "/community" },
    { name: "Settings", path: "/settings" }
  ];
  
  // Additional test scenarios with parameters
  const testScenarios: TestScenario[] = [
    { 
      name: "View Specific Product", 
      path: "/products/12345", 
      description: "View details for a specific product" 
    },
    { 
      name: "Share Progress", 
      path: "/progress", 
      params: { share: "true" },
      description: "Open progress page with sharing activated" 
    },
    { 
      name: "Community Challenge", 
      path: "/challenges", 
      params: { id: "123" },
      description: "View a specific community challenge" 
    }
  ];
  
  // Handle adding a new parameter
  const addParam = () => {
    if (paramKey && paramValue) {
      setParams({ ...params, [paramKey]: paramValue });
      setParamKey('');
      setParamValue('');
    }
  };
  
  // Remove a parameter
  const removeParam = (key: string) => {
    const newParams = { ...params };
    delete newParams[key];
    setParams(newParams);
  };
  
  // Test custom deep link
  const testCustomDeepLink = () => {
    if (customPath) {
      simulateDeepLink(customPath, params, { showToast: true });
    }
  };
  
  // Test predefined scenario
  const testScenario = (path: string, scenarioParams?: DeepLinkParams) => {
    simulateDeepLink(path, scenarioParams, { showToast: true });
  };

  // Helper function to format URL params for display
  const formatParamsForDisplay = (params?: DeepLinkParams): string => {
    if (!params || Object.keys(params).length === 0) return '';
    return `?${new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {} as Record<string, string>)
    ).toString()}`;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Deep Link Testing</CardTitle>
        <CardDescription>
          Test functionality for handling deep links to different parts of the application
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current route information */}
        <div className="space-y-2">
          <Label>Current Route</Label>
          <div className="p-4 bg-muted rounded-md font-mono text-sm">
            {location.pathname}{location.search}
          </div>
          <p className="text-sm text-muted-foreground">
            Query parameters: {location.search ? location.search : 'None'}
          </p>
        </div>
        
        <Tabs defaultValue="quick-test" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="quick-test">Quick Test</TabsTrigger>
            <TabsTrigger value="custom-link">Custom Link</TabsTrigger>
            <TabsTrigger value="scenarios">Test Scenarios</TabsTrigger>
          </TabsList>
          
          {/* Quick Test Tab */}
          <TabsContent value="quick-test" className="space-y-4">
            <div className="space-y-2">
              <Label>Common Routes</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {testDeepLinks.map((link, index) => (
                  <Button 
                    key={index} 
                    variant="outline" 
                    onClick={() => simulateDeepLink(link.path, {}, { showToast: true })}
                    className="w-full"
                  >
                    {link.name}
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>
          
          {/* Custom Link Tab */}
          <TabsContent value="custom-link" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customPath">Path</Label>
              <div className="flex gap-2">
                <Input
                  id="customPath"
                  placeholder="/your/path"
                  value={customPath}
                  onChange={(e) => setCustomPath(e.target.value)}
                />
                <Button onClick={testCustomDeepLink}>Test</Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Query Parameters</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {Object.entries(params).map(([key, value]) => (
                  <div key={key} className="flex items-center bg-muted rounded-md px-2 py-1 text-sm">
                    <span>{key}={value}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 ml-1" 
                      onClick={() => removeParam(key)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Parameter name"
                  value={paramKey}
                  onChange={(e) => setParamKey(e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Value"
                  value={paramValue}
                  onChange={(e) => setParamValue(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={addParam} variant="outline">Add</Button>
              </div>
            </div>
          </TabsContent>
          
          {/* Test Scenarios Tab */}
          <TabsContent value="scenarios" className="space-y-4">
            <div className="space-y-4">
              {testScenarios.map((scenario, index) => (
                <Card key={index} className="bg-muted/30">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base">{scenario.name}</CardTitle>
                    <CardDescription>{scenario.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="mb-2 font-mono text-xs bg-background p-2 rounded-md">
                      {scenario.path}{formatParamsForDisplay(scenario.params)}
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => testScenario(scenario.path, scenario.params)}
                    >
                      Test This Scenario
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="pt-4 text-sm text-muted-foreground border-t">
          <p className="font-medium mb-2">How Deep Linking Works</p>
          <ScrollArea className="h-[120px]">
            <ul className="list-disc pl-5 space-y-1">
              <li>Deep links allow users to navigate directly to specific content within the app</li>
              <li>In mobile apps, they can be triggered by notifications, external links, or QR codes</li>
              <li>This test tool simulates receiving deep links by dispatching custom events</li>
              <li>In a production environment, platform-specific handling would be implemented</li>
              <li>For iOS: Universal Links or Custom URL Schemes</li>
              <li>For Android: App Links or Intent Filters</li>
              <li>Web apps can use standard URLs with proper routing</li>
            </ul>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeepLinkHandler; 