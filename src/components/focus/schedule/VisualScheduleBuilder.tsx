
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/supabase-client";
import {
  Calendar,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Palette,
  Bell,
  LayoutGrid
} from "lucide-react";

interface TimeBlock {
  id: string;
  start_time: string;
  end_time: string;
  activity: string;
  color: string;
}

interface VisualSchedule {
  id: string;
  schedule_type: string;
  visual_format: {
    layout: "timeline" | "grid";
    theme: string;
  };
  time_blocks: TimeBlock[];
  color_coding: Record<string, string>;
  break_reminders: {
    frequency: number;
    duration: number;
  };
}

export const VisualScheduleBuilder = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<VisualSchedule[]>([]);
  const [currentSchedule, setCurrentSchedule] = useState<VisualSchedule>({
    id: "",
    schedule_type: "daily",
    visual_format: {
      layout: "timeline",
      theme: "default",
    },
    time_blocks: [],
    color_coding: {},
    break_reminders: {
      frequency: 60,
      duration: 10,
    },
  });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (session?.user) {
      loadSchedules();
    }
  }, [session?.user]);

  const loadSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from("visual_schedules")
        .select("*")
        .eq("user_id", session?.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform the data to match our VisualSchedule interface
      const transformedSchedules: VisualSchedule[] = (data || []).map((schedule: any) => ({
        id: schedule.id,
        schedule_type: schedule.schedule_type,
        visual_format: typeof schedule.visual_format === 'string' 
          ? JSON.parse(schedule.visual_format)
          : schedule.visual_format || { layout: "timeline", theme: "default" },
        time_blocks: Array.isArray(schedule.time_blocks) 
          ? schedule.time_blocks.map((block: any) => ({
              id: block.id || Math.random().toString(36).substr(2, 9),
              start_time: block.start_time || "",
              end_time: block.end_time || "",
              activity: block.activity || "",
              color: block.color || "#000000"
            }))
          : [],
        color_coding: schedule.color_coding || {},
        break_reminders: typeof schedule.break_reminders === 'string'
          ? JSON.parse(schedule.break_reminders)
          : schedule.break_reminders || { frequency: 60, duration: 10 }
      }));

      setSchedules(transformedSchedules);
    } catch (error) {
      console.error("Error loading schedules:", error);
      toast({
        title: "Error loading schedules",
        description: "Could not load your visual schedules",
        variant: "destructive",
      });
    }
  };

  const saveSchedule = async () => {
    try {
      // Transform the data to match Supabase's expected format
      const scheduleData = {
        user_id: session?.user.id,
        schedule_type: currentSchedule.schedule_type,
        visual_format: JSON.stringify(currentSchedule.visual_format),
        time_blocks: currentSchedule.time_blocks.map(block => ({
          id: block.id,
          start_time: block.start_time,
          end_time: block.end_time,
          activity: block.activity,
          color: block.color
        })),
        color_coding: currentSchedule.color_coding,
        break_reminders: JSON.stringify(currentSchedule.break_reminders),
      };

      const { error } = await supabase
        .from("visual_schedules")
        .insert(scheduleData);

      if (error) throw error;

      toast({
        title: "Schedule saved",
        description: "Your visual schedule has been saved",
      });

      loadSchedules();
      resetForm();
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast({
        title: "Error saving schedule",
        description: "Could not save your visual schedule",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setCurrentSchedule({
      id: "",
      schedule_type: "daily",
      visual_format: {
        layout: "timeline",
        theme: "default",
      },
      time_blocks: [],
      color_coding: {},
      break_reminders: {
        frequency: 60,
        duration: 10,
      },
    });
    setEditing(false);
  };

  const addTimeBlock = () => {
    const newBlock: TimeBlock = {
      id: Math.random().toString(36).substr(2, 9),
      start_time: "",
      end_time: "",
      activity: "",
      color: "#" + Math.floor(Math.random()*16777215).toString(16),
    };

    setCurrentSchedule({
      ...currentSchedule,
      time_blocks: [...currentSchedule.time_blocks, newBlock],
    });
  };

  const updateTimeBlock = (id: string, updates: Partial<TimeBlock>) => {
    setCurrentSchedule({
      ...currentSchedule,
      time_blocks: currentSchedule.time_blocks.map((block) =>
        block.id === id ? { ...block, ...updates } : block
      ),
    });
  };

  const removeTimeBlock = (id: string) => {
    setCurrentSchedule({
      ...currentSchedule,
      time_blocks: currentSchedule.time_blocks.filter((block) => block.id !== id),
    });
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-indigo-500" />
          Visual Schedule Builder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label htmlFor="scheduleType">Schedule Type</Label>
          <Input
            type="text"
            id="scheduleType"
            value={currentSchedule.schedule_type}
            onChange={(e) =>
              setCurrentSchedule({
                ...currentSchedule,
                schedule_type: e.target.value,
              })
            }
          />

          <Label>Time Blocks</Label>
          {currentSchedule.time_blocks.map((block) => (
            <div key={block.id} className="grid grid-cols-6 gap-2">
              <Input
                type="time"
                value={block.start_time}
                onChange={(e) =>
                  updateTimeBlock(block.id, { start_time: e.target.value })
                }
              />
              <Input
                type="time"
                value={block.end_time}
                onChange={(e) =>
                  updateTimeBlock(block.id, { end_time: e.target.value })
                }
              />
              <Input
                type="text"
                value={block.activity}
                onChange={(e) =>
                  updateTimeBlock(block.id, { activity: e.target.value })
                }
              />
              <Input
                type="color"
                value={block.color}
                onChange={(e) =>
                  updateTimeBlock(block.id, { color: e.target.value })
                }
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => removeTimeBlock(block.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="secondary" onClick={addTimeBlock}>
            <Plus className="h-4 w-4 mr-2" />
            Add Time Block
          </Button>

          <Button onClick={saveSchedule}>Save Schedule</Button>
        </div>
      </CardContent>
    </Card>
  );
};
