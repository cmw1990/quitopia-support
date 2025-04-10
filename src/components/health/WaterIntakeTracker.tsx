import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/supabase-client";
import { Droplet, Plus, Settings, History, Clock } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface WaterLog {
  id: string;
  amount_ml: number;
  timestamp: string;
  notes?: string;
  intake_type: string;
}

export const WaterIntakeTracker = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [amount, setAmount] = useState("250");
  const [dailyGoal] = useState(2500); // Default 2.5L daily goal
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (session?.user) {
      loadWaterLogs();
    }
  }, [session?.user]);

  const loadWaterLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("water_intake")
        .select("*")
        .eq("user_id", session?.user.id)
        .gte("timestamp", new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
        .order("timestamp", { ascending: false });

      if (error) throw error;

      setWaterLogs(data || []);
    } catch (error) {
      console.error("Error loading water logs:", error);
      toast({
        title: "Error loading water intake",
        description: "Could not load your water intake logs",
        variant: "destructive",
      });
    }
  };

  const addWaterIntake = async () => {
    try {
      const { error } = await supabase
        .from("water_intake")
        .insert({
          user_id: session?.user.id,
          amount_ml: parseInt(amount),
          notes,
          intake_type: "water",
        });

      if (error) throw error;

      toast({
        title: "Water intake logged",
        description: `Added ${amount}ml of water`,
      });

      loadWaterLogs();
      setNotes("");
    } catch (error) {
      console.error("Error logging water intake:", error);
      toast({
        title: "Error logging water",
        description: "Could not save your water intake",
        variant: "destructive",
      });
    }
  };

  const getTotalIntake = () => {
    return waterLogs.reduce((sum, log) => sum + log.amount_ml, 0);
  };

  const getProgressPercentage = () => {
    return Math.min((getTotalIntake() / dailyGoal) * 100, 100);
  };

  const chartData = waterLogs
    .map(log => ({
      time: new Date(log.timestamp).toLocaleTimeString(),
      amount: log.amount_ml,
    }))
    .reverse();

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplet className="size-5 text-blue-500" />
          Water Intake Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-white/50 dark:bg-gray-800/50">
            <div className="text-sm text-muted-foreground">Daily Progress</div>
            <div className="mt-2 flex items-baseline">
              <span className="text-2xl font-bold">{getTotalIntake()}</span>
              <span className="ml-1 text-muted-foreground">/ {dailyGoal}ml</span>
            </div>
            <div className="mt-2 h-2 bg-blue-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </Card>

          <Card className="p-4 bg-white/50 dark:bg-gray-800/50">
            <div className="text-sm text-muted-foreground">Quick Add</div>
            <div className="mt-2 flex gap-2">
              {[250, 500, 750].map((ml) => (
                <Button
                  key={ml}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAmount(ml.toString());
                    addWaterIntake();
                  }}
                >
                  {ml}ml
                </Button>
              ))}
            </div>
          </Card>

          <Card className="p-4 bg-white/50 dark:bg-gray-800/50">
            <div className="text-sm text-muted-foreground">Custom Amount</div>
            <div className="mt-2 flex gap-2">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-24"
                min="0"
                step="50"
              />
              <Button onClick={addWaterIntake}>
                <Plus className="size-4 mr-2" />
                Add
              </Button>
            </div>
          </Card>
        </div>

        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#3b82f6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          <Label>Recent Logs</Label>
          <div className="space-y-2">
            {waterLogs.slice(0, 5).map((log) => (
              <Card key={log.id} className="p-3 bg-white/50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplet className="size-4 text-blue-500" />
                    <span className="font-medium">{log.amount_ml}ml</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="size-4" />
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                {log.notes && (
                  <p className="mt-1 text-sm text-muted-foreground">{log.notes}</p>
                )}
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
