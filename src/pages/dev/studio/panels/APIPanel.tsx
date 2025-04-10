import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Search, Server, Webhook } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

interface APIPanelProps {
  onNodeAdd: (nodes: any) => void;
}

const APIPanel: React.FC<APIPanelProps> = ({ onNodeAdd }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingEndpoint, setIsAddingEndpoint] = useState(false);
  const [newEndpoint, setNewEndpoint] = useState({
    name: '',
    method: 'GET',
    route: '',
    description: '',
    params: {},
    response: {},
    auth: true,
  });

  const handleAddEndpoint = () => {
    onNodeAdd((nodes: any) => [
      ...nodes,
      {
        id: `api-${Date.now()}`,
        type: 'api',
        position: { x: 100, y: 100 },
        data: {
          label: newEndpoint.name,
          method: newEndpoint.method,
          route: newEndpoint.route,
          description: newEndpoint.description,
          params: newEndpoint.params,
          response: newEndpoint.response,
          auth: newEndpoint.auth,
        },
      },
    ]);
    setIsAddingEndpoint(false);
    setNewEndpoint({
      name: '',
      method: 'GET',
      route: '',
      description: '',
      params: {},
      response: {},
      auth: true,
    });
  };

  const templates = [
    {
      name: 'CRUD Endpoints',
      description: 'Complete set of CRUD operations',
      endpoints: [
        {
          name: 'List Items',
          method: 'GET',
          route: '/api/items',
          description: 'Get all items with pagination',
        },
        {
          name: 'Get Item',
          method: 'GET',
          route: '/api/items/:id',
          description: 'Get a single item by ID',
        },
        {
          name: 'Create Item',
          method: 'POST',
          route: '/api/items',
          description: 'Create a new item',
        },
        {
          name: 'Update Item',
          method: 'PUT',
          route: '/api/items/:id',
          description: 'Update an existing item',
        },
        {
          name: 'Delete Item',
          method: 'DELETE',
          route: '/api/items/:id',
          description: 'Delete an item',
        },
      ],
    },
    {
      name: 'Authentication',
      description: 'User authentication endpoints',
      endpoints: [
        {
          name: 'Login',
          method: 'POST',
          route: '/api/auth/login',
          description: 'User login endpoint',
        },
        {
          name: 'Register',
          method: 'POST',
          route: '/api/auth/register',
          description: 'User registration endpoint',
        },
        {
          name: 'Logout',
          method: 'POST',
          route: '/api/auth/logout',
          description: 'User logout endpoint',
        },
      ],
    },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search APIs..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">API Endpoints</h3>
        <Dialog open={isAddingEndpoint} onOpenChange={setIsAddingEndpoint}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New API Endpoint</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="basic">
              <TabsList className="w-full">
                <TabsTrigger value="basic" className="flex-1">Basic</TabsTrigger>
                <TabsTrigger value="params" className="flex-1">Parameters</TabsTrigger>
                <TabsTrigger value="response" className="flex-1">Response</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={newEndpoint.name}
                      onChange={(e) => setNewEndpoint({ ...newEndpoint, name: e.target.value })}
                      placeholder="e.g., Get User Profile"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Method</Label>
                    <Select
                      value={newEndpoint.method}
                      onValueChange={(value) => setNewEndpoint({ ...newEndpoint, method: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map((method) => (
                          <SelectItem key={method} value={method}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Route</Label>
                  <Input
                    value={newEndpoint.route}
                    onChange={(e) => setNewEndpoint({ ...newEndpoint, route: e.target.value })}
                    placeholder="e.g., /api/users/:id"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newEndpoint.description}
                    onChange={(e) => setNewEndpoint({ ...newEndpoint, description: e.target.value })}
                    placeholder="Describe the endpoint..."
                  />
                </div>
              </TabsContent>

              <TabsContent value="params" className="space-y-4">
                {/* Parameter configuration would go here */}
              </TabsContent>

              <TabsContent value="response" className="space-y-4">
                {/* Response configuration would go here */}
              </TabsContent>
            </Tabs>
            <Button onClick={handleAddEndpoint} className="w-full mt-4">
              Create Endpoint
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Server className="h-4 w-4" />
              <span>Endpoints</span>
            </div>
            {/* Existing endpoints would go here */}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Webhook className="h-4 w-4" />
              <span>Templates</span>
            </div>
            <div className="grid gap-2">
              {templates.map((template) => (
                <div key={template.name} className="space-y-2">
                  <div className="font-medium text-sm">{template.name}</div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {template.description}
                  </div>
                  <div className="grid gap-1">
                    {template.endpoints.map((endpoint) => (
                      <Button
                        key={endpoint.name}
                        variant="ghost"
                        className="w-full justify-start h-auto py-2"
                        onClick={() => {
                          setNewEndpoint({
                            ...newEndpoint,
                            ...endpoint,
                          });
                          setIsAddingEndpoint(true);
                        }}
                      >
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium ${
                              {
                                GET: 'text-green-500',
                                POST: 'text-blue-500',
                                PUT: 'text-yellow-500',
                                DELETE: 'text-red-500',
                              }[endpoint.method]
                            }`}>
                              {endpoint.method}
                            </span>
                            <span className="font-medium">{endpoint.name}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {endpoint.route}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export { APIPanel };
