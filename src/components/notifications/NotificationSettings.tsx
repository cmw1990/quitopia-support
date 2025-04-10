import { useEffect, useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Bell, 
  Moon, 
  Brain, 
  Battery, 
  Activity,
  Calendar,
  MessageSquare,
  Target,
  Clock,
  SmartphoneCharging
} from "lucide-react";
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";
import { Json } from "@/integrations/supabase/types";

interface NotificationPreferences {
  moodReminders: boolean;
  sleepReminders: boolean;
  focusReminders: boolean;
  energyAlerts: boolean;
  achievementAlerts: boolean;
  supportMessages: boolean;
  goalProgress: boolean;
  scheduleReminders: boolean;
  deviceEnabled: boolean;
}

export const NotificationSettings = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    moodReminders: true,
    sleepReminders: true,
    focusReminders: true,
    energyAlerts: true,
    achievementAlerts: true,
    supportMessages: true,
    goalProgress: true,
    scheduleReminders: true,
    deviceEnabled: false
  });
  const [webNotificationsEnabled, setWebNotificationsEnabled] = useState(false);

  useEffect(() => {
    loadPreferences();
    checkNotificationPermissions();
  }, [session?.user?.id]);

  const loadPreferences = async () => {
    if (!session?.user?.id) return;

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (error) {
      console.error('Error loading preferences:', error);
      return;
    }

    if (data?.preferences) {
      const loadedPrefs = data.preferences as Record<string, boolean>;
      setPreferences(prevPrefs => ({
        ...prevPrefs,
        ...Object.fromEntries(
          Object.entries(loadedPrefs).filter(([key]) => key in prevPrefs)
        )
      }));
    }
  };

  const savePreferences = async (newPreferences: NotificationPreferences) => {
    if (!session?.user?.id) return;

    const preferencesJson: Record<string, boolean> = {
      moodReminders: newPreferences.moodReminders,
      sleepReminders: newPreferences.sleepReminders,
      focusReminders: newPreferences.focusReminders,
      energyAlerts: newPreferences.energyAlerts,
      achievementAlerts: newPreferences.achievementAlerts,
      supportMessages: newPreferences.supportMessages,
      goalProgress: newPreferences.goalProgress,
      scheduleReminders: newPreferences.scheduleReminders,
      deviceEnabled: newPreferences.deviceEnabled
    };

    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: session.user.id,
        preferences: preferencesJson as Json,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error saving preferences",
        description: "Please try again later",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Preferences saved",
      description: "Your notification preferences have been updated"
    });
  };

  const checkNotificationPermissions = async () => {
    if (Capacitor.isNativePlatform()) {
      // Check mobile push notification permissions
      const permStatus = await PushNotifications.checkPermissions();
      
      if (permStatus.receive === 'prompt') {
        await requestPushPermission();
      }
      
      setPreferences(prev => ({
        ...prev,
        deviceEnabled: permStatus.receive === 'granted'
      }));
    } else {
      // Check web notification permissions
      if ('Notification' in window) {
        const permission = await Notification.permission;
        setWebNotificationsEnabled(permission === 'granted');
      }
    }
  };

  const requestPushPermission = async () => {
    if (Capacitor.isNativePlatform()) {
      // Request mobile push notification permission
      const result = await PushNotifications.requestPermissions();
      
      if (result.receive === 'granted') {
        await PushNotifications.register();
        setPreferences(prev => ({
          ...prev,
          deviceEnabled: true
        }));
        
        toast({
          title: "Push notifications enabled",
          description: "You'll now receive important updates on your device"
        });
      }
    } else {
      // Request web notification permission
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        setWebNotificationsEnabled(permission === 'granted');
        
        if (permission === 'granted') {
          toast({
            title: "Web notifications enabled",
            description: "You'll now receive updates in your browser"
          });
        }
      }
    }
  };

  const handleToggle = async (key: keyof NotificationPreferences) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key]
    };
    setPreferences(newPreferences);
    await savePreferences(newPreferences);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Customize how and when you want to receive updates and reminders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <SmartphoneCharging className="h-5 w-5 text-primary" />
            <div>
              <Label className="text-base">Device Notifications</Label>
              <p className="text-sm text-muted-foreground">
                {Capacitor.isNativePlatform() 
                  ? "Push notifications on your device" 
                  : "Browser notifications on this computer"}
              </p>
            </div>
          </div>
          {(!preferences.deviceEnabled && !webNotificationsEnabled) ? (
            <Button onClick={requestPushPermission}>
              Enable Notifications
            </Button>
          ) : (
            <Switch
              checked={Capacitor.isNativePlatform() 
                ? preferences.deviceEnabled 
                : webNotificationsEnabled}
              onCheckedChange={() => handleToggle('deviceEnabled')}
            />
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <Label>Mood Reminders</Label>
            </div>
            <Switch
              checked={preferences.moodReminders}
              onCheckedChange={() => handleToggle('moodReminders')}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-primary" />
              <Label>Sleep Reminders</Label>
            </div>
            <Switch
              checked={preferences.sleepReminders}
              onCheckedChange={() => handleToggle('sleepReminders')}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <Label>Focus Reminders</Label>
            </div>
            <Switch
              checked={preferences.focusReminders}
              onCheckedChange={() => handleToggle('focusReminders')}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              <Battery className="h-5 w-5 text-primary" />
              <Label>Energy Alerts</Label>
            </div>
            <Switch
              checked={preferences.energyAlerts}
              onCheckedChange={() => handleToggle('energyAlerts')}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <Label>Achievement Alerts</Label>
            </div>
            <Switch
              checked={preferences.achievementAlerts}
              onCheckedChange={() => handleToggle('achievementAlerts')}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <Label>Support Messages</Label>
            </div>
            <Switch
              checked={preferences.supportMessages}
              onCheckedChange={() => handleToggle('supportMessages')}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <Label>Goal Progress</Label>
            </div>
            <Switch
              checked={preferences.goalProgress}
              onCheckedChange={() => handleToggle('goalProgress')}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <Label>Schedule Reminders</Label>
            </div>
            <Switch
              checked={preferences.scheduleReminders}
              onCheckedChange={() => handleToggle('scheduleReminders')}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};