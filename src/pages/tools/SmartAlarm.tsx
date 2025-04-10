import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TopNav } from "@/components/layout/TopNav";
import { ToolAnalyticsWrapper } from "@/components/tools/ToolAnalyticsWrapper";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Clock, Moon, Bell, Settings } from "lucide-react";
import { SUPABASE_URL, SUPABASE_KEY } from "@/integrations/supabase/db-client";
import { format } from "date-fns";
import { useAuth } from "@/components/AuthProvider";

export default function SmartAlarm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const [wakeTime, setWakeTime] = useState("07:00");
  const [isActive, setIsActive] = useState(true);
  const [smartWakeEnabled, setSmartWakeEnabled] = useState(true);

  const { data: alarmSettings, isLoading } = useQuery({
    queryKey: ["sleep_alarms"],
    queryFn: async () => {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/sleep_alarms?limit=1`,
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

      const data = await response.json();
      return data[0] || null;
    },
    enabled: !!session?.access_token
  });

  const updateAlarm = useMutation({
    mutationFn: async (values: {
      wake_time: string;
      is_active: boolean;
      smart_wake_window_minutes: number;
    }) => {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/sleep_alarms`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session?.access_token}`,
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            user_id: session?.user?.id,
            wake_time: values.wake_time,
            is_active: values.is_active,
            smart_wake_window_minutes: values.smart_wake_window_minutes,
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || response.statusText);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sleep_alarms"] });
      toast({
        title: "Alarm Updated",
        description: "Your alarm settings have been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update alarm settings.",
        variant: "destructive",
      });
    },
  });

  const handleSaveAlarm = () => {
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to save alarm settings.",
        variant: "destructive",
      });
      return;
    }

    updateAlarm.mutate({
      wake_time: wakeTime,
      is_active: isActive,
      smart_wake_window_minutes: smartWakeEnabled ? 30 : 0,
    });
  };

  return (
    <ToolAnalyticsWrapper toolName="smart-alarm" toolType="tracking" toolSettings={{}}>
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto p-4 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Smart Alarm Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="wake-time">Wake Time</Label>
                    <input
                      id="wake-time"
                      type="time"
                      value={wakeTime}
                      onChange={(e) => setWakeTime(e.target.value)}
                      className="w-full p-2 rounded-md border"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Alarm Active</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable or disable the alarm
                      </p>
                    </div>
                    <Switch
                      checked={isActive}
                      onCheckedChange={setIsActive}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Smart Wake</Label>
                      <p className="text-sm text-muted-foreground">
                        Wake you up during light sleep phase
                      </p>
                    </div>
                    <Switch
                      checked={smartWakeEnabled}
                      onCheckedChange={setSmartWakeEnabled}
                    />
                  </div>

                  <Button
                    onClick={handleSaveAlarm}
                    className="w-full"
                    disabled={updateAlarm.isPending}
                  >
                    Save Alarm Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Moon className="h-5 w-5" />
                  Current Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Next Alarm:</span>
                    <span className="font-bold">
                      {isActive ? format(new Date(`2000-01-01T${wakeTime}`), "h:mm a") : "Disabled"}
                    </span>
                  </div>
                  {smartWakeEnabled && (
                    <div className="flex justify-between items-center">
                      <span>Smart Wake Window:</span>
                      <span className="text-muted-foreground">
                        30 minutes before alarm
                      </span>
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    {smartWakeEnabled ? (
                      <p>
                        Smart Wake will monitor your sleep patterns and wake you up at the optimal time
                        within 30 minutes before your set alarm time.
                      </p>
                    ) : (
                      <p>
                        Smart Wake is disabled. The alarm will sound exactly at the set time.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ToolAnalyticsWrapper>
  );
}
