import React, { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Slider,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Badge,
} from "../ui/index";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Cigarette,
  Wind,
  Coffee,
  Clock,
  Brain,
  Calendar,
  Plus,
  BarChart2,
  Save,
  X,
  MapPin,
  Loader2,
  Flame,
  ThumbsUp,
} from "lucide-react";
import { toast } from "sonner";
import { 
  NicotineLog, 
  logNicotineConsumption, 
  getNicotineConsumptionLogs 
} from "../../api/nicotineTracking";
import { useSession } from "@supabase/auth-helpers-react";

const productTypes = [
  {
    value: "cigarettes",
    label: "Cigarettes",
    icon: <Cigarette className="h-4 w-4" />,
    color: "rgb(225, 113, 113)",
    defaultUnit: "cigarettes",
  },
  {
    value: "vape",
    label: "Vape/E-cigarette",
    icon: <Wind className="h-4 w-4" />,
    color: "rgb(100, 173, 186)",
    defaultUnit: "puffs",
  },
  {
    value: "nicotine_gum",
    label: "Nicotine Gum",
    icon: <Coffee className="h-4 w-4" />,
    color: "rgb(142, 196, 137)",
    defaultUnit: "pieces",
  },
  {
    value: "nicotine_patch",
    label: "Nicotine Patch",
    icon: <Coffee className="h-4 w-4" />,
    color: "rgb(186, 153, 218)",
    defaultUnit: "patches",
  },
];

const triggerOptions = [
  { value: "stress", label: "Stress" },
  { value: "boredom", label: "Boredom" },
  { value: "social", label: "Social Situation" },
  { value: "after_meal", label: "After Eating" },
  { value: "habit", label: "Habit/Routine" },
  { value: "withdrawal", label: "Withdrawal Symptoms" },
  { value: "focus", label: "To Focus Better" },
  { value: "concentration", label: "Concentration" },
  { value: "work_pressure", label: "Work Pressure" },
  { value: "other", label: "Other" },
];

const moodOptions = [
  { value: "stressed", label: "Stressed" },
  { value: "anxious", label: "Anxious" },
  { value: "bored", label: "Bored" },
  { value: "relaxed", label: "Relaxed" },
  { value: "happy", label: "Happy" },
  { value: "sad", label: "Sad" },
  { value: "irritated", label: "Irritated" },
  { value: "focused", label: "Focused" },
  { value: "distracted", label: "Distracted" },
  { value: "tired", label: "Tired" },
];

const locationOptions = [
  { value: "home", label: "Home" },
  { value: "work", label: "Work" },
  { value: "car", label: "Car" },
  { value: "outside", label: "Outside" },
  { value: "social_venue", label: "Social Venue" },
  { value: "office", label: "Office" },
  { value: "desk", label: "At Desk" },
  { value: "meeting", label: "Meeting" },
  { value: "other", label: "Other" },
];

interface NicotineConsumptionTrackerProps {
  onDataUpdated?: () => void;
}

