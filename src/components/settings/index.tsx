import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { toast } from 'sonner';
import { Database } from '@/types/supabase';
import { useTheme } from '../ThemeProvider';

interface FocusSettings {
  id: string;
  user_id: string;
  default_duration: number;
  break_duration: number;
  notification_enabled: boolean;
  sound_enabled: boolean;
  dark_mode: boolean;
}

export function Settings() {
  const [settings, setSettings] = useState<FocusSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = useSupabaseClient<Database>();
  const user = useUser();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('focus_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      toast.error('Failed to load settings');
      return;
    }

    if (data) {
      setSettings(data);
    } else {
      // Create default settings
      const defaultSettings = {
        user_id: user.id,
        default_duration: 25,
        break_duration: 5,
        notification_enabled: true,
        sound_enabled: true,
        dark_mode: theme === 'dark',
      };

      const { data: newSettings, error: createError } = await supabase
        .from('focus_settings')
        .insert([defaultSettings])
        .select()
        .single();

      if (createError) {
        toast.error('Failed to create default settings');
        return;
      }

      if (newSettings) {
        setSettings(newSettings);
      }
    }

    setIsLoading(false);
  };

  const updateSettings = async (updates: Partial<FocusSettings>) => {
    if (!user || !settings) return;

    const { error } = await supabase
      .from('focus_settings')
      .update(updates)
      .eq('id', settings.id);

    if (error) {
      toast.error('Failed to update settings');
      return;
    }

    setSettings({ ...settings, ...updates });
    toast.success('Settings updated successfully');

    // Update theme if dark mode setting changed
    if ('dark_mode' in updates) {
      setTheme(updates.dark_mode ? 'dark' : 'light');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Settings</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Focus Timer Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Default Focus Duration (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={settings?.default_duration || 25}
                onChange={(e) =>
                  updateSettings({ default_duration: parseInt(e.target.value) })
                }
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Break Duration (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings?.break_duration || 5}
                onChange={(e) =>
                  updateSettings({ break_duration: parseInt(e.target.value) })
                }
                className="w-full p-2 border rounded-md"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Enable Notifications</span>
              <Button
                variant={settings?.notification_enabled ? 'default' : 'outline'}
                onClick={() =>
                  updateSettings({
                    notification_enabled: !settings?.notification_enabled,
                  })
                }
              >
                {settings?.notification_enabled ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <span>Sound Effects</span>
              <Button
                variant={settings?.sound_enabled ? 'default' : 'outline'}
                onClick={() =>
                  updateSettings({ sound_enabled: !settings?.sound_enabled })
                }
              >
                {settings?.sound_enabled ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span>Dark Mode</span>
              <Button
                variant={settings?.dark_mode ? 'default' : 'outline'}
                onClick={() =>
                  updateSettings({ dark_mode: !settings?.dark_mode })
                }
              >
                {settings?.dark_mode ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 