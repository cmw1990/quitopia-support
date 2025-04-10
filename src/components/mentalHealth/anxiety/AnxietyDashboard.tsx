import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { mentalHealthDb } from "@/lib/mental-health-db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MultiSelect } from "@/components/ui/multi-select";
import { BarChart, Bar } from 'recharts';

const PHYSICAL_SYMPTOMS = [
  'Racing Heart',
  'Sweating',
  'Trembling',
  'Shortness of Breath',
  'Chest Pain',
  'Nausea',
  'Dizziness',
  'Numbness',
  'Chills/Hot Flashes',
  'Muscle Tension'
];

const COPING_STRATEGIES = [
  'Deep Breathing',
  'Progressive Relaxation',
  'Mindfulness',
  'Exercise',
  'Talking to Someone',
  'Journaling',
  'Grounding Techniques',
  'Positive Self-Talk',
  'Time in Nature',
  'Creative Activities'
];

export function AnxietyDashboard() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [anxietyLevel, setAnxietyLevel] = useState(5);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]);
  const [thoughts, setThoughts] = useState('');

  // Get anxiety analytics
  const { data: anxietyAnalytics } = useQuery({
    queryKey: ['anxiety-analytics'],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const { data, error } = await mentalHealthDb.getAnxietyAnalytics(startDate, new Date());
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  const saveAnxietyEntry = async () => {
    if (!session?.user?.id) return;

    try {
      await mentalHealthDb.createAnxietyEntry({
        timestamp: new Date(),
        anxiety_level: anxietyLevel,
        physical_symptoms: selectedSymptoms,
        thoughts: thoughts ? [thoughts] : undefined,
        coping_strategies: selectedStrategies
      });

      toast({
        title: "Success",
        description: "Anxiety entry saved successfully",
      });

      // Reset form
      setAnxietyLevel(5);
      setSelectedSymptoms([]);
      setSelectedStrategies([]);
      setThoughts('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save anxiety entry",
        variant: "destructive"
      });
    }
  };

  // Transform analytics data for visualization
  const symptomChartData = anxietyAnalytics?.commonSymptoms
    ? Object.entries(anxietyAnalytics.commonSymptoms)
        .map(([symptom, count]) => ({
          name: symptom,
          count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    : [];

  const strategyChartData = anxietyAnalytics?.effectiveStrategies
    ? Object.entries(anxietyAnalytics.effectiveStrategies)
        .map(([strategy, count]) => ({
          name: strategy,
          count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Track Your Anxiety</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Anxiety Level (1-10)</label>
            <Slider
              value={[anxietyLevel]}
              onValueChange={([value]) => setAnxietyLevel(value)}
              max={10}
              min={1}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Physical Symptoms</label>
            <MultiSelect
              options={PHYSICAL_SYMPTOMS.map(s => ({ label: s, value: s }))}
              value={selectedSymptoms}
              onChange={setSelectedSymptoms}
              placeholder="Select symptoms..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Coping Strategies</label>
            <MultiSelect
              options={COPING_STRATEGIES.map(s => ({ label: s, value: s }))}
              value={selectedStrategies}
              onChange={setSelectedStrategies}
              placeholder="Select strategies..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Thoughts</label>
            <textarea
              className="w-full min-h-[100px] p-2 border rounded-md"
              value={thoughts}
              onChange={(e) => setThoughts(e.target.value)}
              placeholder="What thoughts are going through your mind?"
            />
          </div>

          <Button onClick={saveAnxietyEntry} className="w-full">
            Save Anxiety Entry
          </Button>
        </CardContent>
      </Card>

      {anxietyAnalytics && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Anxiety Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={anxietyAnalytics.anxietyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="level" stroke="#e11d48" name="Anxiety Level" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Common Symptoms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={symptomChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#f43f5e" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Most Used Strategies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={strategyChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
