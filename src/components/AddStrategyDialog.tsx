import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { Strategy } from '@/types/strategies';

interface AddStrategyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newStrategy: Pick<Strategy, 'title' | 'description' | 'category'>) => Promise<boolean>;
}

export const AddStrategyDialog: React.FC<AddStrategyDialogProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Custom');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setDescription('');
      setCategory('Custom');
      setIsSaving(false);
      setError(null);
    }
  }, [isOpen]);

  const handleSaveClick = async () => {
    if (!title.trim() || !description.trim()) {
        setError('Title and Description are required.');
        return;
    }
    setError(null);
    setIsSaving(true);
    const success = await onSave({ 
        title: title.trim(), 
        description: description.trim(), 
        category: category.trim() || 'Custom' 
    });
    setIsSaving(false);
    if (success) {
        onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Custom Strategy</DialogTitle>
          <DialogDescription>
            Create and save your own personalized focus technique.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" disabled={isSaving} placeholder="e.g., Mindful Breathing for 5 mins"/>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3 min-h-[80px]" disabled={isSaving} placeholder="Describe the steps or purpose of the strategy..."/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">Category</Label>
            <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="col-span-3" disabled={isSaving} placeholder="e.g., Mindfulness, Planning"/>
          </div>
          {error && <p className="col-span-4 text-center text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button type="button" onClick={handleSaveClick} disabled={isSaving || !title.trim() || !description.trim()}>
             {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
             Save Strategy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 