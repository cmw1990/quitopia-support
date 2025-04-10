import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SUPABASE_URL, SUPABASE_KEY } from "@/integrations/supabase/db-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Heart, Plus } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const GratitudeJournal = () => {
  const { toast } = useToast();
  const { session } = useAuth();
  const [entry, setEntry] = useState("");
  const [category, setCategory] = useState<"people" | "experiences" | "things" | "personal_growth" | "nature" | "other">("experiences");

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
        `${SUPABASE_URL}/rest/v1/gratitude_journal`,
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
            category,
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
        description: "Keep practicing gratitude!",
      });
      setEntry("");
    } catch (error) {
      console.error("Error saving gratitude entry:", error);
      toast({
        title: "Error saving entry",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Heart className="h-6 w-6 text-rose-500" />
        <h2 className="text-2xl font-semibold">Gratitude Journal</h2>
      </div>

      <Select value={category} onValueChange={(value: typeof category) => setCategory(value)}>
        <SelectTrigger>
          <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="people">People</SelectItem>
          <SelectItem value="experiences">Experiences</SelectItem>
          <SelectItem value="things">Things</SelectItem>
          <SelectItem value="personal_growth">Personal Growth</SelectItem>
          <SelectItem value="nature">Nature</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>

      <Textarea
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        placeholder="What are you grateful for today?"
        className="min-h-[150px]"
      />

      <Button onClick={saveJournalEntry} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Save Entry
      </Button>
    </Card>
  );
};