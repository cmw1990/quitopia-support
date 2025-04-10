import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  NodeTypes,
  Panel
} from 'reactflow';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { PageNode, ComponentNode, DataNode, APINode } from './nodes';
import { NavigationPanel, DataModelPanel, APIPanel } from './panels';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save, Play, Code, Database, Server } from 'lucide-react';
import 'reactflow/dist/style.css';

const nodeTypes: NodeTypes = {
  page: PageNode,
  component: ComponentNode,
  data: DataNode,
  api: APINode,
};

const DiagramPage = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('pages');
  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Connect to WebSocket server
    wsRef.current = new WebSocket('ws://localhost:8001/ws');

    wsRef.current.onopen = () => {
      console.log('Connected to WebSocket server');
      // Load initial diagram data
      wsRef.current?.send(JSON.stringify({
        type: 'LOAD_DIAGRAM',
        payload: { id: 'default' }
      }));
    };

    wsRef.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case 'DIAGRAM_LOADED':
            if (message.payload) {
              setNodes(message.payload.nodes || []);
              setEdges(message.payload.edges || []);
            }
            break;
          case 'DIAGRAM_SAVED':
            toast({
              title: 'Success',
              description: 'Diagram saved successfully',
            });
            break;
          case 'ERROR':
            toast({
              title: 'Error',
              description: message.payload,
              variant: 'destructive',
            });
            break;
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to the server',
        variant: 'destructive',
      });
    };

    return () => {
      wsRef.current?.close();
    };
  }, []);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleSave = async () => {
    setIsGenerating(true);
    try {
      // Save diagram state
      const diagramState = {
        nodes,
        edges,
      };

      wsRef.current?.send(JSON.stringify({
        type: 'SAVE_DIAGRAM',
        payload: {
          id: 'default',
          ...diagramState
        }
      }));

      toast({
        title: 'Saving...',
        description: 'Your diagram is being saved',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save diagram',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreview = () => {
    // Implementation for live preview
    window.open('/preview', '_blank');
  };

  return (
    <div className="flex h-screen">
      {/* Left Panel */}
      <div className="w-64 border-r bg-background">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="pages" className="flex-1">Pages</TabsTrigger>
            <TabsTrigger value="data" className="flex-1">Data</TabsTrigger>
            <TabsTrigger value="api" className="flex-1">API</TabsTrigger>
          </TabsList>
          <ScrollArea className="h-[calc(100vh-40px)] p-4">
            <TabsContent value="pages">
              <NavigationPanel onNodeAdd={setNodes} />
            </TabsContent>
            <TabsContent value="data">
              <DataModelPanel onNodeAdd={setNodes} />
            </TabsContent>
            <TabsContent value="api">
              <APIPanel onNodeAdd={setNodes} />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>

      {/* Main Flow Area */}
      <div className="flex-1 h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => setSelectedNode(node)}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background />
          <Panel position="top-right" className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handlePreview}
            >
              <Play className="mr-2 h-4 w-4" />
              Preview
            </Button>
          </Panel>
        </ReactFlow>
      </div>

      {/* Right Panel - Properties */}
      {selectedNode && (
        <Card className="w-80 border-l bg-background">
          <div className="p-4">
            <h3 className="text-lg font-medium mb-4">Properties</h3>
            {/* Add property editing UI based on node type */}
          </div>
        </Card>
      )}
    </div>
  );
};

export { DiagramPage };
