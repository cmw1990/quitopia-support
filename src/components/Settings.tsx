import React from 'react';
import { Session } from '@supabase/supabase-js';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter,
  Label,
  Input,
  Button,
  Switch,
  RadioGroup, 
  RadioGroupItem,
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger,
  Slider,
  Checkbox
} from './ui';
import { supabaseRestCall } from "../api/apiCompatibility";
import toast from 'react-hot-toast';
import { Cigarette, ZapOff, Zap, Calendar, ArrowDownRight, Check, X, Target, Flame, Clock, Wifi, Database, Book } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOffline } from '../contexts/OfflineContext';

interface SettingsProps {
  session: Session | null;
}

// Nicotine product types
type NicotineProduct = 'cigarettes' | 'vaping' | 'nicotine_pouches' | 'cigars' | 'pipe' | 'hookah' | 'chewing_tobacco' | 'multiple';

// Quitting method types
type QuittingMethod = 'cold_turkey' | 'gradual_reduction' | 'nicotine_replacement' | 'scheduled_reduction' | 'cut_triggers' | 'delay_technique';

interface UserSettings {
  // Basic info
  nicotine_product: NicotineProduct;
  secondary_products: NicotineProduct[];
  quitting_method: QuittingMethod;
  quit_date: string;
  
  // Product-specific consumption
  daily_cigarettes: number;
  cost_per_pack: number;
  cigarettes_per_pack: number;
  
  // Vaping specifics
  vaping_ml_per_day: number;
  vaping_cost_per_ml: number;
  vaping_nicotine_strength: number;
  
  // Pouches specifics
  pouches_per_day: number;
  pouches_cost_per_tin: number;
  pouches_per_tin: number;
  
  // Other tobacco
  other_cost_per_week: number;
  other_consumption_per_day: number;
  
  // Reduction goals (for gradual methods)
  reduction_goal_percent: number;
  reduction_timeline_days: number;
  replacement_product: string;
  
  // Notification settings
  notification_enabled: boolean;
  reminder_time: string;
  track_triggers: boolean;
  track_mood: boolean;
  track_energy: boolean;
}

// Default guidance by method
const methodGuidance: Record<QuittingMethod, string> = {
  cold_turkey: "You'll completely stop all nicotine use at once. This method may have more intense withdrawal symptoms initially, but they typically subside faster. We'll provide tools to manage cravings and withdrawal symptoms.",
  gradual_reduction: "You'll gradually reduce your nicotine consumption over time. We'll track your progress and help you adjust your reduction schedule based on your success and comfort level.",
  nicotine_replacement: "You'll use nicotine replacement products (patches, gum, etc.) to satisfy cravings while eliminating the harmful delivery method. We'll help you gradually reduce the replacement nicotine over time.",
  scheduled_reduction: "You'll reduce at specific scheduled intervals. For example, cutting consumption by 25% each week until you reach zero. We'll send reminders and track your progress against these milestones.",
  cut_triggers: "You'll identify specific triggers and gradually eliminate nicotine use for each trigger. We'll help you track triggers and develop alternative coping strategies for each one.",
  delay_technique: "You'll progressively delay your first and subsequent nicotine uses each day. We'll help you track and extend these delay periods until cravings diminish."
};

