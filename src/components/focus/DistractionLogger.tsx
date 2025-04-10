import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';
import { DistractionLogServiceInstance } from '@/services/DistractionLogService';
import { Siren } from 'lucide-react'; // Icon for distraction

interface DistractionLoggerProps {
  focusSessionId?: string | null; // Optional: Link distraction to current session
  triggerLabel?: string; // Customize the button label
}

const defaultDistractionTypes = [
  'Social Media',
  'Email/Messages',
  'Noise',
  'Interruption (Person)',
  'Task-related Thought',
  'Unrelated Thought',
  'Physical Discomfort',
  'Hunger/Thirst',
  'Website/App',
  'Other'
];

export const DistractionLogger: React.FC<DistractionLoggerProps> = ({ 
    focusSessionId,
    triggerLabel = "Log Distraction"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [distractionType, setDistractionType] = useState<string>('');
  const [customType, setCustomType] = useState<string>(''); // For 'Other' type
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleLogDistraction = async () => {
    if (!user?.id) {
      toast({ title: 'Authentication Required', variant: 'destructive' });
      return;
    }

    const finalDistractionType = distractionType === 'Other' ? customType : distractionType;

    if (!finalDistractionType) {
        toast({ title: 'Distraction Type Required', description: 'Please select or enter a distraction type.', variant: 'destructive' });
        return;
    }

    setIsSubmitting(true);
    try {
      await DistractionLogServiceInstance.logDistraction(
        user.id,
        finalDistractionType,
        description,
        focusSessionId
      );
      toast({
        title: 'Distraction Logged',
        description: `'${finalDistractionType}' distraction recorded. Stay focused!`,
      });
      // Reset form and close dialog
      setDistractionType('');
      setCustomType('');
      setDescription('');
      setIsOpen(false);
    } catch (error: any) {
      console.error('DistractionLogger: Error logging distraction:', error);
      toast({
        title: 'Error Logging Distraction',
        description: error.message || 'Could not save the distraction log.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset custom type when main type changes
  const handleTypeChange = (value: string) => {
      setDistractionType(value);
      if (value !== 'Other') {
          setCustomType('');
      }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
           <Siren className="h-4 w-4 mr-2" />
           {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log a Distraction</DialogTitle>
          <DialogDescription>
            Quickly record what pulled your focus away.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="distraction-type" className="text-right">
              Type
            </Label>
            <Select value={distractionType} onValueChange={handleTypeChange}>
                 <SelectTrigger id="distraction-type" className="col-span-3">
                     <SelectValue placeholder="Select distraction type..." />
                 </SelectTrigger>
                 <SelectContent>
                    {defaultDistractionTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                 </SelectContent>
            </Select>
          </div>
          
          {distractionType === 'Other' && (
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="custom-type" className="text-right">
                 Specify
                </Label>
                <Input
                    id="custom-type"
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    className="col-span-3"
                    placeholder="Enter custom type..."
                 />
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Details
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="(Optional) Briefly describe the distraction..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleLogDistraction} disabled={isSubmitting || !distractionType || (distractionType === 'Other' && !customType)}>
            {isSubmitting ? 'Logging...' : 'Log Distraction'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 