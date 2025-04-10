import React, { useState, useRef, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { routes, RouteConfig } from '@/routes/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Drawer } from 'vaul';
import { Edit2, Plus, Save, Trash2, Link2 } from 'lucide-react';

interface RouteNode extends Node {
  data: {
    route: RouteConfig;
    label: ReactNode;
  };
}

const RouteDiagram = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<RouteNode | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedRoute, setEditedRoute] = useState<RouteConfig | null>(null);

  useEffect(() => {
    const initialNodes: RouteNode[] = [];
    const initialEdges: Edge[] = [];
    let yOffset = 0;

    const processRoute = (route: RouteConfig, parentId?: string, level = 0) => {
      const nodeId = route.path;
      const xOffset = level * 300;

      initialNodes.push({
        id: nodeId,
        position: { x: xOffset, y: yOffset },
        type: 'default',
        data: {
          route,
          label: (
            <Card className="w-64 bg-white dark:bg-gray-800">
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-medium">
                  {route.title}
                  {route.permission && (
                    <Badge className="ml-2" variant={
                      route.permission === 'public' ? 'secondary' :
                      route.permission === 'authenticated' ? 'default' :
                      route.permission === 'premium' ? 'success' : 'destructive'
                    }>
                      {route.permission}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-xs text-gray-500">{route.path}</p>
                {route.meta && Object.keys(route.meta).length > 0 && (
                  <div className="mt-2">
                    {Object.entries(route.meta).map(([key, value]) => (
                      <Badge key={key} variant="outline" className="mr-1 mb-1">
                        {key}: {String(value)}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        }
      });

      if (parentId) {
        initialEdges.push({
          id: `${parentId}-${nodeId}`,
          source: parentId,
          target: nodeId,
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed }
        });
      }

      yOffset += 200;

      if (route.children) {
        route.children.forEach(child => {
          processRoute(child, nodeId, level + 1);
        });
      }
    };

    routes.forEach(route => processRoute(route));
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, []);

  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    setSelectedNode(node as RouteNode);
    setEditedRoute(node.data.route);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editedRoute || !selectedNode) return;

    const updatedNodes = nodes.map(node => {
      if (node.id === selectedNode.id) {
        return {
          ...node,
          data: {
            ...node.data,
            route: editedRoute
          }
        };
      }
      return node;
    });

    setNodes(updatedNodes);
    setIsEditing(false);
    // Here you would typically also update your actual routes configuration
  };

  return (
    <div className="h-screen w-full bg-gray-50 dark:bg-gray-900">
      <div className="absolute top-4 left-4 z-10">
        <h1 className="text-2xl font-bold mb-2">Route Diagram</h1>
        <p className="text-sm text-gray-500">
          Click on nodes to edit route configuration
        </p>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>

      <Drawer.Root open={isEditing} onOpenChange={setIsEditing}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 mt-24 flex h-[90%] flex-col rounded-t-lg bg-white dark:bg-gray-800">
            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="text-lg font-semibold mb-4">Edit Route</h3>
              {editedRoute && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={editedRoute.title}
                      onChange={e => setEditedRoute({
                        ...editedRoute,
                        title: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="path">Path</Label>
                    <Input
                      id="path"
                      value={editedRoute.path}
                      onChange={e => setEditedRoute({
                        ...editedRoute,
                        path: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="permission">Permission</Label>
                    <select
                      id="permission"
                      className="w-full rounded-md border border-gray-300 p-2"
                      value={editedRoute.permission}
                      onChange={e => setEditedRoute({
                        ...editedRoute,
                        permission: e.target.value as RouteConfig['permission']
                      })}
                    >
                      <option value="public">Public</option>
                      <option value="authenticated">Authenticated</option>
                      <option value="premium">Premium</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave}>
                      <Save className="size-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
};

export default RouteDiagram;
