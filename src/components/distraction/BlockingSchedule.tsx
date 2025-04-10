import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";
import { Clock } from "lucide-react";

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const BlockingSchedule = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [schedule, setSchedule] = useState<any>({
    start_time: "09:00",
    end_time: "17:00",
    days: DAYS,
    is_active: true
  });

  useEffect(() => {
    loadSchedule();
  }, [session?.user?.id]);

  const loadSchedule = async () => {
    if (!session?.user?.id) return;

    try {
      const { data, error } = await supabase
        .from('distraction_blocking')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('block_type', 'website')
        .eq('target', 'schedule')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSchedule({
          start_time: data.schedule_start,
          end_time: data.schedule_end,
          days: data.days_active,
          is_active: data.is_active
        });
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
      toast({
        title: "Error loading schedule",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const saveSchedule = async () => {
    if (!session?.user?.id) return;

    try {
      const { error } = await supabase
        .from('distraction_blocking')
        .upsert({
          user_id: session.user.id,
          block_type: 'website',
          target: 'schedule',
          schedule_start: schedule.start_time,
          schedule_end: schedule.end_time,
          days_active: schedule.days,
          is_active: schedule.is_active
        });

      if (error) throw error;

      toast({
        title: "Schedule saved",
        description: "Your blocking schedule has been updated"
      });
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast({
        title: "Error saving schedule",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const toggleDay = (day: string) => {
    setSchedule(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Blocking Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Label>Enable Schedule</Label>
          <Switch
            checked={schedule.is_active}
            onCheckedChange={(checked) => setSchedule(prev => ({ ...prev, is_active: checked }))}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Start Time</Label>
            <input
              type="time"
              value={schedule.start_time}
              onChange={(e) => setSchedule(prev => ({ ...prev, start_time: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="space-y-2">
            <Label>End Time</Label>
            <input
              type="time"
              value={schedule.end_time}
              onChange={(e) => setSchedule(prev => ({ ...prev, end_time: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Active Days</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {DAYS.map((day) => (
              <div
                key={day}
                className="flex items-center space-x-2"
              >
                <Switch
                  checked={schedule.days.includes(day)}
                  onCheckedChange={() => toggleDay(day)}
                />
                <Label>{day}</Label>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={saveSchedule} className="w-full">
          Save Schedule
        </Button>
      </CardContent>
    </Card>
  );
};