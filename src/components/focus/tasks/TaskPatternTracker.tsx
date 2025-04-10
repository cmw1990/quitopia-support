import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabaseGet, supabasePost } from "@/lib/supabaseApiService";
import { Brain, Sun, Moon, Zap, RefreshCcw, Activity } from "lucide-react";

interface CompletionPattern {
  id: string;
  time_of_day: string[];
  success_rate: number;
  environment_factors: {
    noise_level?: string;
    lighting?: string;
    temperature?: string;
  };
  distraction_triggers: {
    type: string;
    frequency: number;
  }[];
  coping_strategies: {
    strategy: string;
    effectiveness: number;
  }[];
}

export const TaskPatternTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [patterns, setPatterns] = useState<CompletionPattern[]>([]);
  const [currentSession, setCurrentSession] = useState({
    time_of_day: [] as string[],
    noise_level: "moderate",
    lighting: "moderate",
    distractions: [] as string[],
    success_rating: 7,
  });

  useEffect(() => {
    if (user?.id) {
      loadPatterns();
    }
  }, [user?.id]);

  const loadPatterns = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabaseGet<any[]>(
        "task_completion_patterns",
        `user_id=eq.${user.id}&select=*&order=created_at.desc`
      );

      if (error) throw error;

      const transformedPatterns: CompletionPattern[] = (data || []).map((pattern: any) => ({
        id: pattern.id,
        time_of_day: Array.isArray(pattern.time_of_day) ? pattern.time_of_day : [],
        success_rate: pattern.success_rate || 0,
        environment_factors: (
          typeof pattern.environment_factors === 'string'
            ? JSON.parse(pattern.environment_factors)
            : pattern.environment_factors
        ) || { noise_level: "moderate", lighting: "moderate", temperature: "moderate" },
        distraction_triggers: ((typeof pattern.distraction_triggers === 'string'
          ? JSON.parse(pattern.distraction_triggers)
          : pattern.distraction_triggers
        ) || []).map((trigger: any) => ({
          type: trigger.type || "",
          frequency: trigger.frequency || 0
        })),
        coping_strategies: ((typeof pattern.coping_strategies === 'string'
          ? JSON.parse(pattern.coping_strategies)
          : pattern.coping_strategies
        ) || []).map((strategy: any) => ({
          strategy: strategy.strategy || "",
          effectiveness: strategy.effectiveness || 0
        }))
      }));

      setPatterns(transformedPatterns);
    } catch (error) {
      console.error("Error loading patterns:", error);
      toast({
        title: "Error loading patterns",
        description: "Could not load your task completion patterns",
        variant: "destructive",
      });
    }
  };

  const recordPattern = async () => {
    if (!user?.id) return;
    try {
      const payload = {
        user_id: user.id,
        time_of_day: getCurrentTimeOfDay(),
        success_rate: currentSession.success_rating,
        environment_factors: JSON.stringify({
          noise_level: currentSession.noise_level,
          lighting: currentSession.lighting,
        }),
        distraction_triggers: JSON.stringify(currentSession.distractions.map(d => ({
          type: d,
          frequency: 1,
        }))),
      };

      const { error } = await supabasePost(
        "task_completion_patterns",
        [payload]
      );

      if (error) throw error;

      toast({
        title: "Pattern recorded",
        description: "Your task completion pattern has been saved",
      });

      loadPatterns();
    } catch (error) {
      console.error("Error saving pattern:", error);
      toast({
        title: "Error saving pattern",
        description: "Could not save your task completion pattern",
        variant: "destructive",
      });
    }
  };

  const getCurrentTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return ["morning"];
    if (hour < 17) return ["afternoon"];
    return ["evening"];
  };

  const addDistraction = (type: string) => {
    if (!currentSession.distractions.includes(type)) {
      setCurrentSession({
        ...currentSession,
        distractions: [...currentSession.distractions, type],
      });
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          Task Pattern Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Environment</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Noise Level</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={currentSession.noise_level}
                  onChange={(e) =>
                    setCurrentSession({
                      ...currentSession,
                      noise_level: e.target.value,
                    })
                  }
                >
                  <option value="quiet">Quiet</option>
                  <option value="moderate">Moderate</option>
                  <option value="noisy">Noisy</option>
                </select>
              </div>
              <div>
                <Label className="text-sm">Lighting</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={currentSession.lighting}
                  onChange={(e) =>
                    setCurrentSession({
                      ...currentSession,
                      lighting: e.target.value,
                    })
                  }
                >
                  <option value="dim">Dim</option>
                  <option value="moderate">Moderate</option>
                  <option value="bright">Bright</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Distractions Encountered</Label>
            <div className="flex flex-wrap gap-2">
              {["notifications", "noise", "visual", "internal", "people"].map(
                (type) => (
                  <Button
                    key={type}
                    variant={
                      currentSession.distractions.includes(type)
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => addDistraction(type)}
                  >
                    {type}
                  </Button>
                )
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Success Rating</Label>
              <span className="text-sm text-muted-foreground">
                {currentSession.success_rating}/10
              </span>
            </div>
            <Slider
              value={[currentSession.success_rating]}
              onValueChange={(value) =>
                setCurrentSession({
                  ...currentSession,
                  success_rating: value[0],
                })
              }
              max={10}
              min={1}
              step={1}
            />
          </div>

          <Button onClick={recordPattern} className="w-full">
            <Activity className="h-4 w-4 mr-2" />
            Record Pattern
          </Button>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Recent Patterns</h3>
          {patterns.slice(0, 5).map((pattern) => (
            <Card key={pattern.id} className="p-4 bg-white/50 dark:bg-gray-800/50">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {pattern.time_of_day.includes("morning") && (
                    <Sun className="h-4 w-4 text-yellow-500" />
                  )}
                  {pattern.time_of_day.includes("evening") && (
                    <Moon className="h-4 w-4 text-blue-500" />
                  )}
                  <span className="text-sm font-medium">
                    Success Rate: {pattern.success_rate}/10
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Environment: {pattern.environment_factors.noise_level} noise,{" "}
                  {pattern.environment_factors.lighting} lighting
                </div>
                {pattern.distraction_triggers && (
                  <div className="flex flex-wrap gap-1">
                    {pattern.distraction_triggers.map((trigger, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs"
                      >
                        {trigger.type}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        <div className="p-4 rounded-lg bg-purple-100/50 dark:bg-purple-900/20 space-y-2">
          <h3 className="font-semibold flex items-center gap-2">
            <Zap className="h-4 w-4 text-purple-500" />
            Pattern Insights
          </h3>
          <ul className="space-y-1 text-sm">
            <li>• Track your most productive times of day</li>
            <li>• Identify environmental factors that affect focus</li>
            <li>• Monitor common distraction patterns</li>
            <li>• Develop personalized coping strategies</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
