import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';
// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Textarea } from './ui/textarea';
import { Calendar } from './ui/calendar';
import { toast } from 'sonner';
import { AlertCircle, Save, ChevronDown, RefreshCw, Calendar as CalendarIcon, Plus, X } from 'lucide-react';
import { Badge } from "./ui/badge";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';

// API imports
import {
  NicotineConsumptionLog,
  NicotineProduct,
  addConsumptionLog,
  getConsumptionLogs,
  getAllProducts,
  syncHealthData,
  supabaseRestCall
} from "../api/apiCompatibility";

// Import mapper utilities
import { ensureProductsCompatibility } from '../lib/mappers';

// Import the TriggerAnalysis component
import TriggerAnalysis from './TriggerAnalysis';

interface ConsumptionLoggerProps {
  session: Session | null;
}

// Common triggers for nicotine consumption
const COMMON_TRIGGERS = [
  'Stress',
  'After meal',
  'Social situation',
  'Boredom',
  'With alcohol',
  'While driving',
  'Work break',
  'Morning routine',
  'Emotional distress',
  'Celebration',
  'Custom'
];

// Common locations for consumption
const COMMON_LOCATIONS = [
  'Home',
  'Work',
  'Car',
  'Bar/Restaurant',
  'Friend\'s place',
  'Outdoors',
  'Public space',
  'Bathroom',
  'Custom'
];

// Different moods to track
const MOOD_OPTIONS = [
  'Happy',
  'Neutral',
  'Sad',
  'Anxious',
  'Bored',
  'Angry',
  'Stressed',
  'Relaxed',
  'Tired',
  'Energetic'
];

// Product categories
const PRODUCT_CATEGORIES = [
  'cigarettes',
  'vape',
  'nicotine_pouches',
  'nicotine_gum',
  'cigars',
  'pipe_tobacco',
  'smokeless_tobacco',
  'heated_tobacco',
  'other'
];

// Extend NicotineProduct type for better type safety
type ExtendedNicotineProduct = NicotineProduct & {
  category: string;
  type?: string;
  price?: number;
  created_at?: string;
  updated_at?: string;
};

