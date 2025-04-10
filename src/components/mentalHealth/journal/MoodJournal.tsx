import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SUPABASE_URL, SUPABASE_KEY } from "@/integrations/supabase/db-client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Plus, Brain, Heart, Moon, Battery, Sparkles } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

interface MoodJournalEntry {
  id: string;
  user_id: string;
  mood_rating: number;
  journal_entry: string;
  gratitude_points: string[];
  activities: string[];
  sleep_quality: number;
  energy_level: number;
  anxiety_level: number;
  positive_thoughts: string[];
  challenges: string[];
  solutions: string[];
  created_at: string;
  updated_at: string;
}

export const MoodJournal = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const [newEntry, setNewEntry] = useState({
    mood_rating: 5,
    journal_entry: "",
    gratitude_points: ["", "", ""],
    activities: [],
    sleep_quality: 5,
    energy_level: 5,
    anxiety_level: 5,
    positive_thoughts: [],
    challenges: [],
    solutions: []
  });

  const { data: entries } = useQuery<MoodJournalEntry[]>({
    queryKey: ['mood-journal'],
    queryFn: async () => {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/mood_journals?order=created_at.desc`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session?.access_token}`
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || response.statusText);
      }

      return await response.json();
    },
    enabled: !!session?.access_token
  });

  const addEntry = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id) throw new Error('Not authenticated');

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/mood_journals`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            user_id: session.user.id,
            mood_rating: newEntry.mood_rating,
            journal_entry: newEntry.journal_entry,
            gratitude_points: newEntry.gratitude_points.filter(Boolean),
            activities: newEntry.activities,
            sleep_quality: newEntry.sleep_quality,
            energy_level: newEntry.energy_level,
            anxiety_level: newEntry.anxiety_level,
            positive_thoughts: newEntry.positive_thoughts,
            challenges: newEntry.challenges,
            solutions: newEntry.solutions
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || response.statusText);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mood-journal'] });
      toast({
        title: "Journal entry added",
        description: "Your mood journal entry has been saved"
      });
      setNewEntry({
        mood_rating: 5,
        journal_entry: "",
        gratitude_points: ["", "", ""],
        activities: [],
        sleep_quality: 5,
        energy_level: 5,
        anxiety_level: 5,
        positive_thoughts: [],
        challenges: [],
        solutions: []
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save journal entry. Please try again.",
        variant: "destructive"
      });
    }
  });

  const updateGratitudePoint = (index: number, value: string) => {
    const newPoints = [...newEntry.gratitude_points];
    newPoints[index] = value;
    setNewEntry({ ...newEntry, gratitude_points: newPoints });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Daily Mood Journal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Mood Rating ({newEntry.mood_rating}/10)</p>
              <Brain className="h-4 w-4 text-primary" />
            </div>
            <Slider
              value={[newEntry.mood_rating]}
              onValueChange={([value]) => setNewEntry({ ...newEntry, mood_rating: value })}
              max={10}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Today's Journal Entry</label>
            <Textarea
              placeholder="How are you feeling today? What's on your mind?"
              value={newEntry.journal_entry}
              onChange={(e) => setNewEntry({ ...newEntry, journal_entry: e.target.value })}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              <label className="text-sm font-medium">Three Things I'm Grateful For</label>
            </div>
            <div className="space-y-2">
              {newEntry.gratitude_points.map((point, index) => (
                <Input
                  key={index}
                  placeholder={`I'm grateful for...`}
                  value={point}
                  onChange={(e) => updateGratitudePoint(index, e.target.value)}
                />
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Sleep Quality</label>
                <Moon className="h-4 w-4 text-primary" />
              </div>
              <Slider
                value={[newEntry.sleep_quality]}
                onValueChange={([value]) => setNewEntry({ ...newEntry, sleep_quality: value })}
                max={10}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Energy Level</label>
                <Battery className="h-4 w-4 text-primary" />
              </div>
              <Slider
                value={[newEntry.energy_level]}
                onValueChange={([value]) => setNewEntry({ ...newEntry, energy_level: value })}
                max={10}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Anxiety Level</label>
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <Slider
                value={[newEntry.anxiety_level]}
                onValueChange={([value]) => setNewEntry({ ...newEntry, anxiety_level: value })}
                max={10}
                step={1}
              />
            </div>
          </div>
        </div>

        <Button 
          className="w-full" 
          onClick={() => addEntry.mutate()}
          disabled={!newEntry.journal_entry || addEntry.isPending}
        >
          <Plus className="h-4 w-4 mr-2" />
          Save Journal Entry
        </Button>

        {entries && entries.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="font-medium">Recent Entries</h3>
            {entries.map((entry) => (
              <Card key={entry.id} className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </p>
                      <p className="font-medium">Mood: {entry.mood_rating}/10</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="text-sm text-muted-foreground">
                        Energy: {entry.energy_level}/10
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Sleep: {entry.sleep_quality}/10
                      </div>
                    </div>
                  </div>
                  {entry.journal_entry && (
                    <p className="text-sm">{entry.journal_entry}</p>
                  )}
                  {entry.gratitude_points && entry.gratitude_points.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Grateful for:</p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {entry.gratitude_points.map((point, index) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
