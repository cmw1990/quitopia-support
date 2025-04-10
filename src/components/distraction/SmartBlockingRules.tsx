import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";
import { Brain } from "lucide-react";

type SmartBlockingSettings = {
  adaptiveMode: boolean;
  learningEnabled: boolean;
  productivityThreshold: number;
  autoAdjust: boolean;
  focusTimeBlocking: boolean;
  aiSuggestions: boolean;
  strictMode: boolean;
  allowedBreakTime: number;
  customPatterns: boolean;
  timeBoxing: boolean;
};

export const SmartBlockingRules = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<SmartBlockingSettings>({
    adaptiveMode: false,
    learningEnabled: true,
    productivityThreshold: 70,
    autoAdjust: true,
    focusTimeBlocking: true,
    aiSuggestions: true,
    strictMode: false,
    allowedBreakTime: 5,
    customPatterns: true,
    timeBoxing: false
  });

  useEffect(() => {
    loadSettings();
  }, [session?.user?.id]);

  const loadSettings = async () => {
    if (!session?.user?.id) return;

    try {
      const { data, error } = await supabase
        .from('distraction_blocking')
        .select('pattern_data')
        .eq('user_id', session.user.id)
        .eq('block_type', 'website')
        .eq('target', 'smart-rules')
        .maybeSingle();

      if (error) throw error;

      if (data?.pattern_data) {
        setSettings(data.pattern_data as SmartBlockingSettings);
      }
    } catch (error) {
      console.error('Error loading smart blocking settings:', error);
      toast({
        title: "Error loading settings",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const saveSettings = async () => {
    if (!session?.user?.id) return;

    try {
      const { error } = await supabase
        .from('distraction_blocking')
        .upsert({
          user_id: session.user.id,
          block_type: 'website',
          target: 'smart-rules',
          pattern_data: settings,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Your smart blocking settings have been updated"
      });
    } catch (error) {
      console.error('Error saving smart blocking settings:', error);
      toast({
        title: "Error saving settings",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Smart Blocking Rules
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Adaptive Mode</Label>
            <p className="text-sm text-muted-foreground">
              Automatically adjust blocking rules based on your productivity patterns
            </p>
          </div>
          <Switch
            checked={settings.adaptiveMode}
            onCheckedChange={(checked) => 
              setSettings(prev => ({ ...prev, adaptiveMode: checked }))}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Pattern Learning</Label>
            <p className="text-sm text-muted-foreground">
              Learn from your usage patterns to improve blocking effectiveness
            </p>
          </div>
          <Switch
            checked={settings.learningEnabled}
            onCheckedChange={(checked) => 
              setSettings(prev => ({ ...prev, learningEnabled: checked }))}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Focus Time Blocking</Label>
            <p className="text-sm text-muted-foreground">
              Block distractions during scheduled focus time periods
            </p>
          </div>
          <Switch
            checked={settings.focusTimeBlocking}
            onCheckedChange={(checked) => 
              setSettings(prev => ({ ...prev, focusTimeBlocking: checked }))}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>AI Suggestions</Label>
            <p className="text-sm text-muted-foreground">
              Get AI-powered suggestions for improving your focus and productivity
            </p>
          </div>
          <Switch
            checked={settings.aiSuggestions}
            onCheckedChange={(checked) => 
              setSettings(prev => ({ ...prev, aiSuggestions: checked }))}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Strict Mode</Label>
            <p className="text-sm text-muted-foreground">
              Prevent override of blocking rules during focus sessions
            </p>
          </div>
          <Switch
            checked={settings.strictMode}
            onCheckedChange={(checked) => 
              setSettings(prev => ({ ...prev, strictMode: checked }))}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Custom Patterns</Label>
            <p className="text-sm text-muted-foreground">
              Create custom blocking patterns based on time, activity, or location
            </p>
          </div>
          <Switch
            checked={settings.customPatterns}
            onCheckedChange={(checked) => 
              setSettings(prev => ({ ...prev, customPatterns: checked }))}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Time Boxing</Label>
            <p className="text-sm text-muted-foreground">
              Automatically schedule focused work periods with breaks
            </p>
          </div>
          <Switch
            checked={settings.timeBoxing}
            onCheckedChange={(checked) => 
              setSettings(prev => ({ ...prev, timeBoxing: checked }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Productivity Threshold</Label>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.productivityThreshold}
            onChange={(e) => setSettings(prev => ({ 
              ...prev, 
              productivityThreshold: parseInt(e.target.value) 
            }))}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Lenient</span>
            <span>{settings.productivityThreshold}%</span>
            <span>Strict</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Break Duration (minutes)</Label>
          <input
            type="range"
            min="1"
            max="30"
            value={settings.allowedBreakTime}
            onChange={(e) => setSettings(prev => ({ 
              ...prev, 
              allowedBreakTime: parseInt(e.target.value) 
            }))}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Short</span>
            <span>{settings.allowedBreakTime} min</span>
            <span>Long</span>
          </div>
        </div>

        <Button onClick={saveSettings} className="w-full">
          Save Smart Blocking Settings
        </Button>
      </CardContent>
    </Card>
  );
};