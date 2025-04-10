import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../AuthProvider";
import { motion } from "framer-motion";
import { 
  Battery,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  Clock,
  Brain,
  Heart,
  Activity,
  Zap,
  CheckCircle,
  ChevronRight,
  Play,
  Timer,
  Bookmark,
  Star,
  Moon,
  ZapOff,
  Music,
  Footprints,
  Map,
  Target,
  Puzzle,
  Phone,
  Palette,
  Trees as Tree,
  GraduationCap,
  Dumbbell,
  Loader2,
  Coffee,
  Droplets,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { recoveryApi } from '@/api/supabase-rest'; // Corrected import
import { Progress } from "../ui/progress";

// Create a simple stretch icon since it's not available in lucide
const StretchIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M6 3v12" />
    <path d="M16 7v8h2a2 2 0 0 1 0 4H8" />
    <path d="M18 3a2 2 0 0 1 0 4" />
    <path d="M6 15a2 2 0 0 1 0 4" />
    <path d="M12 18v3" />
    <path d="M12 18h4" />
  </svg>
);

interface EnergyRecoveryRecommendation {
  id: string;
  energy_level: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  energy_type: 'mental' | 'physical' | 'emotional' | 'overall';
  title: string;
  description: string;
  duration_minutes: number;
  effectiveness_score: number;
  suitable_contexts: string[];
  icon: string;
}

interface EnergyLevels {
  mental: number;
  physical: number;
  emotional: number;
  overall: number;
}

