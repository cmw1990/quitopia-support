import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, ArrowUpDown, Brain, Target } from "lucide-react";
import { supabasePost } from "@/lib/supabaseApiService";
import { useAuth } from "@/contexts/AuthContext";

interface TimeBlock {
  id: string;
  title: string;
  startTime: string;
  duration: number;
  priority: 'high' | 'medium' | 'low';
  energyLevel: number;
}

export const TimeBlockingTools = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);
  const [newBlock, setNewBlock] = useState<Omit<TimeBlock, 'id'>>({
    title: "",
    startTime: "",
    duration: 30,
    priority: "medium",
    energyLevel: 5
  });

  const addBlock = async () => {
    if (!user?.id) {
        toast({ title: "Not Logged In", description: "Log in to save time blocks." });
        return;
    }
    if (!newBlock.title || !newBlock.startTime || !newBlock.duration) {
        toast({ title: "Missing Info", description: "Please fill in title, start time, and duration." });
        return;
    }

    const block: TimeBlock = {
      id: Math.random().toString(36).substr(2, 9),
      ...newBlock
    };

    try {
      const { error } = await supabasePost(
        "energy_focus_logs",
        [{
            user_id: user.id,
            activity_type: "time_block",
            activity_name: block.title,
            duration_minutes: block.duration,
            energy_rating: block.energyLevel,
            focus_rating: block.priority === "high" ? 90 : block.priority === "medium" ? 70 : 50,
            notes: `Priority: ${block.priority}, Start time: ${block.startTime}`,
        }]
      );

      if (error) throw error;
      
      setBlocks([...blocks, block]);
      setNewBlock({
        title: "",
        startTime: "",
        duration: 30,
        priority: "medium",
        energyLevel: 5
      });

      toast({
        title: "Time block added",
        description: "Your time block has been scheduled",
      });
    } catch (error) {
      console.error("Error saving time block:", error);
      toast({
        title: "Error saving time block",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 dark:bg-red-900/30";
      case "medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30";
      case "low":
        return "bg-green-100 text-green-700 dark:bg-green-900/30";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Time Blocking & Energy Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Task Title</Label>
              <Input
                placeholder="Enter task title"
                value={newBlock.title}
                onChange={(e) => setNewBlock({ ...newBlock, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={newBlock.startTime}
                  onChange={(e) => setNewBlock({ ...newBlock, startTime: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  min="5"
                  max="240"
                  value={newBlock.duration}
                  onChange={(e) => setNewBlock({ ...newBlock, duration: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Priority</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newBlock.priority}
                  onChange={(e) => setNewBlock({ ...newBlock, priority: e.target.value as 'high' | 'medium' | 'low' })}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Energy Level (1-10)</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={newBlock.energyLevel}
                  onChange={(e) => setNewBlock({ ...newBlock, energyLevel: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <Button onClick={addBlock} className="w-full">
              <Clock className="h-4 w-4 mr-2" />
              Schedule Block
            </Button>
          </div>

          <div className="space-y-4">
            {blocks.map((block) => (
              <div
                key={block.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{block.title}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(block.priority)}`}>
                      {block.priority}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {block.startTime} • {block.duration} minutes • Energy: {block.energyLevel}/10
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-primary/10 space-y-2">
          <h3 className="font-semibold">Time Blocking Tips</h3>
          <ul className="space-y-1 text-sm">
            <li>• Schedule high-priority tasks during your peak energy hours</li>
            <li>• Include buffer time between blocks for transitions</li>
            <li>• Break large tasks into smaller time blocks</li>
            <li>• Adjust block duration based on task complexity</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};