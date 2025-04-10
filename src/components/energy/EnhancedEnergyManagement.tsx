import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useAuth } from "../AuthProvider";
import { 
  Battery, 
  Brain, 
  Heart, 
  Activity, 
  Clock, 
  Zap, 
  FlaskConical, 
  BarChart4,
  Star
} from "lucide-react";
import { EnergyManagement } from "./EnergyManagement";
import { EnergyRecoveryRecommendations } from "./EnergyRecoveryRecommendations";
import { AntiFatigueInterventions } from "./AntiFatigueInterventions";
import { UltradianRhythmTracker } from "./UltradianRhythmTracker";
import { FavoriteRecoveryStrategies } from "./FavoriteRecoveryStrategies";

export function EnhancedEnergyManagement() {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("tracking");
  const [energyLevels, setEnergyLevels] = useState<{
    mental: number;
    physical: number;
    emotional: number;
    overall: number;
  }>({
    mental: 70,
    physical: 60,
    emotional: 75,
    overall: 68
  });
  
  // These will be updated by child components
  const updateEnergyLevels = (levels: {
    mental: number;
    physical: number;
    emotional: number;
    overall: number;
  }) => {
    setEnergyLevels(levels);
  };
  
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Energy Management System</h1>
        <p className="text-muted-foreground">
          Track, analyze, and optimize your mental, physical, and emotional energy
        </p>
      </div>
      
      <Tabs defaultValue="tracking" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="tracking" className="flex items-center gap-1">
            <Battery className="h-4 w-4" />
            <span className="hidden sm:inline">Energy Tracking</span>
          </TabsTrigger>
          <TabsTrigger value="recovery" className="flex items-center gap-1">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Recovery</span>
          </TabsTrigger>
          <TabsTrigger value="interventions" className="flex items-center gap-1">
            <FlaskConical className="h-4 w-4" />
            <span className="hidden sm:inline">Anti-Fatigue</span>
          </TabsTrigger>
          <TabsTrigger value="rhythms" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Rhythms</span>
          </TabsTrigger>
          <TabsTrigger value="favorites" className="flex items-center gap-1">
            <Star className="h-4 w-4" />
            <span className="hidden sm:inline">Favorites</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tracking" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Current Energy Levels</CardTitle>
                <CardDescription>
                  Your mental, physical, and emotional energy status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold border-4 ${getEnergyColorClass(energyLevels.mental)}`}>
                      {energyLevels.mental}%
                    </div>
                    <div className="flex items-center text-sm font-medium">
                      <Brain className="h-4 w-4 mr-1" /> Mental
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold border-4 ${getEnergyColorClass(energyLevels.physical)}`}>
                      {energyLevels.physical}%
                    </div>
                    <div className="flex items-center text-sm font-medium">
                      <Activity className="h-4 w-4 mr-1" /> Physical
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold border-4 ${getEnergyColorClass(energyLevels.emotional)}`}>
                      {energyLevels.emotional}%
                    </div>
                    <div className="flex items-center text-sm font-medium">
                      <Heart className="h-4 w-4 mr-1" /> Emotional
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold border-4 ${getEnergyColorClass(energyLevels.overall)}`}>
                      {energyLevels.overall}%
                    </div>
                    <div className="flex items-center text-sm font-medium">
                      <Battery className="h-4 w-4 mr-1" /> Overall
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <EnergyManagement />
        </TabsContent>
        
        <TabsContent value="recovery" className="space-y-4">
          <EnergyRecoveryRecommendations 
            energyLevels={energyLevels}
            currentContext="work"
            onStartRecovery={(recommendation) => {
              // This would be implemented to start a recovery session
              console.log("Starting recovery:", recommendation);
            }}
          />
        </TabsContent>
        
        <TabsContent value="interventions" className="space-y-4">
          <AntiFatigueInterventions 
            mentalFatigue={100 - energyLevels.mental}
            physicalFatigue={100 - energyLevels.physical}
            emotionalFatigue={100 - energyLevels.emotional}
          />
        </TabsContent>
        
        <TabsContent value="rhythms" className="space-y-4">
          <UltradianRhythmTracker />
        </TabsContent>
        
        <TabsContent value="favorites" className="space-y-4">
          <FavoriteRecoveryStrategies />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper function to get color classes based on energy level
function getEnergyColorClass(value: number): string {
  if (value < 30) return 'border-red-500 text-red-500';
  if (value < 50) return 'border-orange-500 text-orange-500';
  if (value < 70) return 'border-yellow-500 text-yellow-500';
  return 'border-green-500 text-green-500';
} 