export function EnergyRecoveryRecommendations({ 
  energyLevels,
  currentContext = 'work',
  onStartRecovery
}: { 
  energyLevels: EnergyLevels;
  currentContext?: string;
  onStartRecovery?: (recommendation: EnergyRecoveryRecommendation) => void;
}) {
  const { toast } = useToast();
  const { session } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'mental' | 'physical' | 'emotional' | 'overall'>('overall');
  const [recommendations, setRecommendations] = useState<Record<string, EnergyRecoveryRecommendation[]>>({
    mental: [],
    physical: [],
    emotional: [],
    overall: []
  });
  const [favorites, setFavorites] = useState<string[]>([]);
  
  useEffect(() => {
    fetchRecommendations();
  }, []);
  
  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      // Use recoveryApi, handle response, remove session arg
      const { data, error } = await recoveryApi.getAllRecoveryRecommendations();
      if (error) throw error; // Propagate error
      
      // Group recommendations by energy type
      const grouped: Record<string, EnergyRecoveryRecommendation[]> = {
        mental: [],
        physical: [],
        emotional: [],
        overall: []
      };
      
      if (data && Array.isArray(data)) {
        data.forEach((rec: EnergyRecoveryRecommendation) => {
          if (grouped[rec.energy_type]) {
            grouped[rec.energy_type].push(rec);
          }
        });
      }
      
      setRecommendations(grouped);
      
      // TODO: Fetch user favorites when that functionality is added
      
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to load recovery recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getEnergyLevel = (value: number): 'very_low' | 'low' | 'medium' | 'high' | 'very_high' => {
    if (value < 20) return 'very_low';
    if (value < 40) return 'low';
    if (value < 60) return 'medium';
    if (value < 80) return 'high';
    return 'very_high';
  };
  
  const getEnergyIcon = (type: string, value: number) => {
    if (type === 'mental') {
      return <Brain className="h-5 w-5" />;
    } else if (type === 'physical') {
      return <Activity className="h-5 w-5" />;
    } else if (type === 'emotional') {
      return <Heart className="h-5 w-5" />;
    } else {
      // For overall energy
      if (value < 30) {
        return <BatteryLow className="h-5 w-5" />;
      } else if (value < 70) {
        return <BatteryMedium className="h-5 w-5" />;
      } else {
        return <BatteryFull className="h-5 w-5" />;
      }
    }
  };
  
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Brain': return <Brain className="h-5 w-5" />;
      case 'Heart': return <Heart className="h-5 w-5" />;
      case 'Activity': return <Activity className="h-5 w-5" />;
      case 'Moon': return <Moon className="h-5 w-5" />;
      case 'Zap': return <Zap className="h-5 w-5" />;
      case 'ZapOff': return <ZapOff className="h-5 w-5" />;
      case 'Clock': return <Clock className="h-5 w-5" />;
      case 'Timer': return <Timer className="h-5 w-5" />;
      case 'Music': return <Music className="h-5 w-5" />;
      case 'Footprints': return <Footprints className="h-5 w-5" />;
      case 'Map': return <Map className="h-5 w-5" />;
      case 'Target': return <Target className="h-5 w-5" />;
      case 'Puzzle': return <Puzzle className="h-5 w-5" />;
      case 'Phone': return <Phone className="h-5 w-5" />;
      case 'Palette': return <Palette className="h-5 w-5" />;
      case 'Tree': return <Tree className="h-5 w-5" />;
      case 'GraduationCap': return <GraduationCap className="h-5 w-5" />;
      case 'Dumbbell': return <Dumbbell className="h-5 w-5" />;
      case 'Stretch': return <StretchIcon className="h-5 w-5" />;
      default: return <Zap className="h-5 w-5" />;
    }
  };
  
  const toggleFavorite = (recId: string) => {
    if (favorites.includes(recId)) {
      setFavorites(favorites.filter(id => id !== recId));
    } else {
      setFavorites([...favorites, recId]);
    }
    
    // TODO: Save to user preferences when that functionality is added
  };
  
  const getRelevantRecommendations = (type: 'mental' | 'physical' | 'emotional' | 'overall') => {
    const energyLevel = getEnergyLevel(energyLevels[type]);
    const contextRecommendations = recommendations[type].filter(rec => 
      rec.suitable_contexts.includes(currentContext));
    
    // First try to get recommendations that match both energy level and context
    const matchingRecs = contextRecommendations.filter(rec => rec.energy_level === energyLevel);
    
    // If none found, just return all recommendations for this energy type
    return matchingRecs.length > 0 ? matchingRecs : recommendations[type];
  };
  
  const handleStartRecovery = (recommendation: EnergyRecoveryRecommendation) => {
    if (onStartRecovery) {
      onStartRecovery(recommendation);
    } else {
      toast({
        title: "Recovery Started",
        description: `Starting "${recommendation.title}" for ${recommendation.duration_minutes} minutes.`,
      });
    }
  };
  
  const getProgressColor = (value: number): string => {
    if (value < 30) return "bg-red-500";
    if (value < 50) return "bg-orange-500";
    if (value < 70) return "bg-yellow-500";
    return "bg-green-500";
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Energy Recovery Recommendations
        </CardTitle>
        <CardDescription>
          Personalized recommendations based on your current energy levels
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-md"></span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Brain className="h-4 w-4" /> Mental Energy
                </div>
                <Progress value={energyLevels.mental} className={getProgressColor(energyLevels.mental)} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Activity className="h-4 w-4" /> Physical Energy
                </div>
                <Progress value={energyLevels.physical} className={getProgressColor(energyLevels.physical)} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Heart className="h-4 w-4" /> Emotional Energy
                </div>
                <Progress value={energyLevels.emotional} className={getProgressColor(energyLevels.emotional)} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Battery className="h-4 w-4" /> Overall Energy
                </div>
                <Progress value={energyLevels.overall} className={getProgressColor(energyLevels.overall)} />
              </div>
            </div>
            
            <Tabs defaultValue="overall" value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="overall" className="flex items-center gap-1">
                  <Battery className="h-4 w-4" />
                  <span className="hidden sm:inline">Overall</span>
                </TabsTrigger>
                <TabsTrigger value="mental" className="flex items-center gap-1">
                  <Brain className="h-4 w-4" />
                  <span className="hidden sm:inline">Mental</span>
                </TabsTrigger>
                <TabsTrigger value="physical" className="flex items-center gap-1">
                  <Activity className="h-4 w-4" />
                  <span className="hidden sm:inline">Physical</span>
                </TabsTrigger>
                <TabsTrigger value="emotional" className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span className="hidden sm:inline">Emotional</span>
                </TabsTrigger>
              </TabsList>
              
              {['overall', 'mental', 'physical', 'emotional'].map(type => (
                <TabsContent key={type} value={type} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getRelevantRecommendations(type as any).map(recommendation => (
                      <motion.div
                        key={recommendation.id}
                        whileHover={{ scale: 1.02 }}
                        className="group"
                      >
                        <Card className="overflow-hidden h-full">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2">
                                {getIconComponent(recommendation.icon)}
                                <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                              </div>
                              <div className="flex gap-1">
                                <Badge>{recommendation.energy_level.replace('_', ' ')}</Badge>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8" 
                                  onClick={() => toggleFavorite(recommendation.id)}
                                >
                                  {favorites.includes(recommendation.id) ? (
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  ) : (
                                    <Star className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            <CardDescription>
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span>{recommendation.duration_minutes} minutes</span>
                                <div className="flex items-center ml-2">
                                  <span className="text-xs text-muted-foreground mr-1">Effectiveness:</span>
                                  <div className="flex">
                                    {Array.from({ length: recommendation.effectiveness_score }).map((_, i) => (
                                      <div key={i} className="w-1 h-3 bg-primary rounded-sm mr-[2px]" />
                                    ))}
                                    {Array.from({ length: 10 - recommendation.effectiveness_score }).map((_, i) => (
                                      <div key={i} className="w-1 h-3 bg-muted rounded-sm mr-[2px]" />
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <p className="text-sm">{recommendation.description}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {recommendation.suitable_contexts.map(context => (
                                <Badge key={context} variant="outline" className="text-xs">
                                  {context}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button 
                              variant="default" 
                              size="sm"
                              className="w-full"
                              onClick={() => handleStartRecovery(recommendation)}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Start Recovery
                            </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                  
                  {getRelevantRecommendations(type as any).length === 0 && (
                    <Alert>
                      <AlertTitle>No recommendations available</AlertTitle>
                      <AlertDescription>
                        We don't have specific recommendations for your current energy level and context.
                        Try switching to a different energy type or check back later.
                      </AlertDescription>
                    </Alert>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 