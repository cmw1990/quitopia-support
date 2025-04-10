import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SUPABASE_URL, SUPABASE_KEY } from "@/integrations/supabase/db-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Plus } from "lucide-react";
import { GratitudeJournal } from "./GratitudeJournal";
import { useAuth } from "@/components/AuthProvider";

export const MotivationJournal = () => {
  const { toast } = useToast();
  const { session } = useAuth();
  const [entry, setEntry] = useState("");

  const saveJournalEntry = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to save journal entries",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/journal_entries`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            content: entry,
            entry_type: "motivation",
            user_id: session.user.id
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || response.statusText);
      }

      toast({
        title: "Entry saved!",
        description: "Keep tracking your journey!",
      });
      setEntry("");
    } catch (error) {
      toast({
        title: "Error saving entry",
        description: "Please try again",
        variant: "destructive",
      });
      console.error('Error saving journal entry:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-semibold">Motivation Journal</h2>
        </div>

        <Textarea
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="Write about your motivation, goals, and progress..."
          className="min-h-[150px]"
        />

        <Button onClick={saveJournalEntry} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Save Entry
        </Button>
      </Card>

      <GratitudeJournal />
    </div>
  );
};