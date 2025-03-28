import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { format } from 'date-fns';
// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Textarea } from './ui/textarea';
import { Calendar } from './ui/calendar';
import { Badge } from "./ui/badge";
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';
import { 
  NicotineConsumptionLog, 
  NicotineProduct,
  addConsumptionLog, 
  getConsumptionLogs, 
  getAllProducts 
} from "../api/apiCompatibility";

interface SimpleLoggerProps {
  session: Session | null;
}

const PRODUCT_TYPES = [
  'cigarettes',
  'vape',
  'nicotine_pouches',
  'nicotine_gum',
  'cigars'
];

// Common triggers for nicotine consumption
const COMMON_TRIGGERS = [
  'Stress',
  'After meal',
  'Social situation',
  'Boredom',
  'With alcohol',
  'Work break',
  'Morning routine',
  'Emotional distress'
];

// Common locations for consumption
const COMMON_LOCATIONS = [
  'Home',
  'Work',
  'Car',
  'Bar/Restaurant',
  'Friend\'s place',
  'Outdoors',
  'Public space'
];

export const SimpleLogger: React.FC<SimpleLoggerProps> = ({ session }) => {
  const [activeTab, setActiveTab] = useState('log');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));
  const [productType, setProductType] = useState('cigarettes');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [trigger, setTrigger] = useState('');
  const [location, setLocation] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<NicotineConsumptionLog[]>([]);
  const [products, setProducts] = useState<NicotineProduct[]>([]);

  useEffect(() => {
    if (session && activeTab === 'history') {
      loadLogs();
    }
  }, [session, activeTab]);

  useEffect(() => {
    if (session) {
      loadProducts();
    }
  }, [session]);

  const loadLogs = async () => {
    if (!session) return;
    
    setIsLoading(true);
    try {
      // Get logs for the last 30 days
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      const todayStr = format(today, 'yyyy-MM-dd');
      const thirtyDaysAgoStr = format(thirtyDaysAgo, 'yyyy-MM-dd');
      
      const fetchedLogs = await getConsumptionLogs(
        session.user.id,
        thirtyDaysAgoStr,
        todayStr,
        session
      );
      setLogs(fetchedLogs);
    } catch (error) {
      console.error('Failed to load logs:', error);
      toast.error('Failed to load consumption logs');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    if (!session) return;
    
    try {
      const fetchedProducts = await getAllProducts(undefined, session);
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const handleSubmit = async () => {
    if (!session) {
      toast.error('You must be logged in to log consumption');
      return;
    }

    setIsSubmitting(true);
    try {
      // Combine date and time
      const [hours, minutes] = time.split(':').map(Number);
      const dateTime = new Date(selectedDate);
      dateTime.setHours(hours, minutes);
      
      const formattedDate = format(dateTime, 'yyyy-MM-dd');
      
      const logData: Omit<NicotineConsumptionLog, 'id' | 'created_at' | 'updated_at'> = {
        user_id: session.user.id,
        consumption_date: formattedDate,
        product_type: productType,
        quantity: quantity,
        unit: 'count',
        intensity: intensity,
        notes: notes,
        trigger: trigger || undefined,
        location: location || undefined
      };

      await addConsumptionLog(logData, session);
      toast.success('Consumption logged successfully');
      
      // Reset form
      setSelectedDate(new Date());
      setTime(format(new Date(), 'HH:mm'));
      setQuantity(1);
      setNotes('');
      setIntensity(5);
      setTrigger('');
      setLocation('');
      
      // Refresh logs if on history tab
      if (activeTab === 'history') {
        loadLogs();
      }
      
    } catch (error) {
      console.error('Failed to add log:', error);
      toast.error('Failed to save consumption log');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="log">Log Consumption</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="log" className="space-y-6">
          {/* Date Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Date and Time</CardTitle>
              <CardDescription>When did this consumption occur?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                  initialFocus
                />
                <div className="flex items-center space-x-2">
                  <Label>Time:</Label>
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-32"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Product Selection</CardTitle>
              <CardDescription>What nicotine product did you use?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Label>Product Category:</Label>
                <Select 
                  value={productType} 
                  onValueChange={setProductType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.length > 0 ? (
                      [...new Set(products.map(p => p.category))].map(category => (
                        <SelectItem key={category} value={category}>
                          {category.replace('_', ' ').replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())}
                        </SelectItem>
                      ))
                    ) : (
                      PRODUCT_TYPES.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.replace('_', ' ').replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col space-y-2">
                <Label>Quantity:</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-20 text-center"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Context Information */}
          <Card>
            <CardHeader>
              <CardTitle>Context Information</CardTitle>
              <CardDescription>What triggered this consumption?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Label>Trigger:</Label>
                <Select
                  value={trigger}
                  onValueChange={setTrigger}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="What triggered you to use?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None specified</SelectItem>
                    {COMMON_TRIGGERS.map(trigger => (
                      <SelectItem key={trigger} value={trigger}>{trigger}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col space-y-2">
                <Label>Location:</Label>
                <Select
                  value={location}
                  onValueChange={setLocation}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Where were you?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None specified</SelectItem>
                    {COMMON_LOCATIONS.map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>Details about your consumption</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between">
                  <Label>Craving Intensity:</Label>
                  <span className="text-sm text-muted-foreground">{intensity}/10</span>
                </div>
                <Slider
                  value={[intensity]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(vals: number[]) => setIntensity(vals[0])}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <Label>Notes:</Label>
                <Textarea
                  placeholder="Any additional details about this consumption..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Log
                </>
              )}
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Consumption History</CardTitle>
              <CardDescription>Your recent consumption logs</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : logs.length > 0 ? (
                <div className="space-y-4">
                  {logs.slice(0, 20).map((log) => (
                    <div key={log.id} className="border rounded-lg p-4 transition-colors hover:bg-muted/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">
                            {format(new Date(log.consumption_date), 'MMMM d, yyyy')}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {log.quantity} x {log.product_type?.replace('_', ' ')}
                            {log.trigger && <span> • Trigger: {log.trigger}</span>}
                            {log.location && <span> • Location: {log.location}</span>}
                          </p>
                          {log.notes && <p className="mt-2 text-sm">{log.notes}</p>}
                        </div>
                        <Badge variant="outline">Intensity: {log.intensity || 0}/10</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No logs found. Start tracking your consumption.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SimpleLogger; 