export function NicotineConsumptionTracker({ onDataUpdated }: NicotineConsumptionTrackerProps) {
  const session = useSession();
  const [activeTab, setActiveTab] = useState<string>("log");
  const [logs, setLogs] = useState<NicotineLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [chartsTimeframe, setChartsTimeframe] = useState<string>("7days");
  
  // Form state
  const [formData, setFormData] = useState<Partial<NicotineLog>>({
    product_type: "cigarettes",
    quantity: 1,
    unit: "cigarettes",
    consumption_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    location: "home",
    trigger: "habit",
    mood: "relaxed",
    intensity: 5,
    notes: "",
  });
  
  // Load logs on mount and when timeframe changes
  useEffect(() => {
    loadLogs();
  }, [session, chartsTimeframe]);
  
  const loadLogs = async () => {
    if (!session) return;
    
    setLoading(true);
    try {
      const data = await getNicotineConsumptionLogs(session, chartsTimeframe);
      setLogs(data);
    } catch (error) {
      console.error("Error loading nicotine logs:", error);
      toast.error("Failed to load consumption history");
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Update unit if product type changes
    if (field === "product_type") {
      const productType = productTypes.find(p => p.value === value);
      if (productType) {
        setFormData(prev => ({
          ...prev,
          unit: productType.defaultUnit
        }));
      }
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error("You must be logged in to log consumption");
      return;
    }
    
    if (!formData.product_type || !formData.quantity || !formData.consumption_date) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setLoading(true);
    try {
      await logNicotineConsumption(session, formData as NicotineLog);
      toast.success("Consumption logged successfully");
      
      // Reset form
      setFormData({
        product_type: "cigarettes",
        quantity: 1,
        unit: "cigarettes",
        consumption_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        location: "home",
        trigger: "habit",
        mood: "relaxed",
        intensity: 5,
        notes: "",
      });
      
      // Reload logs
      loadLogs();
      
      // Notify parent component if callback provided
      if (onDataUpdated) {
        onDataUpdated();
      }
      
    } catch (error) {
      console.error("Error logging consumption:", error);
      toast.error("Failed to log consumption");
    } finally {
      setLoading(false);
    }
  };
  
  const prepareDailyConsumptionData = () => {
    // Group logs by date and sum quantities
    const dailyData: Record<string, number> = {};
    
    logs.forEach(log => {
      const date = log.consumption_date.split('T')[0];
      const quantity = log.quantity || 0;
      
      if (dailyData[date]) {
        dailyData[date] += quantity;
      } else {
        dailyData[date] = quantity;
      }
    });
    
    // Convert to array for chart
    return Object.entries(dailyData).map(([date, value]) => ({
      date,
      value,
    })).sort((a, b) => a.date.localeCompare(b.date));
  };
  
  const prepareProductTypeData = () => {
    // Group logs by product type and sum quantities
    const productData: Record<string, number> = {};
    
    logs.forEach(log => {
      const productType = log.product_type;
      const quantity = log.quantity || 0;
      
      if (productData[productType]) {
        productData[productType] += quantity;
      } else {
        productData[productType] = quantity;
      }
    });
    
    // Convert to array for chart
    return Object.entries(productData).map(([name, value]) => ({
      name,
      value,
      color: productTypes.find(p => p.value === name)?.color || "#888",
    }));
  };
  
  const prepareTriggerData = () => {
    // Group logs by trigger and count
    const triggerData: Record<string, number> = {};
    
    logs.forEach(log => {
      const trigger = log.trigger || 'unknown';
      
      if (triggerData[trigger]) {
        triggerData[trigger] += 1;
      } else {
        triggerData[trigger] = 1;
      }
    });
    
    // Convert to array for chart
    return Object.entries(triggerData).map(([name, value]) => ({
      name,
      value,
    }));
  };
  
  const getRemainingFocusTime = () => {
    // Calculate estimated remaining focus time based on recent consumption
    // This is a simplified model that could be enhanced with real data
    const recentLogs = logs.slice(0, 10);
    let estimatedMinutes = 240; // Default 4 hours of focus time
    
    recentLogs.forEach(log => {
      const hoursAgo = (new Date().getTime() - new Date(log.consumption_date).getTime()) / (1000 * 60 * 60);
      
      if (hoursAgo < 4) {
        // Recent consumption affects focus time
        if (log.product_type === "cigarettes") {
          estimatedMinutes -= Math.max(0, (4 - hoursAgo) * 15 * log.quantity);
        } else if (log.product_type === "vape") {
          estimatedMinutes -= Math.max(0, (4 - hoursAgo) * 10 * log.quantity);
        } else {
          estimatedMinutes -= Math.max(0, (4 - hoursAgo) * 5 * log.quantity);
        }
      }
    });
    
    return Math.max(0, Math.round(estimatedMinutes));
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-emerald-800 dark:text-emerald-400">Nicotine Consumption Tracker</CardTitle>
        <CardDescription>
          Track your nicotine consumption and understand its impact on your focus
        </CardDescription>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="log" className="flex-1">
              <Plus className="mr-2 h-4 w-4" />
              Log Consumption
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex-1">
              <BarChart2 className="mr-2 h-4 w-4" />
              Insights
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent>
        <TabsContent value="log" className="mt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-type">Product Type</Label>
                <Select 
                  value={formData.product_type} 
                  onValueChange={(value) => handleInputChange("product_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {productTypes.map((product) => (
                      <SelectItem key={product.value} value={product.value}>
                        <div className="flex items-center">
                          {product.icon}
                          <span className="ml-2">{product.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <div className="flex gap-2">
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange("quantity", parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="inline-flex items-center px-3 rounded-md border border-input bg-background">
                    {formData.unit}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="consumption-date">Date & Time</Label>
                <div className="relative">
                  <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="consumption-date"
                    type="datetime-local"
                    value={formData.consumption_date}
                    onChange={(e) => handleInputChange("consumption_date", e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select 
                  value={formData.location} 
                  onValueChange={(value) => handleInputChange("location", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationOptions.map((location) => (
                      <SelectItem key={location.value} value={location.value}>
                        {location.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="trigger">Trigger/Reason</Label>
                <Select 
                  value={formData.trigger} 
                  onValueChange={(value) => handleInputChange("trigger", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="What triggered consumption?" />
                  </SelectTrigger>
                  <SelectContent>
                    {triggerOptions.map((trigger) => (
                      <SelectItem key={trigger.value} value={trigger.value}>
                        {trigger.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mood">Mood</Label>
                <Select 
                  value={formData.mood} 
                  onValueChange={(value) => handleInputChange("mood", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="How were you feeling?" />
                  </SelectTrigger>
                  <SelectContent>
                    {moodOptions.map((mood) => (
                      <SelectItem key={mood.value} value={mood.value}>
                        {mood.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 col-span-1 md:col-span-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="intensity">Craving Intensity</Label>
                  <span className="text-sm text-muted-foreground">{formData.intensity}/10</span>
                </div>
                <Slider
                  id="intensity"
                  min={1}
                  max={10}
                  step={1}
                  value={[formData.intensity || 5]}
                  onValueChange={(value) => handleInputChange("intensity", value[0])}
                />
              </div>
              
              <div className="space-y-2 col-span-1 md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes about this consumption event..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormData({
                  product_type: "cigarettes",
                  quantity: 1,
                  unit: "cigarettes",
                  consumption_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
                  location: "home",
                  trigger: "habit",
                  mood: "relaxed",
                  intensity: 5,
                  notes: "",
                })}
              >
                <X className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Log Consumption
                  </>
                )}
              </Button>
            </div>
          </form>
          
          <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-100 dark:border-emerald-900">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-slate-800 rounded-full">
                <Brain className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h4 className="font-medium">Estimated Focus Impact</h4>
                <p className="text-sm text-muted-foreground">
                  Based on your consumption patterns, you have approximately {getRemainingFocusTime()} minutes of optimal focus time remaining today.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="insights" className="mt-0 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Consumption Patterns</h3>
            <Select 
              value={chartsTimeframe} 
              onValueChange={setChartsTimeframe}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Daily Consumption</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prepareDailyConsumptionData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#1e9981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">By Product Type</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={prepareProductTypeData()}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name }) => name}
                      >
                        {prepareProductTypeData().map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Common Triggers</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      layout="vertical" 
                      data={prepareTriggerData()}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" />
                      <Tooltip />
                      <Bar dataKey="value" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Focus Impact</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <div className="text-center">
                    <h4 className="text-lg font-medium">Estimated Focus Reduction</h4>
                    <p className="text-3xl font-bold text-red-500">
                      {Math.min(logs.length * 5, 40)}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Based on your consumption in the selected period
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-100 dark:border-amber-900 text-center">
                      <p className="text-sm font-medium">Recovery Time</p>
                      <p className="text-xl font-semibold text-amber-600">~{logs.length > 0 ? Math.ceil(logs.length * 2) : 0} hours</p>
                    </div>
                    
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-100 dark:border-emerald-900 text-center">
                      <p className="text-sm font-medium">Average per Day</p>
                      <p className="text-xl font-semibold text-emerald-600">
                        {logs.length > 0 ? (logs.reduce((acc, log) => acc + log.quantity, 0) / (parseInt(chartsTimeframe.replace("days", "") || "30") || 30)).toFixed(1) : 0}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Focus Optimization Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-100 dark:border-blue-900">
                  <div className="flex gap-3">
                    <ThumbsUp className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Timing Matters</p>
                      <p className="text-sm text-muted-foreground">Schedule nicotine consumption at least 1 hour before focus sessions to minimize direct cognitive effects.</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-lg border border-purple-100 dark:border-purple-900">
                  <div className="flex gap-3">
                    <Flame className="h-5 w-5 text-purple-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Craving Management</p>
                      <p className="text-sm text-muted-foreground">When cravings hit during focus time, try taking a 2-minute deep breathing break instead of reaching for nicotine.</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-100 dark:border-emerald-900">
                  <div className="flex gap-3">
                    <Brain className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Cognitive Recovery</p>
                      <p className="text-sm text-muted-foreground">Your focus metrics show potential for 25% improvement by reducing nicotine consumption by half.</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </CardContent>
    </Card>
  );
} 