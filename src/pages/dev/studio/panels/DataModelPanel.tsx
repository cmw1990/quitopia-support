import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Search, Database, Table } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DataModelPanelProps {
  onNodeAdd: (nodes: any) => void;
}

const DataModelPanel: React.FC<DataModelPanelProps> = ({ onNodeAdd }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingModel, setIsAddingModel] = useState(false);
  const [newModel, setNewModel] = useState({
    name: '',
    tableName: '',
    fields: [{ name: '', type: 'string', required: false }],
  });

  const handleAddField = () => {
    setNewModel({
      ...newModel,
      fields: [...newModel.fields, { name: '', type: 'string', required: false }],
    });
  };

  const handleAddModel = () => {
    onNodeAdd((nodes: any) => [
      ...nodes,
      {
        id: `data-${Date.now()}`,
        type: 'data',
        position: { x: 100, y: 100 },
        data: {
          label: newModel.name,
          tableName: newModel.tableName,
          fields: newModel.fields,
        },
      },
    ]);
    setIsAddingModel(false);
    setNewModel({
      name: '',
      tableName: '',
      fields: [{ name: '', type: 'string', required: false }],
    });
  };

  const dataTypes = [
    'string',
    'number',
    'boolean',
    'date',
    'json',
    'array',
    'enum',
    'reference',
  ];

  const templates = [
    {
      name: 'User Profile',
      description: 'Basic user information schema',
      fields: [
        { name: 'firstName', type: 'string', required: true },
        { name: 'lastName', type: 'string', required: true },
        { name: 'email', type: 'string', required: true },
        { name: 'avatar', type: 'string', required: false },
        { name: 'dateOfBirth', type: 'date', required: false },
      ],
    },
    {
      name: 'Product',
      description: 'E-commerce product schema',
      fields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'string', required: true },
        { name: 'price', type: 'number', required: true },
        { name: 'images', type: 'array', required: false },
        { name: 'category', type: 'reference', required: true },
      ],
    },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search models..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Data Models</h3>
        <Dialog open={isAddingModel} onOpenChange={setIsAddingModel}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Data Model</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Model Name</Label>
                  <Input
                    value={newModel.name}
                    onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                    placeholder="e.g., User"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Table Name</Label>
                  <Input
                    value={newModel.tableName}
                    onChange={(e) => setNewModel({ ...newModel, tableName: e.target.value })}
                    placeholder="e.g., users"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Fields</Label>
                  <Button variant="ghost" size="sm" onClick={handleAddField}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {newModel.fields.map((field, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2">
                      <Input
                        value={field.name}
                        onChange={(e) =>
                          setNewModel({
                            ...newModel,
                            fields: newModel.fields.map((f, i) =>
                              i === index ? { ...f, name: e.target.value } : f
                            ),
                          })
                        }
                        placeholder="Field name"
                      />
                      <Select
                        value={field.type}
                        onValueChange={(value) =>
                          setNewModel({
                            ...newModel,
                            fields: newModel.fields.map((f, i) =>
                              i === index ? { ...f, type: value } : f
                            ),
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {dataTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setNewModel({
                            ...newModel,
                            fields: newModel.fields.filter((_, i) => i !== index),
                          })
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={handleAddModel} className="w-full">
                Create Model
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Database className="h-4 w-4" />
              <span>Models</span>
            </div>
            {/* Existing models would go here */}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Table className="h-4 w-4" />
              <span>Templates</span>
            </div>
            <div className="grid gap-2">
              {templates.map((template) => (
                <Button
                  key={template.name}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setNewModel({
                      name: template.name,
                      tableName: template.name.toLowerCase(),
                      fields: template.fields,
                    });
                    setIsAddingModel(true);
                  }}
                >
                  <div className="text-left">
                    <div className="font-medium">{template.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {template.description}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export { DataModelPanel };
