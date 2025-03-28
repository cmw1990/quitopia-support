import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { ProductCatalog } from './ProductCatalog';
import { NicotineProduct } from '../../types/dataTypes';
import { UserProduct, ConsumptionLog } from './nicotineTypes';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider
} from '../../components/ui';
import { 
  Package, 
  BarChart, 
  Calendar, 
  Clock, 
  Plus, 
  Trash,
  Cigarette,
  Battery,
  LayoutList
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '../../components/ui/use-toast';

// This would typically come from an API
const USER_PRODUCTS: UserProduct[] = [
  {
    id: 'pouch-001',
    name: 'Wintergreen 4mg',
    brand: 'ZYN',
    category: 'pouch',
    nicotine_strength: 4.0,
    is_primary: true
  },
  {
    id: 'vape-003',
    name: 'Mango Ice 5000',
    brand: 'Elf Bar',
    category: 'vape',
    nicotine_strength: 50.0,
    is_primary: false
  }
];

// Situation options
const SITUATION_OPTIONS = [
  'Morning routine',
  'With coffee',
  'After a meal',
  'While driving',
  'While drinking alcohol',
  'During a work break',
  'Feeling stressed',
  'Feeling anxious',
  'Feeling bored',
  'Socializing',
  'After exercise',
  'Before bed',
  'Other'
];

// Location options
const LOCATION_OPTIONS = [
  'Home',
  'Work',
  'Car',
  'Public place',
  'Friend\'s place',
  'Bar/Restaurant',
  'Outside',
  'Other'
];

// Mood options
const MOOD_OPTIONS = [
  'Relaxed',
  'Happy',
  'Excited',
  'Bored',
  'Neutral',
  'Sad',
  'Anxious',
  'Stressed',
  'Angry',
  'Irritable',
  'Tired'
];

export const MultiProductTracker: React.FC = () => {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  
  // State for tabs
  const [activeTab, setActiveTab] = useState('my-products');
  
  // State for user products
  const [userProducts, setUserProducts] = useState<UserProduct[]>(USER_PRODUCTS);
  
  // State for consumption logging
  const [isLogging, setIsLogging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logData, setLogData] = useState<Partial<ConsumptionLog>>({
    product_id: '',
    quantity: 1,
    timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
  });
  
  // State for consumption logs (would typically come from API)
  const [consumptionLogs, setConsumptionLogs] = useState<ConsumptionLog[]>([]);
  
  // Add a product to user's collection
  const addUserProduct = (product: NicotineProduct) => {
    const newUserProduct: UserProduct = {
      id: product.id,
      name: product.name,
      brand: product.brand,
      category: product.category,
      nicotine_strength: product.nicotine_strength,
      is_primary: userProducts.length === 0, // First product becomes primary
    };
    
    setUserProducts([...userProducts, newUserProduct]);
    
    toast({
      title: "Product Added",
      description: `${product.name} has been added to your products.`
    });
  };
  
  // Remove a product from user's collection
  const removeUserProduct = (productId: string) => {
    const updatedProducts = userProducts.filter(p => p.id !== productId);
    
    // If we removed the primary product, make the first remaining one primary
    if (userProducts.find(p => p.id === productId)?.is_primary && updatedProducts.length > 0) {
      updatedProducts[0].is_primary = true;
    }
    
    setUserProducts(updatedProducts);
    
    toast({
      title: "Product Removed",
      description: "The product has been removed from your collection."
    });
  };
  
  // Set a product as primary
  const setPrimaryProduct = (productId: string) => {
    const updatedProducts = userProducts.map(p => ({
      ...p,
      is_primary: p.id === productId
    }));
    
    setUserProducts(updatedProducts);
    
    toast({
      title: "Primary Product Updated",
      description: "Your primary product has been updated."
    });
  };
  
  // Start logging consumption
  const startLogging = (productId?: string) => {
    // If a product ID is provided, pre-select it
    if (productId) {
      const product = userProducts.find(p => p.id === productId);
      if (product) {
        setLogData({
          ...logData,
          product_id: product.id,
          product_name: product.name,
          product_category: product.category,
          nicotine_amount: product.nicotine_strength
        });
      }
    } else if (userProducts.length > 0) {
      // Otherwise, use the primary product
      const primaryProduct = userProducts.find(p => p.is_primary) || userProducts[0];
      setLogData({
        ...logData,
        product_id: primaryProduct.id,
        product_name: primaryProduct.name,
        product_category: primaryProduct.category,
        nicotine_amount: primaryProduct.nicotine_strength
      });
    }
    
    setIsLogging(true);
  };
  
  // Handle log product change
  const handleLogProductChange = (productId: string) => {
    const product = userProducts.find(p => p.id === productId);
    if (product) {
      setLogData({
        ...logData,
        product_id: product.id,
        product_name: product.name,
        product_category: product.category,
        nicotine_amount: product.nicotine_strength * (logData.quantity || 1)
      });
    }
  };
  
  // Handle log quantity change
  const handleLogQuantityChange = (quantity: number) => {
    const product = userProducts.find(p => p.id === logData.product_id);
    if (product) {
      setLogData({
        ...logData,
        quantity,
        nicotine_amount: product.nicotine_strength * quantity
      });
    }
  };
  
  // Submit consumption log
  const submitConsumptionLog = () => {
    if (!logData.product_id || !logData.quantity) {
      toast({
        title: "Missing Information",
        description: "Please select a product and quantity.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // This would typically be an API call
    setTimeout(() => {
      const newLog: ConsumptionLog = {
        id: `log-${Date.now()}`,
        ...logData as ConsumptionLog
      };
      
      setConsumptionLogs([newLog, ...consumptionLogs]);
      
      // Reset form
      setLogData({
        product_id: '',
        quantity: 1,
        timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
      });
      
      setIsLogging(false);
      setIsSubmitting(false);
      
      toast({
        title: "Consumption Logged",
        description: "Your nicotine consumption has been successfully recorded."
      });
    }, 1000);
  };
  
  // Calculate total nicotine consumption for today
  const calculateTodaysTotalNicotine = () => {
    const today = new Date().toISOString().split('T')[0];
    
    return consumptionLogs
      .filter(log => log.timestamp.startsWith(today))
      .reduce((total, log) => total + (log.nicotine_amount || 0), 0);
  };
  
  return (
    <div className="container mx-auto py-6 space-y-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Multi-Product Nicotine Tracker</h1>
          <p className="text-muted-foreground">
            Track and manage all your nicotine products in one place
          </p>
        </div>
        
        <Button 
          onClick={() => startLogging()} 
          disabled={userProducts.length === 0 || isLogging}
          className="w-full md:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Log Consumption
        </Button>
      </div>
      
      {isLogging ? (
        <Card>
          <CardHeader>
            <CardTitle>Log Nicotine Consumption</CardTitle>
            <CardDescription>
              Record your usage to track patterns and progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Product</label>
                <Select 
                  value={logData.product_id} 
                  onValueChange={handleLogProductChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {userProducts.map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.brand})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity</label>
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleLogQuantityChange(Math.max(1, (logData.quantity || 1) - 1))}
                    disabled={(logData.quantity || 1) <= 1}
                  >
                    -
                  </Button>
                  <Input 
                    type="number" 
                    value={logData.quantity || 1} 
                    onChange={(e) => handleLogQuantityChange(parseInt(e.target.value) || 1)}
                    min={1}
                    className="text-center"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleLogQuantityChange((logData.quantity || 1) + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Date & Time</label>
                <Input 
                  type="datetime-local" 
                  value={logData.timestamp?.split('.')[0] || ''}
                  onChange={(e) => setLogData({...logData, timestamp: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Situation</label>
                <Select 
                  value={logData.situation || ''} 
                  onValueChange={(value) => setLogData({...logData, situation: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a situation" />
                  </SelectTrigger>
                  <SelectContent>
                    {SITUATION_OPTIONS.map(situation => (
                      <SelectItem key={situation} value={situation}>
                        {situation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Select 
                  value={logData.location || ''} 
                  onValueChange={(value) => setLogData({...logData, location: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATION_OPTIONS.map(location => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Mood</label>
                <Select 
                  value={logData.mood || ''} 
                  onValueChange={(value) => setLogData({...logData, mood: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your mood" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOOD_OPTIONS.map(mood => (
                      <SelectItem key={mood} value={mood}>
                        {mood}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Notes</label>
                <Input 
                  placeholder="Any additional details..."
                  value={logData.notes || ''} 
                  onChange={(e) => setLogData({...logData, notes: e.target.value})}
                />
              </div>
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <div className="font-medium">Nicotine Summary</div>
              <div className="flex items-center gap-2 mt-2">
                <Battery className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold">
                  {logData.nicotine_amount || 0} mg nicotine
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setIsLogging(false)}>
              Cancel
            </Button>
            <Button onClick={submitConsumptionLog} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Log Consumption'}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="my-products" className="flex gap-2 items-center">
              <Package className="h-4 w-4" />
              <span>My Products</span>
            </TabsTrigger>
            <TabsTrigger value="consumption" className="flex gap-2 items-center">
              <BarChart className="h-4 w-4" />
              <span>Consumption</span>
            </TabsTrigger>
            <TabsTrigger value="catalog" className="flex gap-2 items-center">
              <LayoutList className="h-4 w-4" />
              <span>Product Catalog</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-products" className="space-y-6 mt-6">
            {userProducts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Products Added</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    You haven't added any products to your collection yet. Browse the catalog to find and add products you use.
                  </p>
                  <Button onClick={() => setActiveTab('catalog')}>
                    Browse Product Catalog
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userProducts.map((product) => (
                    <Card key={product.id} className={product.is_primary ? 'border-primary' : ''}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{product.name}</CardTitle>
                            <CardDescription>{product.brand}</CardDescription>
                          </div>
                          {product.is_primary && (
                            <Badge>Primary</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex items-center gap-2">
                          {product.category === 'cigarette' && <Cigarette className="h-5 w-5 text-muted-foreground" />}
                          {product.category === 'vape' && <Battery className="h-5 w-5 text-muted-foreground" />}
                          {product.category === 'pouch' && <Package className="h-5 w-5 text-muted-foreground" />}
                          <span className="text-muted-foreground capitalize">{product.category}</span>
                        </div>
                        <div className="mt-2 font-medium">
                          Nicotine: {product.nicotine_strength} mg
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2">
                        <div className="flex gap-2">
                          {!product.is_primary && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setPrimaryProduct(product.id)}
                            >
                              Set Primary
                            </Button>
                          )}
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => removeUserProduct(product.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => startLogging(product.id)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Log Use
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                
                <Button 
                  variant="outline" 
                  className="mt-4 w-full"
                  onClick={() => setActiveTab('catalog')}
                >
                  Add More Products
                </Button>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="consumption" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Today's Consumption</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Battery className="h-6 w-6 text-primary" />
                    <span className="text-2xl font-bold">{calculateTodaysTotalNicotine()} mg</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Weekly Average</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-6 w-6 text-primary" />
                    <span className="text-2xl font-bold">42 mg/day</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Last Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Clock className="h-6 w-6 text-primary" />
                    <span className="text-lg font-bold">
                      {consumptionLogs.length > 0 
                        ? (new Date(consumptionLogs[0].timestamp)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
                        : 'No logs yet'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {consumptionLogs.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Recent Consumption</h3>
                <div className="divide-y">
                  {consumptionLogs.map((log) => (
                    <div key={log.id} className="py-4 flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center">
                          {log.product_category === 'cigarette' && <Cigarette className="h-5 w-5 text-muted-foreground mr-2" />}
                          {log.product_category === 'vape' && <Battery className="h-5 w-5 text-muted-foreground mr-2" />}
                          {log.product_category === 'pouch' && <Package className="h-5 w-5 text-muted-foreground mr-2" />}
                          <span className="font-medium">{log.product_name}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()} • {log.situation || 'N/A'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{log.nicotine_amount} mg</div>
                        <div className="text-sm text-muted-foreground">Quantity: {log.quantity}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BarChart className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Consumption Logs</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    You haven't logged any nicotine consumption yet. Start tracking to see your patterns and progress.
                  </p>
                  <Button onClick={() => startLogging()}>
                    Log Your First Use
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="catalog" className="mt-6">
            <ProductCatalog />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}; 