import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { apiPost } from '@/lib/apiClient';
import { Zap } from 'lucide-react';

// Define Props interface
interface EnergyTrackerProps {
    userId: string | undefined; // Accept userId as a prop
    onEnergyLogged?: () => void; // Optional callback function
}

export const EnergyTracker: React.FC<EnergyTrackerProps> = ({ userId, onEnergyLogged }) => {
  const [energyLevel, setEnergyLevel] = useState<number>(5); // Default to middle value
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleLogEnergy = async () => {
    if (!userId) {
      toast.error('Authentication Required', {
        description: 'User ID not found. Cannot log energy.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiPost('/rest/v1/focus_moods', { 
        user_id: userId,
        metric_type: 'energy',
        value: energyLevel,
        notes: notes || null,
      });

      toast.success('Energy Logged Successfully', {
        description: `Your energy level (${energyLevel}/10) has been recorded.`,
      });
      // Reset form after successful submission
      setEnergyLevel(5);
      setNotes('');
      // Call the callback if provided
      if (onEnergyLogged) {
        onEnergyLogged();
      }
    } catch (error: any) {
      console.error('EnergyTracker: Error logging energy via API:', error);
      toast.error('Error Logging Energy', {
        description: error.message || 'Could not save your energy level. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to get color based on energy level
  const getEnergyColor = (level: number): string => {
    if (level <= 3) return 'text-red-500';
    if (level <= 7) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          <span>Log Your Energy</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="energy-slider" className="flex justify-between">
            <span>Energy Level:</span>
            <span className={`font-bold ${getEnergyColor(energyLevel)}`}>{energyLevel}/10</span>
          </Label>
          <Slider
            id="energy-slider"
            min={1}
            max={10}
            step={1}
            value={[energyLevel]}
            onValueChange={(value) => setEnergyLevel(value[0])}
            className="w-full"
            aria-label="Energy level slider"
            disabled={isSubmitting}
          />
           <div className="flex justify-between text-xs text-muted-foreground">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
            </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="energy-notes">Notes (Optional)</Label>
          <Textarea
            id="energy-notes"
            placeholder="Any factors affecting your energy? (e.g., sleep, food, activity)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            disabled={isSubmitting}
          />
        </div>

        <Button onClick={handleLogEnergy} disabled={isSubmitting || !userId} className="w-full">
          {isSubmitting ? 'Logging...' : 'Log Energy Level'}
        </Button>
      </CardContent>
    </Card>
  );
}; 