export const ConsumptionLogger: React.FC<ConsumptionLoggerProps> = ({ session }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('log');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));
  const [productType, setProductType] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('');
  const [trigger, setTrigger] = useState('');
  const [customTrigger, setCustomTrigger] = useState('');
  const [location, setLocation] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [mood, setMood] = useState('neutral');
  const [intensity, setIntensity] = useState(5);
  const [notes, setNotes] = useState('');
  const [logs, setLogs] = useState<NicotineConsumptionLog[]>([]);
  const [editingLog, setEditingLog] = useState<NicotineConsumptionLog | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterDate, setFilterDate] = useState<Date | undefined>(new Date());

  // Health metrics state
  const [stepCount, setStepCount] = useState<number | null>(null);
  const [sleepHours, setSleepHours] = useState<number | null>(null);
  const [stressLevel, setStressLevel] = useState<number>(5);

  // Product selection state - update type to include extended properties
  const [selectedProduct, setSelectedProduct] = useState<ExtendedNicotineProduct | null>(null);
  const [productsList, setProductsList] = useState<ExtendedNicotineProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ExtendedNicotineProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  
  // Calendar UI state
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Add state variables for tabs
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showProductDialog, setShowProductDialog] = useState(false);

  // Load initial data
  useEffect(() => {
    if (session?.user) {
      loadConsumptionLogs();
      loadProducts();
    } else {
      navigate('/login');
    }
  }, [session, navigate]);

  // Filter products when category changes
  useEffect(() => {
    if (productsList.length > 0) {
      let filtered = productsList;
      
      if (categoryFilter) {
        filtered = filtered.filter(product => product.category === categoryFilter);
      }
      
      if (searchTerm) {
        const lowercaseSearch = searchTerm.toLowerCase();
        filtered = filtered.filter(product => 
          product.name.toLowerCase().includes(lowercaseSearch) ||
          product.brand.toLowerCase().includes(lowercaseSearch)
        );
      }
      
      setFilteredProducts(filtered);
      
      // Auto-select the first product if none is selected
      if (!selectedProduct && filtered.length > 0) {
        setSelectedProduct(filtered[0]);
        setProductType(filtered[0].category);
        
        // Set appropriate unit based on product category
        switch (filtered[0].category) {
          case 'cigarettes':
          case 'cigars':
            setUnit('sticks');
            break;
          case 'vape':
            setUnit('puffs');
            break;
          case 'nicotine_pouches':
          case 'nicotine_gum':
            setUnit('pieces');
            break;
          case 'pipe_tobacco':
          case 'smokeless_tobacco':
            setUnit('grams');
            break;
          default:
            setUnit('units');
        }
      }
    }
  }, [categoryFilter, searchTerm, productsList, selectedProduct]);

  const loadConsumptionLogs = async () => {
    if (!session?.user?.id) return;

    try {
      setIsLoadingLogs(true);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // Last 30 days
      const logs = await getConsumptionLogs(
        session.user.id,
        startDate.toISOString(),
        new Date().toISOString(),
        session
      );
      setLogs(logs);
    } catch (error) {
      toast.error('Failed to load consumption logs');
      console.error('Error loading consumption logs:', error);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const loadProducts = async () => {
    if (!session?.user) return;
    
    try {
      setIsLoadingProducts(true);
      const products = await getAllProducts({}, session);
      
      // Use the compatibility mapper to ensure products have consistent structure
      const compatibleProducts = ensureProductsCompatibility(products);
      setProductsList(compatibleProducts as unknown as ExtendedNicotineProduct[]);
      setFilteredProducts(compatibleProducts as unknown as ExtendedNicotineProduct[]);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products. Please try again.');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleSubmit = async () => {
    if (!session?.user?.id || !selectedProduct) {
      toast.error('Please select a product');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Format date and time
      const dateTimeString = `${format(selectedDate, 'yyyy-MM-dd')}T${time}:00`;
      
      // Determine final trigger and location values
      const finalTrigger = trigger === 'Custom' ? customTrigger : trigger;
      const finalLocation = location === 'Custom' ? customLocation : location;
      
      // Create log entry
      const logEntry: Omit<NicotineConsumptionLog, 'id' | 'created_at' | 'updated_at'> = {
        user_id: session.user.id,
        consumption_date: dateTimeString,
        product_type: selectedProduct.category,
        brand: selectedProduct.brand,
        variant: selectedProduct.name,
        nicotine_strength: selectedProduct.nicotine_strength,
        quantity: quantity,
        unit: unit,
        trigger: finalTrigger,
        location: finalLocation,
        mood: mood,
        intensity: intensity,
        notes: notes
      };
      
      // Submit to API
      await addConsumptionLog(logEntry, session);
      
      // Also sync health data if provided
      if (stepCount !== null || sleepHours !== null || stressLevel !== null) {
        await syncHealthData(session.user.id, {
          step_count: stepCount || undefined,
          sleep_hours: sleepHours || undefined,
          stress_level: stressLevel
        }, session);
      }
      
      // Reset form
      setQuantity(1);
      setTrigger('');
      setCustomTrigger('');
      setLocation('');
      setCustomLocation('');
      setMood('neutral');
      setIntensity(5);
      setNotes('');
      setStepCount(null);
      setSleepHours(null);
      setStressLevel(5);
      
      // Refresh logs
      await loadConsumptionLogs();
      
      toast.success('Consumption logged successfully');
      
      // Switch to history tab
      setActiveTab('history');
    } catch (error) {
      toast.error('Failed to log consumption');
      console.error('Error logging consumption:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (logId: string) => {
    if (!session?.user?.id || !logId) return;
    
    if (!confirm('Are you sure you want to delete this log?')) return;
    
    try {
      await supabaseRestCall(
        `/rest/v1/consumption_logs8?id=eq.${logId}`,
        {
          method: 'DELETE',
          headers: {
            'Prefer': 'return=minimal'
          }
        },
        session
      );
      
      toast.success('Log deleted successfully');
      await loadConsumptionLogs();
    } catch (error) {
      toast.error('Failed to delete log');
      console.error('Error deleting log:', error);
    }
  };

  const handleEdit = (log: NicotineConsumptionLog) => {
    setEditingLog(log);
    
    // Set form values based on the log
    setSelectedDate(new Date(log.consumption_date));
    setTime(format(new Date(log.consumption_date), 'HH:mm'));
    setProductType(log.product_type);
    setCategoryFilter(log.product_type);
    
    // Find and set the selected product
    const product = productsList.find(p => 
      p.brand === log.brand && p.name === log.variant && p.category === log.product_type
    );
    setSelectedProduct(product || null);
    
    setQuantity(log.quantity);
    setUnit(log.unit);
    setTrigger(log.trigger || '');
    setLocation(log.location || '');
    setMood(log.mood || 'neutral');
    setIntensity(log.intensity || 5);
    setNotes(log.notes || '');
    
    // Switch to log tab
    setActiveTab('log');
  };
  
  const cancelEdit = () => {
    setEditingLog(null);
    
    // Reset form
    setSelectedDate(new Date());
    setTime(format(new Date(), 'HH:mm'));
    setProductType('');
    setCategoryFilter('');
    setSelectedProduct(null);
    setQuantity(1);
    setUnit('');
    setTrigger('');
    setCustomTrigger('');
    setLocation('');
    setCustomLocation('');
    setMood('neutral');
    setIntensity(5);
    setNotes('');
  };
  
  const updateLog = async () => {
    if (!session?.user?.id || !editingLog?.id || !selectedProduct) return;
    
    try {
      setIsSubmitting(true);
      
      // Format date and time
      const dateTimeString = `${format(selectedDate, 'yyyy-MM-dd')}T${time}:00`;
      
      // Determine final trigger and location values
      const finalTrigger = trigger === 'Custom' ? customTrigger : trigger;
      const finalLocation = location === 'Custom' ? customLocation : location;
      
      // Create log entry
      const logUpdates: Partial<NicotineConsumptionLog> = {
        consumption_date: dateTimeString,
        product_type: selectedProduct.category,
        brand: selectedProduct.brand,
        variant: selectedProduct.name,
        nicotine_strength: selectedProduct.nicotine_strength,
        quantity: quantity,
        unit: unit,
        trigger: finalTrigger,
        location: finalLocation,
        mood: mood,
        intensity: intensity,
        notes: notes
      };
      
      // Update via API
      await supabaseRestCall(
        `/rest/v1/consumption_logs8?id=eq.${editingLog.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(logUpdates)
        },
        session
      );
      
      toast.success('Log updated successfully');
      
      // Reset edit mode
      setEditingLog(null);
      
      // Refresh logs
      await loadConsumptionLogs();
      
      // Reset form
      cancelEdit();
    } catch (error) {
      toast.error('Failed to update log');
      console.error('Error updating log:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleProductSelect = (product: ExtendedNicotineProduct) => {
    setSelectedProduct(product);
    setProductType(product.category);
    
    // Set appropriate unit based on product category
    switch (product.category) {
      case 'cigarettes':
      case 'cigars':
        setUnit('sticks');
        break;
      case 'vape':
        setUnit('puffs');
        break;
      case 'nicotine_pouches':
      case 'nicotine_gum':
        setUnit('pieces');
        break;
      case 'pipe_tobacco':
      case 'smokeless_tobacco':
        setUnit('grams');
        break;
      default:
        setUnit('units');
    }
  };

  const formatProductName = (product: ExtendedNicotineProduct) => {
    return `${product.brand} ${product.name} (${product.nicotine_strength}mg)`;
  };
  
  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'cigarettes': return '🚬';
      case 'vape': return '💨';
      case 'nicotine_pouches': return '🧠';
      case 'nicotine_gum': return '🍬';
      case 'cigars': return '💯';
      case 'pipe_tobacco': return '🌿';
      case 'smokeless_tobacco': return '📦';
      case 'heated_tobacco': return '🔥';
      default: return '❓';
    }
  };
  
  const formatNicotineMg = (strength: number) => {
    return `${strength} mg/unit`;
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="log">Log Consumption</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="triggers">Trigger Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="log" className="space-y-6 pt-4">
          {/* Date Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Date and Time</CardTitle>
              <CardDescription>When did this consumption occur?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2">
                  <Label>Date:</Label>
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          date && setSelectedDate(date);
                          setIsCalendarOpen(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex flex-col space-y-2">
                  <Label>Time:</Label>
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
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
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col space-y-2">
                  <Label>Category:</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {PRODUCT_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {getIconForCategory(category)} {category.replace('_', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col space-y-2">
                  <Label>Search Products:</Label>
                  <Input
                    type="text"
                    placeholder="Search by name or brand..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex flex-col space-y-2">
                  <Label>Selected Product:</Label>
                  {isLoadingProducts ? (
                    <div className="flex items-center justify-center p-4">
                      <RefreshCw className="h-6 w-6 animate-spin" />
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="text-center p-4 border rounded-md">
                      <p>No products found. Try adjusting your filters.</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-60 rounded-md border">
                      <div className="p-4 grid grid-cols-1 gap-2">
                        {filteredProducts.map(product => (
                          <div
                            key={product.id}
                            className={`flex items-center p-2 rounded-md cursor-pointer ${
                              selectedProduct?.id === product.id
                                ? 'bg-primary/10 border border-primary'
                                : 'hover:bg-muted'
                            }`}
                            onClick={() => handleProductSelect(product)}
                          >
                            <div className="mr-2 p-2 rounded-full bg-muted">
                              {getIconForCategory(product.category)}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{product.brand} {product.name}</p>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <span>{formatNicotineMg(product.nicotine_strength)}</span>
                                {product.flavors && product.flavors.length > 0 && (
                                  <span className="ml-2">• {product.flavors.join(', ')}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>

                {selectedProduct && (
                  <div className="flex flex-col space-y-2">
                    <Label>Quantity:</Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
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
                        className="text-center"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        +
                      </Button>
                      <Label>{unit}</Label>
                    </div>
                  </div>
                )}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2">
                  <Label>Trigger:</Label>
                  <Select value={trigger} onValueChange={setTrigger}>
                    <SelectTrigger>
                      <SelectValue placeholder="What triggered you?" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_TRIGGERS.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {trigger === 'Custom' && (
                    <Input
                      placeholder="Enter custom trigger"
                      value={customTrigger}
                      onChange={(e) => setCustomTrigger(e.target.value)}
                    />
                  )}
                </div>

                <div className="flex flex-col space-y-2">
                  <Label>Location:</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Where were you?" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_LOCATIONS.map(loc => (
                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {location === 'Custom' && (
                    <Input
                      placeholder="Enter custom location"
                      value={customLocation}
                      onChange={(e) => setCustomLocation(e.target.value)}
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2">
                  <Label>Mood:</Label>
                  <Select value={mood} onValueChange={setMood}>
                    <SelectTrigger>
                      <SelectValue placeholder="How were you feeling?" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOOD_OPTIONS.map(m => (
                        <SelectItem key={m} value={m.toLowerCase()}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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

          {/* Health Metrics - Optional */}
          <Accordion type="single" collapsible>
            <AccordionItem value="health-metrics">
              <AccordionTrigger>Health Metrics (Optional)</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 p-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-2">
                      <Label>Step Count Today:</Label>
                      <Input
                        type="number"
                        placeholder="Optional"
                        value={stepCount !== null ? stepCount : ''}
                        onChange={(e) => setStepCount(e.target.value ? parseInt(e.target.value) : null)}
                      />
                    </div>

                    <div className="flex flex-col space-y-2">
                      <Label>Sleep Hours Last Night:</Label>
                      <Input
                        type="number"
                        step="0.5"
                        placeholder="Optional"
                        value={sleepHours !== null ? sleepHours : ''}
                        onChange={(e) => setSleepHours(e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <div className="flex justify-between">
                      <Label>Stress Level:</Label>
                      <span className="text-sm text-muted-foreground">{stressLevel}/10</span>
                    </div>
                    <Slider
                      value={[stressLevel]}
                      min={1}
                      max={10}
                      step={1}
                      onValueChange={(vals: number[]) => setStressLevel(vals[0])}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Submit Button */}
          <div className="flex justify-end space-x-2">
            {editingLog && (
              <Button variant="outline" onClick={cancelEdit} disabled={isSubmitting}>
                Cancel
              </Button>
            )}
            <Button 
              onClick={editingLog ? updateLog : handleSubmit}
              disabled={isSubmitting || !selectedProduct}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  {editingLog ? 'Updating...' : 'Submitting...'}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {editingLog ? 'Update Log' : 'Save Log'}
                </>
              )}
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Consumption History</CardTitle>
              <CardDescription>
                Your recent nicotine consumption logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="flex items-center">
                        {filterDate ? format(filterDate, 'PPP') : 'All dates'}
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filterDate}
                        onSelect={setFilterDate}
                        initialFocus
                      />
                      <div className="border-t p-2">
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          onClick={() => setFilterDate(undefined)}
                        >
                          Clear Filter
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  <Button variant="ghost" size="icon" onClick={loadConsumptionLogs}>
                    <RefreshCw className={isLoadingLogs ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
                  </Button>
                </div>
              </div>
              
              {isLoadingLogs ? (
                <div className="flex items-center justify-center p-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center p-8 border rounded-md">
                  <AlertCircle className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No consumption logs found.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setActiveTab('log')}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Log Consumption
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {logs
                      .filter(log => 
                        !filterDate || 
                        format(new Date(log.consumption_date), 'yyyy-MM-dd') === 
                        format(filterDate, 'yyyy-MM-dd')
                      )
                      .map(log => (
                        <Card key={log.id} className="overflow-hidden">
                          <div className="flex border-b">
                            <div className="p-4 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xl">{getIconForCategory(log.product_type)}</span>
                                <div>
                                  <p className="font-medium">{log.brand} {log.variant}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {format(new Date(log.consumption_date), 'PPP')} at {format(new Date(log.consumption_date), 'p')}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col justify-center items-end p-4 space-y-1">
                              <Badge>
                                {log.quantity} {log.unit}
                              </Badge>
                              {log.nicotine_strength && (
                                <Badge variant="outline">
                                  {log.nicotine_strength} mg
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="p-4 grid grid-cols-2 gap-y-2 text-sm">
                            {log.trigger && (
                              <div>
                                <span className="text-muted-foreground">Trigger:</span> {log.trigger}
                              </div>
                            )}
                            {log.location && (
                              <div>
                                <span className="text-muted-foreground">Location:</span> {log.location}
                              </div>
                            )}
                            {log.mood && (
                              <div>
                                <span className="text-muted-foreground">Mood:</span> {log.mood}
                              </div>
                            )}
                            {log.intensity && (
                              <div>
                                <span className="text-muted-foreground">Intensity:</span> {log.intensity}/10
                              </div>
                            )}
                          </div>
                          
                          {log.notes && (
                            <div className="px-4 pb-4 pt-0">
                              <p className="text-sm text-muted-foreground mb-1">Notes:</p>
                              <p className="text-sm">{log.notes}</p>
                            </div>
                          )}
                          
                          <CardFooter className="flex justify-end gap-2 pt-0 pb-4">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDelete(log.id || '')}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEdit(log)}
                            >
                              Edit
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="triggers">
          <TriggerAnalysis session={session} />
        </TabsContent>
      </Tabs>
      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        {/* ... existing add dialog content */}
      </Dialog>
      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        {/* ... existing edit dialog content */}
      </Dialog>
      {/* Product Selection Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        {/* ... existing product dialog content */}
      </Dialog>
    </div>
  );
};

export default ConsumptionLogger;
