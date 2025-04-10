
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MultiSelect, Option } from "@/components/ui/multi-select";
import { useToast } from "@/hooks/use-toast";
import { Settings, Clock, Bell } from "lucide-react";

const REMINDER_OPTIONS: Option[] = [
  { value: "24h", label: "24 hours before" },
  { value: "12h", label: "12 hours before" },
  { value: "2h", label: "2 hours before" },
  { value: "1h", label: "1 hour before" },
  { value: "30m", label: "30 minutes before" }
];

interface SchedulingRules {
  session_duration_minutes: number;
  buffer_minutes: number;
  max_daily_sessions: number;
  notification_preferences: {
    email: boolean;
    sms: boolean;
    reminders: Option[];
  };
}

export function SchedulingRules() {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rules, setRules] = useState<SchedulingRules>({
    session_duration_minutes: 50,
    buffer_minutes: 10,
    max_daily_sessions: 8,
    notification_preferences: {
      email: true,
      sms: false,
      reminders: REMINDER_OPTIONS.slice(0, 2)
    }
  });

  const { data: existingRules } = useQuery({
    queryKey: ['scheduling-rules', session?.user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('professional_scheduling_rules')
        .select('*')
        .eq('professional_id', session?.user?.id)
        .single();
      return data;
    },
    enabled: !!session?.user?.id
  });

  const updateRules = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('professional_scheduling_rules')
        .upsert({
          professional_id: session?.user?.id,
          session_duration_minutes: rules.session_duration_minutes,
          buffer_minutes: rules.buffer_minutes,
          max_daily_sessions: rules.max_daily_sessions,
          notification_preferences: {
            email: rules.notification_preferences.email,
            sms: rules.notification_preferences.sms,
            reminders: rules.notification_preferences.reminders.map(r => r.value)
          }
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduling-rules'] });
      toast({
        title: "Success",
        description: "Scheduling rules updated successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update scheduling rules",
        variant: "destructive"
      });
      console.error('Scheduling rules error:', error);
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Scheduling Rules
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div className="space-y-2 flex-1">
              <Label>Session Duration (minutes)</Label>
              <Input
                type="number"
                value={rules.session_duration_minutes}
                onChange={(e) => setRules(prev => ({
                  ...prev,
                  session_duration_minutes: parseInt(e.target.value)
                }))}
                min={15}
                max={180}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div className="space-y-2 flex-1">
              <Label>Buffer Time Between Sessions (minutes)</Label>
              <Input
                type="number"
                value={rules.buffer_minutes}
                onChange={(e) => setRules(prev => ({
                  ...prev,
                  buffer_minutes: parseInt(e.target.value)
                }))}
                min={5}
                max={60}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div className="space-y-2 flex-1">
              <Label>Maximum Daily Sessions</Label>
              <Input
                type="number"
                value={rules.max_daily_sessions}
                onChange={(e) => setRules(prev => ({
                  ...prev,
                  max_daily_sessions: parseInt(e.target.value)
                }))}
                min={1}
                max={20}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </Label>

            <div className="space-y-4 pl-7">
              <div className="flex items-center gap-2">
                <Switch
                  checked={rules.notification_preferences.email}
                  onCheckedChange={(checked) => setRules(prev => ({
                    ...prev,
                    notification_preferences: {
                      ...prev.notification_preferences,
                      email: checked
                    }
                  }))}
                />
                <Label>Email Notifications</Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={rules.notification_preferences.sms}
                  onCheckedChange={(checked) => setRules(prev => ({
                    ...prev,
                    notification_preferences: {
                      ...prev.notification_preferences,
                      sms: checked
                    }
                  }))}
                />
                <Label>SMS Notifications</Label>
              </div>

              <div className="space-y-2">
                <Label>Reminder Times</Label>
                <MultiSelect
                  options={REMINDER_OPTIONS}
                  selected={rules.notification_preferences.reminders}
                  onChange={(selected) => setRules(prev => ({
                    ...prev,
                    notification_preferences: {
                      ...prev.notification_preferences,
                      reminders: selected
                    }
                  }))}
                  placeholder="Select reminder times..."
                />
              </div>
            </div>
          </div>
        </div>

        <Button 
          onClick={() => updateRules.mutate()}
          disabled={updateRules.isPending}
          className="w-full"
        >
          {updateRules.isPending ? "Saving..." : "Save Rules"}
        </Button>
      </CardContent>
    </Card>
  );
}