export const Settings: React.FC<SettingsProps> = ({ session }) => {
  const { isOfflineModeEnabled, setOfflineModeEnabled, syncPendingChanges, pendingSyncCount } = useOffline();
  const [settings, setSettings] = React.useState<UserSettings>({
    nicotine_product: 'cigarettes',
    secondary_products: [],
    quitting_method: 'cold_turkey',
    quit_date: new Date().toISOString().split('T')[0],
    
    daily_cigarettes: 0,
    cost_per_pack: 0,
    cigarettes_per_pack: 20,
    
    vaping_ml_per_day: 0,
    vaping_cost_per_ml: 0,
    vaping_nicotine_strength: 0,
    
    pouches_per_day: 0,
    pouches_cost_per_tin: 0,
    pouches_per_tin: 0,
    
    other_cost_per_week: 0,
    other_consumption_per_day: 0,
    
    reduction_goal_percent: 10,
    reduction_timeline_days: 30,
    replacement_product: 'none',
    
    notification_enabled: true,
    reminder_time: '09:00',
    track_triggers: true,
    track_mood: true,
    track_energy: true,
  });
  
  const [activeTab, setActiveTab] = React.useState('products');

  React.useEffect(() => {
    if (session?.user) {
      loadUserSettings();
    }
  }, [session]);

  const loadUserSettings = async () => {
    try {
      const data = await supabaseRestCall(
        `/rest/v1/quit_smoking_settings?user_id=eq.${session?.user.id}&select=*`,
        {
          method: 'GET',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json'
          }
        },
        session
      );
      
      if (Array.isArray(data) && data.length > 0) {
        const settings = data[0];
        setSettings({
          ...settings,
          secondary_products: settings.secondary_products || [],
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    }
  };

  const saveSettings = async () => {
    try {
      const response = await supabaseRestCall(
        `/rest/v1/quit_smoking_settings`,
        {
          method: 'POST',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            user_id: session?.user?.id,
            ...settings,
            updated_at: new Date().toISOString(),
          })
        },
        session
      );

      toast.success('Your settings have been saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };
  
  const toggleSecondaryProduct = (product: NicotineProduct) => {
    if (settings.secondary_products.includes(product)) {
      setSettings({
        ...settings,
        secondary_products: settings.secondary_products.filter(p => p !== product)
      });
    } else {
      setSettings({
        ...settings,
        secondary_products: [...settings.secondary_products, product]
      });
    }
  };
  
  const getConsumptionFields = () => {
    switch (settings.nicotine_product) {
      case 'cigarettes':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="daily-cigarettes">Daily cigarettes (before quitting)</Label>
              <Input
                id="daily-cigarettes"
                type="number"
                value={settings.daily_cigarettes}
                onChange={(e) => setSettings({ ...settings, daily_cigarettes: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost-per-pack">Cost per pack ($)</Label>
              <Input
                id="cost-per-pack"
                type="number"
                step="0.01"
                value={settings.cost_per_pack}
                onChange={(e) => setSettings({ ...settings, cost_per_pack: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cigarettes-per-pack">Cigarettes per pack</Label>
              <Input
                id="cigarettes-per-pack"
                type="number"
                value={settings.cigarettes_per_pack}
                onChange={(e) => setSettings({ ...settings, cigarettes_per_pack: Number(e.target.value) })}
              />
            </div>
          </div>
        );
      
      case 'vaping':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vaping-ml-per-day">ML of e-liquid per day</Label>
              <Input
                id="vaping-ml-per-day"
                type="number"
                step="0.1"
                value={settings.vaping_ml_per_day}
                onChange={(e) => setSettings({ ...settings, vaping_ml_per_day: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vaping-cost-per-ml">Cost per ML ($)</Label>
              <Input
                id="vaping-cost-per-ml"
                type="number"
                step="0.01"
                value={settings.vaping_cost_per_ml}
                onChange={(e) => setSettings({ ...settings, vaping_cost_per_ml: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vaping-nicotine-strength">Nicotine strength (mg/mL)</Label>
              <Input
                id="vaping-nicotine-strength"
                type="number"
                step="0.1"
                value={settings.vaping_nicotine_strength}
                onChange={(e) => setSettings({ ...settings, vaping_nicotine_strength: Number(e.target.value) })}
              />
            </div>
          </div>
        );
      
      case 'nicotine_pouches':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pouches-per-day">Pouches used per day</Label>
              <Input
                id="pouches-per-day"
                type="number"
                value={settings.pouches_per_day}
                onChange={(e) => setSettings({ ...settings, pouches_per_day: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pouches-cost-per-tin">Cost per tin/can ($)</Label>
              <Input
                id="pouches-cost-per-tin"
                type="number"
                step="0.01"
                value={settings.pouches_cost_per_tin}
                onChange={(e) => setSettings({ ...settings, pouches_cost_per_tin: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pouches-per-tin">Pouches per tin/can</Label>
              <Input
                id="pouches-per-tin"
                type="number"
                value={settings.pouches_per_tin}
                onChange={(e) => setSettings({ ...settings, pouches_per_tin: Number(e.target.value) })}
              />
            </div>
          </div>
        );
      
      default:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="other-consumption-per-day">Usage per day (units or sessions)</Label>
              <Input
                id="other-consumption-per-day"
                type="number"
                value={settings.other_consumption_per_day}
                onChange={(e) => setSettings({ ...settings, other_consumption_per_day: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="other-cost-per-week">Weekly cost ($)</Label>
              <Input
                id="other-cost-per-week"
                type="number"
                step="0.01"
                value={settings.other_cost_per_week}
                onChange={(e) => setSettings({ ...settings, other_cost_per_week: Number(e.target.value) })}
              />
            </div>
          </div>
        );
    }
  };
  
  const getMethodSpecificFields = () => {
    switch (settings.quitting_method) {
      case 'gradual_reduction':
      case 'scheduled_reduction':
        return (
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="reduction-goal">Reduction Goal per Week</Label>
                <span className="text-sm">{settings.reduction_goal_percent}%</span>
              </div>
              <Slider
                id="reduction-goal"
                min={5}
                max={50}
                step={5}
                value={[settings.reduction_goal_percent]}
                onValueChange={(values) => setSettings({ ...settings, reduction_goal_percent: values[0] })}
              />
              <p className="text-sm text-muted-foreground">
                We recommend 10-20% reduction per week for a sustainable approach
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeline">Total Quit Timeline (Days)</Label>
              <Input
                id="timeline"
                type="number"
                value={settings.reduction_timeline_days}
                onChange={(e) => setSettings({ ...settings, reduction_timeline_days: Number(e.target.value) })}
              />
            </div>
          </div>
        );
      
      case 'nicotine_replacement':
        return (
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="replacement-product">Replacement Product</Label>
              <Select
                value={settings.replacement_product}
                onValueChange={(value) => setSettings({ ...settings, replacement_product: value })}
              >
                <SelectTrigger id="replacement-product">
                  <SelectValue placeholder="Select replacement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patches">Nicotine Patches</SelectItem>
                  <SelectItem value="gum">Nicotine Gum</SelectItem>
                  <SelectItem value="lozenges">Nicotine Lozenges</SelectItem>
                  <SelectItem value="inhaler">Nicotine Inhaler</SelectItem>
                  <SelectItem value="spray">Nicotine Spray</SelectItem>
                  <SelectItem value="multiple">Multiple Products</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="reduction-timeline">Replacement Reduction Timeline (Days)</Label>
                <span className="text-sm">{settings.reduction_timeline_days} days</span>
              </div>
              <Slider
                id="reduction-timeline"
                min={30}
                max={180}
                step={30}
                value={[settings.reduction_timeline_days]}
                onValueChange={(values) => setSettings({ ...settings, reduction_timeline_days: values[0] })}
              />
              <p className="text-sm text-muted-foreground">
                Recommended: 60-90 days for gradual reduction of replacement nicotine
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Quit Settings</h1>
        <Button onClick={saveSettings}>Save Changes</Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="products">Nicotine Products</TabsTrigger>
          <TabsTrigger value="method">Quitting Method</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="tracking">Tracking</TabsTrigger>
          <TabsTrigger value="app">App Settings</TabsTrigger>
        </TabsList>
        
        {/* Nicotine Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Primary Nicotine Product</CardTitle>
              <CardDescription>
                Select your main nicotine product that you want to quit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={settings.nicotine_product}
                onValueChange={(value: NicotineProduct) => setSettings({ ...settings, nicotine_product: value })}
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem
                    value="cigarettes"
                    id="cigarettes"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="cigarettes"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Cigarette className="mb-3 h-6 w-6" />
                    Cigarettes
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem
                    value="vaping"
                    id="vaping"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="vaping"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <ZapOff className="mb-3 h-6 w-6" />
                    Vaping/E-cigarettes
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem
                    value="nicotine_pouches"
                    id="nicotine_pouches"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="nicotine_pouches"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <svg className="mb-3 h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="8" />
                      <path d="M10 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0" />
                    </svg>
                    Nicotine Pouches
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem
                    value="multiple"
                    id="multiple"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="multiple"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <svg className="mb-3 h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8 12h8M12 8v8M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                    </svg>
                    Other/Multiple
                  </Label>
                </div>
              </RadioGroup>
              
              {settings.nicotine_product === 'multiple' && (
                <div className="mt-4 space-y-2">
                  <Label>Select all that apply</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['cigarettes', 'vaping', 'nicotine_pouches', 'cigars', 'pipe', 'hookah', 'chewing_tobacco'].map((product) => (
                      <div key={product} className="flex items-center space-x-2">
                        <Checkbox
                          id={`secondary-${product}`}
                          checked={settings.secondary_products.includes(product as NicotineProduct)}
                          onCheckedChange={() => toggleSecondaryProduct(product as NicotineProduct)}
                        />
                        <Label htmlFor={`secondary-${product}`} className="capitalize">
                          {product.replace('_', ' ')}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usage Information</CardTitle>
              <CardDescription>
                We'll use this to track your progress and calculate savings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getConsumptionFields()}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Quitting Method Tab */}
        <TabsContent value="method" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Quitting Method</CardTitle>
              <CardDescription>
                Choose the approach that best fits your quit journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <RadioGroup
                      value={settings.quitting_method}
                      onValueChange={(value: QuittingMethod) => setSettings({ ...settings, quitting_method: value })}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cold_turkey" id="cold_turkey" />
                        <Label htmlFor="cold_turkey" className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Cold Turkey
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="gradual_reduction" id="gradual_reduction" />
                        <Label htmlFor="gradual_reduction" className="flex items-center gap-2">
                          <ArrowDownRight className="h-4 w-4" />
                          Gradual Reduction
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="nicotine_replacement" id="nicotine_replacement" />
                        <Label htmlFor="nicotine_replacement" className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Nicotine Replacement
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="scheduled_reduction" id="scheduled_reduction" />
                        <Label htmlFor="scheduled_reduction" className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Scheduled Reduction
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cut_triggers" id="cut_triggers" />
                        <Label htmlFor="cut_triggers" className="flex items-center gap-2">
                          <X className="h-4 w-4" />
                          Cut Triggers
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="delay_technique" id="delay_technique" />
                        <Label htmlFor="delay_technique" className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Delay Technique
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <h3 className="font-medium mb-2">Method Guidance:</h3>
                    <p className="text-sm text-muted-foreground">
                      {methodGuidance[settings.quitting_method]}
                    </p>
                  </div>
                </div>
                
                {getMethodSpecificFields()}
                
                <div className="space-y-2 mt-4">
                  <Label htmlFor="quit-date">Target Quit Date</Label>
                  <Input
                    id="quit-date"
                    type="date"
                    value={settings.quit_date}
                    onChange={(e) => setSettings({ ...settings, quit_date: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground">
                    {settings.quitting_method === 'cold_turkey' 
                      ? 'This is when you\'ll quit completely' 
                      : 'This is when you\'ll start your reduction plan'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications & Tracking</CardTitle>
              <CardDescription>
                Configure how you want to be supported on your journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications">Daily reminders & tips</Label>
                <Switch
                  id="notifications"
                  checked={settings.notification_enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, notification_enabled: checked })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reminder-time">Reminder time</Label>
                <Input
                  id="reminder-time"
                  type="time"
                  value={settings.reminder_time}
                  onChange={(e) => setSettings({ ...settings, reminder_time: e.target.value })}
                />
              </div>
              
              <div className="space-y-2 mt-4">
                <Label className="text-base">Tracking Features</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Select what you want to track during your quit journey
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="track-triggers"
                      checked={settings.track_triggers}
                      onCheckedChange={(checked) => 
                        setSettings({ ...settings, track_triggers: checked === true })}
                    />
                    <Label htmlFor="track-triggers">Track craving triggers</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="track-mood"
                      checked={settings.track_mood}
                      onCheckedChange={(checked) => 
                        setSettings({ ...settings, track_mood: checked === true })}
                    />
                    <Label htmlFor="track-mood">Track mood changes</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="track-energy"
                      checked={settings.track_energy}
                      onCheckedChange={(checked) => 
                        setSettings({ ...settings, track_energy: checked === true })}
                    />
                    <Label htmlFor="track-energy">Track energy levels</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Your data helps us provide personalized support and track your progress.
                We use this information to calculate money saved and health improvements.
              </p>
              <Button variant="outline">Export Progress Data</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* New App Settings Tab */}
        <TabsContent value="app" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>App Settings</CardTitle>
              <CardDescription>
                Configure application settings and utilities
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Offline Mode Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Offline Mode</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="offline-mode">Enable Offline Mode</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Save data locally when offline and sync when back online
                    </p>
                  </div>
                  <Switch
                    id="offline-mode"
                    checked={isOfflineModeEnabled}
                    onCheckedChange={setOfflineModeEnabled}
                  />
                </div>
                
                {pendingSyncCount > 0 && (
                  <div className="rounded-md bg-amber-50 p-4 mt-2 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-amber-700">
                        {pendingSyncCount} {pendingSyncCount === 1 ? 'item' : 'items'} pending sync
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => syncPendingChanges()}
                      className="text-xs"
                    >
                      Sync Now
                    </Button>
                  </div>
                )}
                
                <div className="pt-2">
                  <div className="flex flex-wrap gap-2">
                    <Link 
                      to="/app/offline-test"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Database className="mr-2 h-4 w-4" />
                      Test Offline Mode
                    </Link>
                    <Link 
                      to="/app/offline-docs"
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      <Book className="mr-2 h-4 w-4" />
                      Offline Documentation
                    </Link>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Test storing and retrieving data while offline or learn more about offline features
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-2">Developer Options</h3>
                <p className="text-sm text-gray-500 mb-4">
                  These options are for development and testing purposes.
                </p>
                
                <div className="space-y-2">
                  <Link 
                    to="/app/deep-link-test"
                    className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Deep Link Tester
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
