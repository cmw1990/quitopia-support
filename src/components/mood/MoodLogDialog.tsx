import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabaseRequest } from '@/utils/supabaseRequest';
import { useAuth } from '@/components/AuthProvider';
import { Loader2, Save, Smile, Zap } from 'lucide-react';
import { MoodLog } from '@/types/mood';

interface MoodLogDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLogSaved?: () => void;
  initialMood?: number;
  initialEnergy?: number;
}

export const MoodLogDialog: React.FC<MoodLogDialogProps> = ({ 
    isOpen, 
    onClose, 
    onLogSaved, 
    initialMood = 3,
    initialEnergy = 5
}) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [moodRating, setMoodRating] = useState(initialMood);
    const [energyRating, setEnergyRating] = useState(initialEnergy);
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setMoodRating(initialMood);
            setEnergyRating(initialEnergy);
            setNotes('');
        }
    }, [isOpen, initialMood, initialEnergy]);

    const handleSave = async () => {
        if (!user?.id) return;
        setIsSaving(true);
        try {
            const logData: Partial<MoodLog> = {
                user_id: user.id,
                mood_rating: moodRating,
                energy_rating: energyRating,
                notes: notes.trim() || null,
                timestamp: new Date().toISOString(),
            };

            await supabaseRequest<MoodLog>('mood_logs', 'POST', { data: logData });

            toast({ title: 'Mood Log Saved', description: `Mood: ${moodRating}/5, Energy: ${energyRating}/10` });
            onLogSaved?.();
            handleClose();
        } catch (error: any) {
            console.error("Error saving mood log:", error);
            toast({ title: 'Error Saving Log', description: error.message, variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleClose = () => {
        onClose();
    };

    const getMoodEmoji = (rating: number): string => {
        const emojis = ['😞', '😕', '😐', '😊', '😄'];
        return emojis[Math.max(0, Math.min(rating - 1, 4))];
    };
    
    const getEnergyEmoji = (rating: number): string => {
        const emojis = ['😴', '😫', '😟', '😐', '🙂', '😊', '😃', '🤩', '🚀', '⚡'];
        return emojis[Math.max(0, Math.min(rating - 1, 9))];
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Log Mood & Energy</DialogTitle>
                    <DialogDescription>How are you feeling right now?</DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="mood" className="flex items-center justify-between">
                            <span><Smile className="inline h-4 w-4 mr-1.5"/>Mood (1-5)</span> 
                            <span className="text-2xl">{getMoodEmoji(moodRating)}</span>
                        </Label>
                        <Slider 
                            id="mood"
                            min={1} 
                            max={5} 
                            step={1} 
                            value={[moodRating]} 
                            onValueChange={(value) => setMoodRating(value[0])} 
                        />
                         <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Low</span><span>Neutral</span><span>High</span>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="energy" className="flex items-center justify-between">
                             <span><Zap className="inline h-4 w-4 mr-1.5"/>Energy (1-10)</span>
                             <span className="text-2xl">{getEnergyEmoji(energyRating)}</span>
                        </Label>
                        <Slider 
                            id="energy"
                            min={1} 
                            max={10} 
                            step={1} 
                            value={[energyRating]} 
                            onValueChange={(value) => setEnergyRating(value[0])}
                        />
                         <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Drained</span><span>Medium</span><span>Energized</span>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                         <Label htmlFor="notes">Notes (Optional)</Label>
                         <Textarea 
                             id="notes"
                             value={notes}
                             onChange={(e) => setNotes(e.target.value)}
                             placeholder="Add any context or details..."
                             rows={3}
                         />
                     </div>
                </div>
                <DialogFooter className="pt-4 border-t">
                    <Button type="button" variant="outline" onClick={handleClose} disabled={isSaving}>Cancel</Button>
                    <Button type="button" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Log
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}; 