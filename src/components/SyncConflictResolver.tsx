import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { RefreshCw, AlertCircle } from 'lucide-react';

// Define conflict types
export interface SyncConflict {
  id: string;
  localData: any;
  remoteData: any;
  entityType: string; // e.g., 'journal', 'task', etc.
  timestamp: {
    local: string;
    remote: string;
  };
  resolved?: boolean;
  resolution?: 'local' | 'remote' | 'merge';
}

interface SyncConflictResolverProps {
  conflicts: SyncConflict[];
  onResolveConflict: (conflict: SyncConflict, resolution: 'local' | 'remote' | 'merge') => Promise<void>;
  onAllResolved: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SyncConflictResolver: React.FC<SyncConflictResolverProps> = ({
  conflicts,
  onResolveConflict,
  onAllResolved,
  isOpen,
  onOpenChange
}) => {
  const [currentConflictIndex, setCurrentConflictIndex] = useState(0);
  const [resolution, setResolution] = useState<'local' | 'remote' | 'merge'>('local');
  const [isResolving, setIsResolving] = useState(false);
  const [remainingConflicts, setRemainingConflicts] = useState<SyncConflict[]>([]);

  useEffect(() => {
    // Filter out resolved conflicts
    const unresolved = conflicts.filter(c => !c.resolved);
    setRemainingConflicts(unresolved);
    
    // If all conflicts are resolved, notify parent
    if (unresolved.length === 0 && conflicts.length > 0) {
      onAllResolved();
    }
  }, [conflicts, onAllResolved]);

  const currentConflict = remainingConflicts[currentConflictIndex];

  const handleResolve = async () => {
    if (!currentConflict) return;
    
    setIsResolving(true);
    try {
      await onResolveConflict(currentConflict, resolution);
      
      // Move to next conflict or close if done
      if (currentConflictIndex < remainingConflicts.length - 1) {
        setCurrentConflictIndex(prevIndex => prevIndex + 1);
      } else {
        // No more conflicts
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error resolving conflict:', error);
    } finally {
      setIsResolving(false);
    }
  };

  const handleSkip = () => {
    // Move to next conflict
    if (currentConflictIndex < remainingConflicts.length - 1) {
      setCurrentConflictIndex(prevIndex => prevIndex + 1);
    } else {
      // No more conflicts
      onOpenChange(false);
    }
  };

  const renderEntityType = (type: string) => {
    switch (type) {
      case 'journal':
        return 'Journal Entry';
      case 'task':
        return 'Task';
      case 'progress':
        return 'Progress Record';
      case 'consumption':
        return 'Consumption Log';
      case 'craving':
        return 'Craving Record';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const renderDataPreview = (data: any) => {
    if (!data) return <div className="text-muted-foreground">No data available</div>;
    
    // Different rendering based on entity type
    if (currentConflict?.entityType === 'task') {
      return (
        <div className="space-y-2">
          <p className="font-medium">{data.title || 'Untitled Task'}</p>
          {data.description && <p className="text-sm">{data.description}</p>}
          <div className="flex flex-wrap gap-2 text-xs">
            {data.completed && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                Completed
              </span>
            )}
            {data.priority && (
              <span className={`px-2 py-1 rounded ${
                data.priority === 'high' ? 'bg-red-100 text-red-800' :
                data.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {data.priority.charAt(0).toUpperCase() + data.priority.slice(1)} Priority
              </span>
            )}
          </div>
        </div>
      );
    } else if (currentConflict?.entityType === 'journal') {
      return (
        <div className="space-y-2">
          <p className="font-medium line-clamp-2">{data.content || 'Empty Entry'}</p>
          {data.tags && data.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {data.tags.map((tag: string, i: number) => (
                <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      );
    } else {
      // Generic rendering
      return (
        <div className="max-h-32 overflow-auto">
          <pre className="text-xs">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      );
    }
  };

  if (!currentConflict) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
            Sync Conflict
          </DialogTitle>
          <DialogDescription>
            {remainingConflicts.length > 0 && (
              <span>
                Resolving conflict {currentConflictIndex + 1} of {remainingConflicts.length}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-1">
              {renderEntityType(currentConflict.entityType)} has changes in both local and remote versions
            </h3>
            <p className="text-xs text-muted-foreground">
              Please select which version you want to keep
            </p>
          </div>

          <ScrollArea className="h-60">
            <RadioGroup value={resolution} onValueChange={(value) => setResolution(value as any)}>
              <div className="space-y-4">
                <div className="border rounded-md p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="local" id="local" />
                    <div className="flex-1">
                      <Label htmlFor="local" className="font-medium text-sm">
                        Local Version
                        <span className="block text-xs text-muted-foreground">
                          Last modified {formatDistanceToNow(new Date(currentConflict.timestamp.local))} ago
                        </span>
                      </Label>
                      <div className="mt-2 bg-muted/30 p-2 rounded-sm">
                        {renderDataPreview(currentConflict.localData)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="remote" id="remote" />
                    <div className="flex-1">
                      <Label htmlFor="remote" className="font-medium text-sm">
                        Remote Version
                        <span className="block text-xs text-muted-foreground">
                          Last modified {formatDistanceToNow(new Date(currentConflict.timestamp.remote))} ago
                        </span>
                      </Label>
                      <div className="mt-2 bg-muted/30 p-2 rounded-sm">
                        {renderDataPreview(currentConflict.remoteData)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="merge" id="merge" />
                    <div className="flex-1">
                      <Label htmlFor="merge" className="font-medium text-sm">
                        Merge Both
                        <span className="block text-xs text-muted-foreground">
                          Combine values from both versions
                        </span>
                      </Label>
                      <div className="mt-2 text-xs text-muted-foreground">
                        This option will try to smartly merge fields from both versions
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </ScrollArea>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleSkip} disabled={isResolving}>
            Skip
          </Button>
          <Button onClick={handleResolve} disabled={isResolving} className="gap-2">
            {isResolving && <RefreshCw className="h-4 w-4 animate-spin" />}
            {isResolving ? 'Resolving...' : 'Resolve Conflict'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SyncConflictResolver; 