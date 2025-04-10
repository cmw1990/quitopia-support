import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Search, FileCode2, FolderTree } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NavigationPanelProps {
  onNodeAdd: (nodes: any) => void;
}

const NavigationPanel: React.FC<NavigationPanelProps> = ({ onNodeAdd }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingPage, setIsAddingPage] = useState(false);
  const [newPage, setNewPage] = useState({
    name: '',
    route: '',
    layout: 'default',
    auth: false,
  });

  const handleAddPage = () => {
    onNodeAdd((nodes: any) => [
      ...nodes,
      {
        id: `page-${Date.now()}`,
        type: 'page',
        position: { x: 100, y: 100 },
        data: {
          label: newPage.name,
          route: newPage.route,
          layout: newPage.layout,
          auth: newPage.auth,
          components: [],
          routes: [],
        },
      },
    ]);
    setIsAddingPage(false);
    setNewPage({ name: '', route: '', layout: 'default', auth: false });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search pages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Dialog open={isAddingPage} onOpenChange={setIsAddingPage}>
          <DialogTrigger asChild>
            <Button size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Page</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Page Name</Label>
                <Input
                  value={newPage.name}
                  onChange={(e) => setNewPage({ ...newPage, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Route</Label>
                <Input
                  value={newPage.route}
                  onChange={(e) => setNewPage({ ...newPage, route: e.target.value })}
                />
              </div>
              <div>
                <Label>Layout</Label>
                <Select
                  value={newPage.layout}
                  onValueChange={(value) => setNewPage({ ...newPage, layout: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="auth">Auth</SelectItem>
                    <SelectItem value="blank">Blank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddPage}>Add Page</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <ScrollArea className="h-[calc(100vh-200px)]">
        {/* Page list will go here */}
      </ScrollArea>
    </div>
  );
};

export { NavigationPanel };
