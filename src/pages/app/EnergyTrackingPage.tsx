import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from '../../components/ui/toast';
import { useAuth } from '../../contexts/AuthContext';
import { EnergyTrackingService, EnergyEntry } from '../../services/energy-tracking-service';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ENERGY_FACTORS = [
  'Sleep', 
  'Exercise', 
  'Diet', 
  'Work Stress', 
  'Personal Stress', 
  'Meditation', 
  'Social Interaction', 
  'Screen Time'
];

const EnergyTrackingPage: React.FC = () => {
  const { user } = useAuth();
  const [energyLevel, setEnergyLevel] = useState(5);
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [energyEntries, setEnergyEntries] = useState<EnergyEntry[]>([]);
  const [trends, setTrends] = useState<{
    averageEnergyLevel: number;
    dailyTrends: Array<{ date: string, averageEnergy: number }>;
    factorImpact: Array<{ factor: string, averageImpact: number }>;
  }>({
    averageEnergyLevel: 0,
    dailyTrends: [],
    factorImpact: []
  });
  const [recommendations, setRecommendations] = useState<string[]>([]);

  // Fetch energy entries and trends
  useEffect(() => {
    const fetchEnergyData = async () => {
      if (!user) return;

      const entries = await EnergyTrackingService.getUserEnergyEntries(user.id, { limit: 30 });
      setEnergyEntries(entries);

      const trendData = await EnergyTrackingService.getEnergyTrends(user.id);
      setTrends(trendData);

      const userRecommendations = await EnergyTrackingService.getEnergyRecommendations(user.id);
      setRecommendations(userRecommendations);
    };

    fetchEnergyData();
  }, [user]);

  // Log energy level
  const handleLogEnergyLevel = async () => {
    if (!user) return;

    try {
      const entry = await EnergyTrackingService.logEnergyLevel({
        userId: user.id,
        energyLevel,
        notes: notes || undefined,
        factors: selectedFactors.length > 0 ? selectedFactors : undefined
      });

      if (entry) {
        toast({
          title: 'Energy Level Logged',
          description: 'Your energy level has been recorded successfully.',
          variant: 'success'
        });

        // Refresh data
        const entries = await EnergyTrackingService.getUserEnergyEntries(user.id, { limit: 30 });
        setEnergyEntries(entries);

        const trendData = await EnergyTrackingService.getEnergyTrends(user.id);
        setTrends(trendData);

        const userRecommendations = await EnergyTrackingService.getEnergyRecommendations(user.id);
        setRecommendations(userRecommendations);

        // Reset form
        setEnergyLevel(5);
        setSelectedFactors([]);
        setNotes('');
      }
    } catch (error) {
      toast({
        title: 'Logging Failed',
        description: 'Could not log energy level. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    return trends.dailyTrends.map(trend => ({
      date: new Date(trend.date).toLocaleDateString(),
      energy: trend.averageEnergy
    })).reverse();
  }, [trends.dailyTrends]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Energy Logging */}
        <Card>
          <CardHeader>
            <CardTitle>Log Energy Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Energy Level: {energyLevel}
                </label>
                <Input
                  type="range"
                  min={1}
                  max={10}
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <Select 
                value=""
                onValueChange={(factor) => {
                  if (factor && !selectedFactors.includes(factor)) {
                    setSelectedFactors(prev => [...prev, factor]);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Factors Affecting Energy" />
                </SelectTrigger>
                <SelectContent>
                  {ENERGY_FACTORS.filter(f => !selectedFactors.includes(f)).map(factor => (
                    <SelectItem key={factor} value={factor}>{factor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-2">
                {selectedFactors.map(factor => (
                  <div 
                    key={factor} 
                    className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm flex items-center"
                  >
                    {factor}
                    <button 
                      onClick={() => setSelectedFactors(prev => prev.filter(f => f !== factor))}
                      className="ml-2 text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <Input
                placeholder="Additional Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <Button onClick={handleLogEnergyLevel} className="w-full">
                Log Energy Level
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Energy Trends */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Energy Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="energy" 
                    stroke="#10B981" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Avg Energy Level</p>
                <p className="text-2xl font-bold">
                  {trends.averageEnergyLevel.toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Top Factors</p>
                <div className="space-y-1 mt-2">
                  {trends.factorImpact.slice(0, 3).map(factor => (
                    <p key={factor.factor} className="text-sm">
                      {factor.factor}: {factor.averageImpact.toFixed(1)}
                    </p>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Recommendations</p>
                <div className="space-y-1 mt-2">
                  {recommendations.slice(0, 3).map((rec, index) => (
                    <p key={index} className="text-sm text-primary">
                      • {rec}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Entries */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Energy Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {energyEntries.slice(0, 5).map(entry => (
                <div 
                  key={entry.id} 
                  className="flex justify-between items-center border-b pb-2 last:border-b-0"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      Energy: {entry.energyLevel}/10
                    </p>
                  </div>
                  {entry.factors && (
                    <div className="flex space-x-1">
                      {entry.factors.slice(0, 2).map(factor => (
                        <span 
                          key={factor} 
                          className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                        >
                          {factor}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnergyTrackingPage;