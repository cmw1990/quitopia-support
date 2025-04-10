import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/supabase-client';
import type { User } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner'; // Assuming sonner is set up for toasts

const MoodTrackerPage = () => {
    const [userId, setUserId] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [mood, setMood] = useState<number[]>([5]); // Default mood (1-10)
    const [energy, setEnergy] = useState<number[]>([5]); // Default energy (1-10)
    const [notes, setNotes] = useState<string>('');

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }: { data: { user: User | null } }) => {
            setUserId(user?.id);
            setIsLoading(false);
        }).catch((err: any) => {
            console.error("Error fetching user:", err);
            setIsLoading(false);
            toast.error("Could not verify user session.");
        });
    }, []);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!userId) {
            toast.error("You must be logged in to track mood.");
            return;
        }
        setIsSubmitting(true);
        console.log("Submitting mood entry:", { userId, mood: mood[0], energy: energy[0], notes });

        // --- Replace Placeholder with Actual Supabase Insert ---
        try {
            const { error } = await supabase
                .from('mood_entries') // Table name assumed
                .insert([
                    {
                        user_id: userId,         // Ensure this matches your column name
                        mood_level: mood[0],     // Ensure this matches your column name
                        energy_level: energy[0], // Ensure this matches your column name
                        notes: notes || null,      // Ensure this matches your column name, handle empty notes
                    },
                ])
                .select(); // Add .select() if you need the inserted data back, otherwise optional

            if (error) {
                 console.error("Supabase insert error:", error);
                 throw error; // Throw error to be caught below
            }

            toast.success("Mood & Energy logged successfully!");
            // Reset form after successful submission
            setMood([5]);
            setEnergy([5]);
            setNotes('');
        } catch (error: any) {
            console.error("Error saving mood entry:", error);
            toast.error(`Failed to save entry: ${error.message || 'An unknown error occurred'}`);
        } finally {
            setIsSubmitting(false); // Ensure loading state is reset
        }
        // --- End Supabase Insert ---
    };

    if (isLoading) {
        return <div className="container mx-auto py-8 px-4 text-center"><p>Loading...</p></div>;
    }

    if (!userId) {
        return (
            <div className="container mx-auto py-8 px-4">
                <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800">
                    <CardHeader>
                        <CardTitle>Please Log In</CardTitle>
                        <CardDescription>Log in or sign up to track your mood and energy levels.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>Mood & Energy Check-in</CardTitle>
                    <CardDescription>How are you feeling right now?</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="mood-slider">Mood: <span className="font-semibold">{mood[0]}</span> / 10</Label>
                            <Slider
                                id="mood-slider"
                                value={mood}
                                onValueChange={setMood}
                                max={10}
                                min={1}
                                step={1}
                                disabled={isSubmitting}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Very Low</span>
                                <span>Neutral</span>
                                <span>Very High</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="energy-slider">Energy: <span className="font-semibold">{energy[0]}</span> / 10</Label>
                            <Slider
                                id="energy-slider"
                                value={energy}
                                onValueChange={setEnergy}
                                max={10}
                                min={1}
                                step={1}
                                disabled={isSubmitting}
                            />
                             <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Very Low</span>
                                <span>Neutral</span>
                                <span>Very High</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                             <Label htmlFor="notes">Notes (Optional)</Label>
                             <Textarea 
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Any thoughts or context? (e.g., just finished a big task, feeling tired after poor sleep)"
                                rows={3}
                                disabled={isSubmitting}
                            />
                        </div>
                        
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Logging...' : 'Log Entry'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
             {/* TODO: Add a section below to display recent entries or a simple chart */}
        </div>
    );
};

export default MoodTrackerPage; 