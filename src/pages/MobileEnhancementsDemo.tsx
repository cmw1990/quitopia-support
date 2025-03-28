import React, { useState, useEffect } from 'react';
import MobileLayout from '../layouts/MobileLayout';
import { useSwipeable } from 'react-swipeable';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { OfflineStatusIndicator } from '../components/OfflineStatusIndicator';
import { ChevronLeft, ChevronRight, Smartphone, Wifi, WifiOff, RefreshCw, Activity, BookOpen, Calendar, CheckCircle, ArrowRight, ArrowLeft, Heart, PieChart, Loader2 } from 'lucide-react';
import mobileEnhancementsApi from '../api/mobileEnhancementsApi';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';

// Available feature demos
type FeatureDemo = 
  | 'overview'
  | 'offline-support'
  | 'gesture-navigation'
  | 'progress-tracking'
  | 'journal-mood'
  | 'tasks-reminders'
  | 'health-analytics';

// Mapping of features to their descriptions
const featureDescriptions: Record<FeatureDemo, string> = {
  'overview': 'Explore the mobile enhancements implemented in Mission Fresh, designed to provide a native-like experience on all devices.',
  'offline-support': 'Continue using the app even when offline. Your data syncs automatically when you reconnect.',
  'gesture-navigation': 'Navigate through the app using intuitive swipe gestures for a more natural mobile experience.',
  'progress-tracking': 'Track your smoke-free journey with real-time updates and visualizations.',
  'journal-mood': 'Record your thoughts and track your mood with an optimized mobile interface.',
  'tasks-reminders': 'Manage your quitting tasks and set reminders to stay on track.',
  'health-analytics': 'Monitor the health improvements as you progress in your smoke-free journey.'
};

