import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { mentalHealthDb } from "@/lib/mental-health-db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Users, Heart, Shield, Battery } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const INTERACTION_TYPES = [
  'In-person Meeting',
  'Video Call',
  'Phone Call',
  'Text/Message',
  'Group Activity',
  'Work Interaction',
  'Family Time',
  'Social Media',
  'Community Event',
  'Support Group'
];

export function SocialConnections() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());
  const [interactionType, setInteractionType] = useState<string>(INTERACTION_TYPES[0]);
  const [connectionQuality, setConnectionQuality] = useState<number>(5);
  const [energyImpact, setEnergyImpact] = useState<number>(0);
  const [boundaryNotes, setBoundaryNotes] = useState('');
  const [supportReceived, setSupportReceived] = useState(false);
  const [supportProvided, setSupportProvided] = useState(false);
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState('log');

  // Get social connections
  const { data: connections, refetch } = useQuery({
    queryKey: ['social-connections'],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const { data, error } = await mentalHealthDb.getSocialConnections(startDate);
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  const handleSubmit = async () => {
    if (!session?.user?.id) return;

    try {
      await mentalHealthDb.createSocialConnection({
        date,
        interaction_type: interactionType,
        connection_quality: connectionQuality,
        energy_impact: energyImpact,
        boundary_notes: boundaryNotes || undefined,
        support_received: supportReceived,
        support_provided: supportProvided,
        notes: notes || undefined
      });

      toast({
        title: "Success",
        description: "Social interaction logged successfully",
      });

      // Reset form
      setInteractionType(INTERACTION_TYPES[0]);
      setConnectionQuality(5);
      setEnergyImpact(0);
      setBoundaryNotes('');
      setSupportReceived(false);
      setSupportProvided(false);
      setNotes('');

      // Refresh data
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log social interaction",
        variant: "destructive"
      });
    }
  };

  // Transform data for visualization
  const connectionData = connections?.map(conn => ({
    date: format(new Date(conn.date), 'MMM dd'),
    quality: conn.connection_quality,
    energy: conn.energy_impact
  }));

  const interactionTypeData = connections?.reduce((acc: any[], conn) => {
    const existing = acc.find(item => item.type === conn.interaction_type);
    if (existing) {
      existing.count++;
      existing.totalQuality += conn.connection_quality;
      existing.totalEnergy += conn.energy_impact;
    } else {
      acc.push({
        type: conn.interaction_type,
        count: 1,
        totalQuality: conn.connection_quality,
        totalEnergy: conn.energy_impact
      });
    }
    return acc;
  }, []).map(item => ({
    ...item,
    avgQuality: item.totalQuality / item.count,
    avgEnergy: item.totalEnergy / item.count
  }));

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-[400px]">
          <TabsTrigger value="log" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Log Interaction
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Battery className="h-4 w-4" />
            Energy Impact
          </TabsTrigger>
        </TabsList>

        <TabsContent value="log">
          <Card>
            <CardHeader>
              <CardTitle>Log Social Interaction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(date, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => date && setDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Interaction Type</label>
                <Select value={interactionType} onValueChange={setInteractionType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INTERACTION_TYPES.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Connection Quality (1-10)</label>
                <Select
                  value={connectionQuality.toString()}
                  onValueChange={(value) => setConnectionQuality(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 10}, (_, i) => i + 1).map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Energy Impact (-10 to +10)</label>
                <Select
                  value={energyImpact.toString()}
                  onValueChange={(value) => setEnergyImpact(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 21}, (_, i) => i - 10).map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num > 0 ? `+${num}` : num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Boundary Notes</label>
                <textarea
                  className="w-full min-h-[100px] p-2 border rounded-md"
                  value={boundaryNotes}
                  onChange={(e) => setBoundaryNotes(e.target.value)}
                  placeholder="Any boundary challenges or successes?"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={supportReceived}
                    onChange={(e) => setSupportReceived(e.target.checked)}
                    className="rounded"
                  />
                  <label>Support Received</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={supportProvided}
                    onChange={(e) => setSupportProvided(e.target.checked)}
                    className="rounded"
                  />
                  <label>Support Provided</label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <textarea
                  className="w-full min-h-[100px] p-2 border rounded-md"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes about this interaction?"
                />
              </div>

              <Button onClick={handleSubmit} className="w-full">
                Log Interaction
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Connection Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={connectionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" domain={[0, 10]} />
                    <YAxis yAxisId="right" orientation="right" domain={[-10, 10]} />
                    <Tooltip />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="quality"
                      stroke="#8884d8"
                      name="Connection Quality"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="energy"
                      stroke="#82ca9d"
                      name="Energy Impact"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle>Interaction Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={interactionTypeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" name="Number of Interactions" />
                    <Bar dataKey="avgQuality" fill="#82ca9d" name="Avg Quality" />
                    <Bar dataKey="avgEnergy" fill="#ffc658" name="Avg Energy Impact" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
