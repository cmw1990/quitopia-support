import React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "./button";
import { Calendar } from "./calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";
import { Slider } from "./slider";
import { Textarea } from "./textarea";
import { toast } from "./use-toast";

type QuickLogData = {
  date: Date;
  count: number;
  craving: number;
  mood: number;
  notes: string;
};

interface QuickLogFormProps {
  initialData?: Partial<QuickLogData>;
  onSubmit: (data: QuickLogData) => void;
  onCancel?: () => void;
  isOpen?: boolean;
  className?: string;
}

export function QuickLogForm({
  initialData,
  onSubmit,
  onCancel,
  isOpen = false,
  className
}: QuickLogFormProps) {
  // Initialize state with default values or values from props
  const [date, setDate] = React.useState<Date>(
    initialData?.date || new Date()
  );
  const [count, setCount] = React.useState<number>(
    initialData?.count !== undefined ? initialData.count : 0
  );
  const [craving, setCraving] = React.useState<number>(
    initialData?.craving !== undefined ? initialData.craving : 3
  );
  const [mood, setMood] = React.useState<number>(
    initialData?.mood !== undefined ? initialData.mood : 3
  );
  const [notes, setNotes] = React.useState<string>(
    initialData?.notes || ""
  );
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(isOpen);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  
  // Reset form when closed
  const resetForm = () => {
    setDate(initialData?.date || new Date());
    setCount(initialData?.count !== undefined ? initialData.count : 0);
    setCraving(initialData?.craving !== undefined ? initialData.craving : 3);
    setMood(initialData?.mood !== undefined ? initialData.mood : 3);
    setNotes(initialData?.notes || "");
    setErrors({});
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (count < 0) {
      newErrors.count = "Count cannot be negative";
    }
    
    if (count > 100) {
      newErrors.count = "Count seems unusually high";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      onSubmit({
        date,
        count,
        craving,
        mood,
        notes
      });
      
      toast({
        title: "Log Entry Saved",
        description: `Successfully recorded ${count} cigarettes for ${format(date, "PPP")}`,
      });
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error Saving Log",
        description: "There was a problem saving your entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle dialog close
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    if (onCancel) {
      onCancel();
    }
  };
  
  // Update dialog state when isOpen prop changes
  React.useEffect(() => {
    setIsDialogOpen(isOpen);
  }, [isOpen]);
  
  // Render mood labels based on value
  const getMoodLabel = (value: number): string => {
    const labels = [
      "Very Negative",
      "Negative",
      "Neutral",
      "Positive",
      "Very Positive"
    ];
    return labels[value - 1] || "Neutral";
  };
  
  // Render craving labels based on value
  const getCravingLabel = (value: number): string => {
    const labels = [
      "Very Low",
      "Low",
      "Moderate",
      "Strong",
      "Very Strong"
    ];
    return labels[value - 1] || "Moderate";
  };
  
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className={cn("sm:max-w-[425px]", className)}>
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">Log Your Smoking</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Date Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                  disabled={(date) => date > new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Cigarette Count */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Cigarettes Smoked
              </label>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded-full"
                  onClick={() => setCount(Math.max(0, count - 1))}
                  aria-label="Decrease count"
                >
                  <span className="text-lg">-</span>
                </Button>
                <span className="w-8 text-center font-medium">{count}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded-full"
                  onClick={() => setCount(count + 1)}
                  aria-label="Increase count"
                >
                  <span className="text-lg">+</span>
                </Button>
              </div>
            </div>
            {errors.count && (
              <p className="text-xs text-red-500">{errors.count}</p>
            )}
          </div>
          
          {/* Craving Level */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Craving Level
              </label>
              <span className="text-xs text-muted-foreground">
                {getCravingLabel(craving)}
              </span>
            </div>
            <Slider
              value={[craving]}
              min={1}
              max={5}
              step={1}
              onValueChange={(value) => setCraving(value[0])}
              aria-label="Craving level"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Very Low</span>
              <span>Very Strong</span>
            </div>
          </div>
          
          {/* Mood Level */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Mood
              </label>
              <span className="text-xs text-muted-foreground">
                {getMoodLabel(mood)}
              </span>
            </div>
            <Slider
              value={[mood]}
              min={1}
              max={5}
              step={1}
              onValueChange={(value) => setMood(value[0])}
              aria-label="Mood level"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Very Negative</span>
              <span>Very Positive</span>
            </div>
          </div>
          
          {/* Notes */}
          <div className="space-y-2">
            <label 
              htmlFor="notes" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Notes (Optional)
            </label>
            <Textarea
              id="notes"
              placeholder="Add any notes about triggers, context, etc."
              className="resize-none"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleDialogClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? "Saving..." : "Save Entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 