const MobileEnhancementsDemo: React.FC = () => {
  // Current feature being displayed
  const [currentFeature, setCurrentFeature] = useState<FeatureDemo>('overview');
  
  // Simulate offline/online status
  const [isOffline, setIsOffline] = useState(false);
  
  // Mock data states
  const [isLoading, setIsLoading] = useState(false);
  const [syncProgress, setSyncProgress] = useState<number | null>(null);
  
  // Navigation order for features
  const featureOrder: FeatureDemo[] = [
    'overview',
    'offline-support',
    'gesture-navigation',
    'progress-tracking',
    'journal-mood',
    'tasks-reminders',
    'health-analytics'
  ];
  
  // Handle swipe gestures
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleNext(),
    onSwipedRight: () => handlePrev(),
    swipeDuration: 500,
    preventScrollOnSwipe: true,
    trackMouse: false
  });
  
  // Toggle offline mode
  const toggleOfflineMode = () => {
    setIsOffline(prev => !prev);
  };
  
  // Handle synchronization
  const handleSync = async () => {
    if (isOffline) return;
    
    setIsLoading(true);
    setSyncProgress(0);
    
    // Simulate sync progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;
      if (progress > 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setSyncProgress(null);
          setIsLoading(false);
        }, 500);
      }
      setSyncProgress(progress);
    }, 300);
    
    // Simulate network delay
    await mobileEnhancementsApi.simulateNetworkDelay(1000, 2000);
  };
  
  // Navigation functions
  const handleNext = () => {
    const currentIndex = featureOrder.indexOf(currentFeature);
    if (currentIndex < featureOrder.length - 1) {
      setCurrentFeature(featureOrder[currentIndex + 1]);
    }
  };
  
  const handlePrev = () => {
    const currentIndex = featureOrder.indexOf(currentFeature);
    if (currentIndex > 0) {
      setCurrentFeature(featureOrder[currentIndex - 1]);
    }
  };
  
  // Get current feature title
  const getFeatureTitle = (feature: FeatureDemo): string => {
    switch (feature) {
      case 'overview': return 'Mobile Enhancements Overview';
      case 'offline-support': return 'Offline Support';
      case 'gesture-navigation': return 'Gesture Navigation';
      case 'progress-tracking': return 'Real-Time Progress Tracking';
      case 'journal-mood': return 'Journal & Mood Tracking';
      case 'tasks-reminders': return 'Tasks & Reminders';
      case 'health-analytics': return 'Health Analytics';
      default: return 'Mobile Enhancements';
    }
  };
  
  // Add more demo-specific state
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // Load demo data
  useEffect(() => {
    const loadData = async () => {
      // Generate mock data
      setJournalEntries(mobileEnhancementsApi.getJournalEntries(5));
      setTasks(mobileEnhancementsApi.getTasks(3));
      setHealthMetrics(mobileEnhancementsApi.getHealthMetrics(10));
      setUserProfile(mobileEnhancementsApi.getUserProfile());
    };
    
    loadData();
  }, []);
  
  // Render feature content based on current feature
  const renderFeatureContent = () => {
    switch (currentFeature) {
      case 'overview':
        return (
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-primary/10 rounded-lg">
              <Smartphone className="h-5 w-5 mr-3 text-primary" />
              <div>
                <h3 className="font-medium">Native-like Experience</h3>
                <p className="text-sm text-muted-foreground">Optimized for all mobile devices</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-primary/10 rounded-lg">
              <Wifi className="h-5 w-5 mr-3 text-primary" />
              <div>
                <h3 className="font-medium">100% Offline Support</h3>
                <p className="text-sm text-muted-foreground">Works without an internet connection</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-primary/10 rounded-lg">
              <Activity className="h-5 w-5 mr-3 text-primary" />
              <div>
                <h3 className="font-medium">Real-time Progress</h3>
                <p className="text-sm text-muted-foreground">Track your journey instantly</p>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">Swipe left/right to explore features</p>
              <div className="flex justify-center mt-2">
                <ArrowLeft className="h-4 w-4 mx-1 text-muted-foreground" />
                <ArrowRight className="h-4 w-4 mx-1 text-muted-foreground" />
              </div>
            </div>
          </div>
        );
        
      case 'offline-support':
        return (
          <div className="space-y-4">
            <div className="bg-muted/20 p-4 rounded-lg">
              <h3 className="font-medium mb-2 flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${isOffline ? 'bg-destructive' : 'bg-green-500'}`}></div>
                {isOffline ? 'Currently Offline' : 'Currently Online'}
              </h3>
              
              <p className="text-sm text-muted-foreground mb-3">
                {isOffline 
                  ? 'Your changes are being saved locally and will sync when you reconnect.'
                  : 'All your data is being synced automatically.'
                }
              </p>
              
              <div className="flex items-center justify-between mb-3">
                <Label htmlFor="network-toggle" className="text-sm">Network Simulation</Label>
                <Switch 
                  id="network-toggle" 
                  checked={!isOffline} 
                  onCheckedChange={() => toggleOfflineMode()}
                />
              </div>
              
              {isLoading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Syncing progress</span>
                    <span>{syncProgress}%</span>
                  </div>
                  <Progress value={syncProgress || 0} className="h-2" />
                </div>
              )}
            </div>
            
            <div className="bg-muted/20 p-4 rounded-lg">
              <h3 className="font-medium mb-2">How It Works</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Data is stored locally using IndexedDB</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Changes are queued for syncing</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Automatic sync when back online</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Smart conflict resolution if needed</span>
                </li>
              </ul>
            </div>
          </div>
        );
        
      case 'gesture-navigation':
        return (
          <div className="space-y-4">
            <div className="bg-muted/10 p-4 rounded-lg border border-dashed border-muted-foreground flex items-center justify-center h-28">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">Try swiping left and right</p>
                <div className="flex items-center justify-center">
                  <ArrowLeft className="h-5 w-5 text-muted-foreground mx-1" />
                  <span className="mx-1">Swipe</span>
                  <ArrowRight className="h-5 w-5 text-muted-foreground mx-1" />
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-medium">Supported Gestures</h3>
              
              <div className="bg-muted/20 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <ArrowLeft className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Swipe Right</p>
                      <p className="text-xs text-muted-foreground">Go to previous screen</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted/20 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <ArrowRight className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Swipe Left</p>
                      <p className="text-xs text-muted-foreground">Go to next screen</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mt-2">
                The app also supports pull-to-refresh and other mobile-specific interactions.
              </p>
            </div>
          </div>
        );
        
      case 'progress-tracking':
        return (
          <div className="space-y-4">
            {userProfile && (
              <div className="bg-muted/10 p-4 rounded-lg border border-primary/20">
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                    <span className="font-bold">{userProfile.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium">{userProfile.name}</p>
                    <p className="text-xs text-muted-foreground">Smoke-free since {new Date(userProfile.joinDate).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-muted/20 p-2 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Smoke-free for</p>
                    <p className="text-xl font-bold">{userProfile.smokeFreeStreak} days</p>
                  </div>
                  <div className="bg-muted/20 p-2 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Money saved</p>
                    <p className="text-xl font-bold">${(userProfile.smokeFreeStreak * 10).toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall health recovery</span>
                    <span>{Math.min(userProfile.smokeFreeStreak / 3, 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={Math.min(userProfile.smokeFreeStreak / 3, 100)} className="h-2" />
                </div>
              </div>
            )}
            
            <div className="bg-muted/10 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Health Improvements</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 text-red-500 mr-2" />
                    <span className="text-sm">Heart rate normalized</span>
                  </div>
                  <Badge variant="outline" className="text-xs">Day 3</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Activity className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">Improved circulation</span>
                  </div>
                  <Badge variant="outline" className="text-xs">Day 14</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-sm">Lung function improving</span>
                  </div>
                  <Badge variant="outline" className="text-xs">Day 30</Badge>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'journal-mood':
        return (
          <div className="space-y-4">
            <div className="flex mb-2 space-x-2">
              <Badge variant="outline" className="flex-1 justify-center py-1">Today</Badge>
              <Badge variant="outline" className="flex-1 justify-center py-1">Week</Badge>
              <Badge variant="outline" className="flex-1 justify-center py-1">Month</Badge>
              <Badge variant="secondary" className="flex-1 justify-center py-1">All</Badge>
            </div>
            
            <div className="space-y-3">
              {journalEntries.map((entry, index) => (
                <div key={index} className="bg-muted/10 p-3 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <div className="text-sm font-medium">
                      {new Date(entry.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs text-muted-foreground mr-1">Mood:</span>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span 
                            key={i} 
                            className={`text-xs ${i < entry.mood ? 'text-yellow-500' : 'text-muted-foreground'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm mb-2 line-clamp-2">{entry.content}</p>
                  
                  <div className="flex flex-wrap gap-1">
                    {entry.triggers.map((trigger: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {trigger}
                      </Badge>
                    ))}
                    {!entry.isSynced && (
                      <Badge variant="secondary" className="text-xs ml-auto">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1"></div>
                        Not synced
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <Button variant="outline" className="w-full">
              <BookOpen className="h-4 w-4 mr-2" />
              New Journal Entry
            </Button>
          </div>
        );
        
      case 'tasks-reminders':
        return (
          <div className="space-y-4">
            <div className="bg-muted/10 p-4 rounded-lg">
              <h3 className="font-medium mb-3">Today's Tasks</h3>
              
              <div className="space-y-2">
                {tasks.map((task, index) => (
                  <div key={index} className="flex items-start p-2 bg-muted/20 rounded-lg">
                    <div className="flex items-center h-5 mr-3">
                      <Switch checked={task.completed} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{task.description}</p>
                      <div className="flex items-center mt-1">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            task.priority === 'high' ? 'bg-red-100 text-red-800' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {task.priority}
                        </Badge>
                        
                        <span className="text-xs text-muted-foreground ml-2">
                          {new Date(task.dueDate).toLocaleDateString()} 
                        </span>
                        
                        {!task.isSynced && (
                          <Badge variant="secondary" className="text-xs ml-auto">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1"></div>
                            Not synced
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button variant="outline" className="w-full mt-3">
                <Calendar className="h-4 w-4 mr-2" />
                Add New Task
              </Button>
            </div>
            
            <div className="bg-muted/10 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Upcoming Reminders</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-muted/20 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                      <span className="text-xs text-blue-800">9</span>
                    </div>
                    <span className="text-sm">Morning NRT dose</span>
                  </div>
                  <Badge variant="outline" className="text-xs">9:00 AM</Badge>
                </div>
                
                <div className="flex justify-between items-center p-2 bg-muted/20 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                      <span className="text-xs text-green-800">12</span>
                    </div>
                    <span className="text-sm">Support group call</span>
                  </div>
                  <Badge variant="outline" className="text-xs">12:30 PM</Badge>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'health-analytics':
        return (
          <div className="space-y-4">
            <div className="bg-muted/10 p-4 rounded-lg">
              <h3 className="font-medium mb-3">Health Metrics</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Lung capacity</span>
                    <span className="text-sm font-medium">+12% improvement</span>
                  </div>
                  <Progress value={45} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Continuing to improve as expected
                  </p>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Blood oxygen</span>
                    <span className="text-sm font-medium">98% (normal)</span>
                  </div>
                  <Progress value={90} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Now within healthy range
                  </p>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Heart rate recovery</span>
                    <span className="text-sm font-medium">+8% improvement</span>
                  </div>
                  <Progress value={60} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Making good progress
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-muted/10 p-4 rounded-lg">
              <h3 className="font-medium mb-3">Recent Metrics</h3>
              
              <div className="space-y-2">
                {healthMetrics.slice(0, 3).map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">
                        {metric.type === 'heartRate' ? 'Heart Rate' :
                         metric.type === 'bloodPressure' ? 'Blood Pressure' :
                         metric.type === 'respiratoryRate' ? 'Respiratory Rate' :
                         'Oxygen Level'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(metric.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {metric.value} {metric.unit}
                      </p>
                      {!metric.isSynced && (
                        <Badge variant="secondary" className="text-xs">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1"></div>
                          Not synced
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <Button variant="outline" className="w-full mt-3">
                <PieChart className="h-4 w-4 mr-2" />
                View All Metrics
              </Button>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="h-64 flex items-center justify-center bg-muted rounded-md">
            <p className="text-muted-foreground">Select a feature to explore</p>
          </div>
        );
    }
  };
  
  return (
    <MobileLayout hideNavigation>
      <div className="min-h-screen flex flex-col">
        {/* Top Bar */}
        <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
          <div className="flex items-center">
            <Smartphone className="h-5 w-5 mr-2" />
            <h1 className="text-lg font-bold">Mobile Enhancements</h1>
          </div>
          <div>
            <OfflineStatusIndicator showDetails={true} />
          </div>
        </div>
        
        {/* Main Content */}
        <div 
          {...swipeHandlers} 
          className="flex-1 p-4 overflow-auto"
        >
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>{getFeatureTitle(currentFeature)}</CardTitle>
              <CardDescription>
                {featureDescriptions[currentFeature]}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderFeatureContent()}
            </CardContent>
          </Card>
          
          {/* Navigation Controls */}
          <div className="flex justify-between items-center py-4">
            <Button 
              variant="outline" 
              onClick={handlePrev}
              disabled={currentFeature === featureOrder[0]}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <div className="flex space-x-1">
              {featureOrder.map((feature, index) => (
                <div 
                  key={feature}
                  className={`h-2 w-2 rounded-full ${
                    feature === currentFeature 
                      ? 'bg-primary' 
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <Button 
              variant="outline" 
              onClick={handleNext}
              disabled={currentFeature === featureOrder[featureOrder.length - 1]}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          
          {/* Bottom controls for demos */}
          <div className="mt-4 space-y-2">
            <Button 
              variant={isOffline ? "destructive" : "outline"}
              className="w-full"
              onClick={toggleOfflineMode}
            >
              {isOffline ? (
                <>
                  <WifiOff className="h-4 w-4 mr-2" />
                  Offline Mode (Click to go online)
                </>
              ) : (
                <>
                  <Wifi className="h-4 w-4 mr-2" />
                  Online Mode (Click to simulate offline)
                </>
              )}
            </Button>
            
            <Button 
              variant="default"
              className="w-full" 
              onClick={handleSync}
              disabled={isOffline || isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              {isLoading 
                ? `Syncing Data (${syncProgress}%)` 
                : 'Simulate Data Sync'}
            </Button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default MobileEnhancementsDemo; 