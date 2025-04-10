import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { apiPost } from '@/lib/apiClient'; // Import apiPost
import { Bed } from 'lucide-react'; // Sleep icon
import { formatISO, format, parseISO } from 'date-fns';

// Define Props interface
interface SleepTrackerProps {
    userId: string | undefined; // Accept userId as a prop
    onSleepLogged?: () => void; // Optional callback function
}

export const SleepTracker: React.FC<SleepTrackerProps> = ({ userId, onSleepLogged }) => { // Use props
  // Default state using current date and estimated times
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const defaultSleepStart = format(new Date(yesterday.setHours(22, 0, 0, 0)), "yyyy-MM-dd'T'HH:mm"); // Yesterday 10 PM
  const defaultSleepEnd = format(new Date(now.setHours(6, 0, 0, 0)), "yyyy-MM-dd'T'HH:mm"); // Today 6 AM

  const [sleepStart, setSleepStart] = useState<string>(defaultSleepStart);
  const [sleepEnd, setSleepEnd] = useState<string>(defaultSleepEnd);
  const [qualityRating, setQualityRating] = useState<string>('3'); // Default to 3 (Okay)
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleLogSleep = async () => {
    if (!userId) { // Check prop userId
      toast.error('Authentication Required', { // Use sonner
        description: 'User ID not found. Cannot log sleep.',
      });
      return;
    }
    
    // Validate inputs
    let startDateTime: Date;
    let endDateTime: Date;
    try {
        startDateTime = parseISO(sleepStart);
        endDateTime = parseISO(sleepEnd);
        if (endDateTime <= startDateTime) {
            toast.error("Invalid Dates", { description: "Sleep end time must be after start time." });
            return;
        }
    } catch (e) {
        toast.error("Invalid Date Format", { description: "Please enter valid start and end times." });
        return;
    }
    const rating = parseInt(qualityRating, 10);

    setIsSubmitting(true);
    try {
        // Use apiPost to send data to Supabase REST API
        // Assuming table name 'sleep_logs' - VERIFY THIS TABLE NAME
        await apiPost('/rest/v1/sleep_logs', { 
            user_id: userId,
            start_time: startDateTime.toISOString(), 
            end_time: endDateTime.toISOString(), 
            quality_rating: rating,
            notes: notes || null // Send null if notes are empty
            // Supabase adds id, created_at
        });

        toast.success('Sleep Logged Successfully', { // Use sonner
            description: `Your sleep from ${format(startDateTime, 'MMM d, HH:mm')} to ${format(endDateTime, 'MMM d, HH:mm')} has been recorded.`,
        });
        // Reset form to defaults
        setSleepStart(defaultSleepStart);
        setSleepEnd(defaultSleepEnd);
        setQualityRating('3');
        setNotes('');
        // Call the callback if provided
        if (onSleepLogged) {
            onSleepLogged();
        }
    } catch (error: any) {
      console.error('SleepTracker: Error logging sleep via API:', error);
      toast.error('Error Logging Sleep', { // Use sonner
        description: error.message || 'Could not save your sleep log. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bed className="h-5 w-5" />
          <span>Log Your Sleep</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="sleep-start">Sleep Start</Label>
              <Input
                id="sleep-start"
                type="datetime-local"
                value={sleepStart}
                onChange={(e) => setSleepStart(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="sleep-end">Sleep End</Label>
              <Input
                id="sleep-end"
                type="datetime-local"
                value={sleepEnd}
                onChange={(e) => setSleepEnd(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="quality-rating">Sleep Quality</Label>
          <Select value={qualityRating} onValueChange={setQualityRating} disabled={isSubmitting}>
            <SelectTrigger id="quality-rating">
              <SelectValue placeholder="Rate your sleep quality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">Excellent (5)</SelectItem>
              <SelectItem value="4">Good (4)</SelectItem>
              <SelectItem value="3">Okay (3)</SelectItem>
              <SelectItem value="2">Poor (2)</SelectItem>
              <SelectItem value="1">Very Poor (1)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="sleep-notes">Notes (Optional)</Label>
          <Textarea
            id="sleep-notes"
            placeholder="Any factors affecting your sleep? (e.g., dreams, interruptions)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            disabled={isSubmitting}
          />
        </div>

        <Button onClick={handleLogSleep} disabled={isSubmitting || !userId} className="w-full">
          {isSubmitting ? 'Logging Sleep...' : 'Log Sleep Period'}
        </Button>
      </CardContent>
    </Card>
  );
};
