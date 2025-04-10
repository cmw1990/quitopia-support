import React, { useState, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowRightLeft, 
  Brain, 
  Edit, 
  FileBox, 
  Plus, 
  Trash2, 
  Sparkles,
  Clock,
  Filter,
  Search
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';

import * as contextSwitchingService from '@/services/contextSwitchingService';
import { SavedContext } from './types';
import NewContextForm from './forms/NewContextForm';
import EditContextForm from './forms/EditContextForm';

interface SavedContextsPanelProps {
  contexts: SavedContext[];
  currentContext: SavedContext | null;
  onSwitchContext: (from: SavedContext | null, to: SavedContext) => Promise<void>;
  onRefreshData: () => Promise<void>;
}

const SavedContextsPanel: React.FC<SavedContextsPanelProps> = ({
  contexts,
  currentContext,
  onSwitchContext,
  onRefreshData
}) => {
  const { toast } = useToast();
  const [selectedContext, setSelectedContext] = useState<SavedContext | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showNewContextDialog, setShowNewContextDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Extract unique categories from contexts
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    contexts.forEach(context => {
      if (context.tags && context.tags.length > 0) {
        context.tags.forEach(tag => uniqueCategories.add(tag));
      }
    });
    return Array.from(uniqueCategories).sort();
  }, [contexts]);

  // Filter contexts based on search query and category
  const filteredContexts = useMemo(() => {
    return contexts.filter(context => {
      // Filter by search query
      const matchesSearch = 
        searchQuery === '' || 
        context.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (context.description && context.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (context.task && context.task.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Filter by category
      const matchesCategory = 
        categoryFilter === 'all' || 
        (context.tags && context.tags.includes(categoryFilter));
      
      return matchesSearch && matchesCategory;
    });
  }, [contexts, searchQuery, categoryFilter]);

  const handleDeleteContext = async () => {
    if (!selectedContext?.id) return;
    
    try {
      await contextSwitchingService.deleteSavedContext(selectedContext.id);
      setShowDeleteDialog(false);
      setSelectedContext(null);
      
      await onRefreshData();
      
      toast({
        title: 'Context Deleted',
        description: `The context "${selectedContext.name}" has been deleted.`,
      });
    } catch (error) {
      console.error('Error deleting context:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete context. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCreateNewContext = async (context: SavedContext) => {
    try {
      await contextSwitchingService.createSavedContext(context);
      setShowNewContextDialog(false);
      await onRefreshData();
      
      toast({
        title: 'Success',
        description: `Created new context: ${context.name}`,
      });
    } catch (error) {
      console.error('Error creating context:', error);
      toast({
        title: 'Error',
        description: 'Failed to create context. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateContext = async (context: SavedContext) => {
    if (!context.id) return;
    
    try {
      await contextSwitchingService.updateSavedContext(context.id, context);
      setShowEditDialog(false);
      setSelectedContext(null);
      
      await onRefreshData();
      
      toast({
        title: 'Context Updated',
        description: `The context "${context.name}" has been updated.`,
      });
    } catch (error) {
      console.error('Error updating context:', error);
      toast({
        title: 'Error',
        description: 'Failed to update context. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getCognitiveLoadColor = (load: string) => {
    switch (load) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Saved Contexts</h2>
        <Button onClick={() => setShowNewContextDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Context
        </Button>
      </div>
      
      {/* Search and filter controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contexts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex items-center space-x-2 min-w-[180px]">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select 
            value={categoryFilter}
            onValueChange={(value) => setCategoryFilter(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectGroup>
                <SelectLabel>Categories</SelectLabel>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {filteredContexts.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {searchQuery || categoryFilter !== 'all' 
                ? 'No matching contexts' 
                : 'No Saved Contexts'}
            </CardTitle>
            <CardDescription>
              {searchQuery || categoryFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : "You don't have any saved contexts yet."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <FileBox className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-center text-sm text-gray-500 mb-4">
              {searchQuery || categoryFilter !== 'all' 
                ? 'No contexts match your current search and filter settings.' 
                : 'Saved contexts help you quickly return to previous tasks without losing your place. Create a context for each task or project you\'re working on.'}
            </p>
            {!searchQuery && categoryFilter === 'all' && (
              <Button onClick={() => setShowNewContextDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Context
              </Button>
            )}
            {(searchQuery || categoryFilter !== 'all') && (
              <Button variant="outline" onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
              }}>
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredContexts.map(context => (
            <Card 
              key={context.id} 
              className={
                currentContext?.id === context.id 
                ? 'border-2 border-primary' 
                : ''
              }
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{context.name}</CardTitle>
                    <CardDescription>{context.task}</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Brain className="h-3 w-3" />
                      <span>
                        Complexity: {context.complexity}/10
                      </span>
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`flex items-center space-x-1 ${getCognitiveLoadColor(context.cognitive_load)} text-white`}
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>
                        {context.cognitive_load.charAt(0).toUpperCase() + context.cognitive_load.slice(1)}
                      </span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pb-2">
                {context.notes && (
                  <div>
                    <h3 className="text-sm font-medium mb-1">Notes:</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{context.notes}</p>
                  </div>
                )}
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{context.progress}%</span>
                  </div>
                  <Progress value={context.progress} className="h-2" />
                </div>
                
                {/* Display tags/categories if they exist */}
                {context.tags && context.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {context.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Last used: {formatDate(context.last_used)}
                  </span>
                  {context.created_at && (
                    <span>Created: {formatDate(context.created_at)}</span>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between pt-2">
                <div className="flex space-x-2">
                  <Button
                    variant={currentContext?.id === context.id ? "secondary" : "default"}
                    size="sm"
                    onClick={() => onSwitchContext(currentContext, context)}
                    disabled={currentContext?.id === context.id}
                  >
                    <ArrowRightLeft className="h-4 w-4 mr-2" />
                    {currentContext?.id === context.id ? 'Current' : 'Switch To'}
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedContext(context);
                      setShowEditDialog(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setSelectedContext(context);
                      setShowDeleteDialog(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Context</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the context "{selectedContext?.name}"? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteContext}>
              Delete Context
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* New Context Dialog */}
      <Dialog open={showNewContextDialog} onOpenChange={setShowNewContextDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Context</DialogTitle>
            <DialogDescription>
              Define your new context with a name, task, and related information.
            </DialogDescription>
          </DialogHeader>
          <NewContextForm 
            onSubmit={handleCreateNewContext} 
            onCancel={() => setShowNewContextDialog(false)} 
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Context Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Context</DialogTitle>
            <DialogDescription>
              Update the details for this context.
            </DialogDescription>
          </DialogHeader>
          
          {selectedContext && (
            <EditContextForm 
              context={selectedContext}
              onSubmit={handleUpdateContext}
              onCancel={() => setShowEditDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SavedContextsPanel; 