import React, { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger,
  Button,
} from "../components/ui";
import {
  Cigarette,
  Brain,
  Clock,
  BarChart3,
  Flame,
  Lightbulb,
  Zap,
} from "lucide-react";
import { NicotineConsumptionTracker } from "../components/nicotine/NicotineConsumptionTracker";
import { FocusNicotineInsights } from "../components/nicotine/FocusNicotineInsights";
import { CravingManager } from "../components/nicotine/CravingManager";
import { Link } from "react-router-dom";

export default function NicotineAndFocus() {
  const session = useSession();
  const [activeTab, setActiveTab] = useState<string>("track");
  const [isCravingManagerOpen, setIsCravingManagerOpen] = useState<boolean>(false);
  
  const handleCravingComplete = (data: { resisted: boolean; duration: number; intensity: number }) => {
    console.log("Craving data:", data);
    setIsCravingManagerOpen(false);
  };
  
  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto py-8 px-4 md:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-800 dark:text-emerald-400 mb-2">
            Nicotine & Focus Tracking
          </h1>
          <p className="text-lg text-muted-foreground">
            Monitor your nicotine consumption, manage cravings, and analyze the impact on your focus
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full md:w-auto"
          >
            <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
              <TabsTrigger value="track">
                <Cigarette className="mr-2 h-4 w-4" />
                Track
              </TabsTrigger>
              <TabsTrigger value="insights">
                <Brain className="mr-2 h-4 w-4" />
                Insights
              </TabsTrigger>
              <TabsTrigger value="resources">
                <Lightbulb className="mr-2 h-4 w-4" />
                Resources
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button 
            onClick={() => setIsCravingManagerOpen(true)}
            className="w-full md:w-auto bg-amber-600 hover:bg-amber-700 flex items-center"
          >
            <Flame className="mr-2 h-4 w-4" />
            Manage Craving
          </Button>
        </div>
        
        <div className="mt-2">
          {activeTab === "track" && (
            <div className="grid grid-cols-1 gap-6">
              <NicotineConsumptionTracker 
                onDataUpdated={() => console.log("Data updated")} 
              />
              
              <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-lg border border-amber-100 dark:border-amber-900">
                <div className="flex gap-3 items-start">
                  <div className="mt-1">
                    <Zap className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-1">Quick Tip: Timing Matters</h3>
                    <p className="text-muted-foreground">
                      Research shows that nicotine's effects on cognition follow an inverted U-shaped curve. For optimal focus benefits, 
                      try timing your consumption 15-20 minutes before focus sessions rather than during them. 
                      This can reduce the distracting effects of cravings while maximizing cognitive enhancement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === "insights" && (
            <div className="grid grid-cols-1 gap-6">
              <FocusNicotineInsights />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-lg border border-emerald-100 dark:border-emerald-900">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-5 w-5 text-emerald-600" />
                    <h3 className="font-medium">Focus Impact</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Nicotine temporarily enhances attention but can lead to reduced sustained focus as effects wear off. 
                    Track your patterns to find your optimal balance.
                  </p>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-lg border border-blue-100 dark:border-blue-900">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium">Recovery Timeline</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Cognitive function typically begins improving 2-4 weeks after reducing nicotine, with significant 
                    enhancements in focus and concentration after 3 months.
                  </p>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-950/40 p-4 rounded-lg border border-purple-100 dark:border-purple-900">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <h3 className="font-medium">Productivity Data</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Our user data shows an average 27% increase in sustained focus time after reducing nicotine 
                    consumption by half over a 30-day period.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === "resources" && (
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border shadow-sm">
                <h2 className="text-2xl font-semibold mb-4">Focus-Optimizing Resources</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Science-Based Strategies</h3>
                    <ul className="space-y-3">
                      <li className="flex gap-3">
                        <div className="bg-emerald-100 dark:bg-emerald-900/40 p-2 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                          <Brain className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Implementation Intentions</h4>
                          <p className="text-sm text-muted-foreground">
                            When a craving hits during focus time, having a pre-planned response (e.g., "I'll take 3 deep breaths and drink water") 
                            reduces the cognitive load of decision-making.
                          </p>
                        </div>
                      </li>
                      
                      <li className="flex gap-3">
                        <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                          <Clock className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Craving Surfing Technique</h4>
                          <p className="text-sm text-muted-foreground">
                            Observe cravings like waves that rise, peak, and fall over 3-5 minutes. Instead of fighting the feeling, 
                            notice it with curiosity until it naturally subsides.
                          </p>
                        </div>
                      </li>
                      
                      <li className="flex gap-3">
                        <div className="bg-purple-100 dark:bg-purple-900/40 p-2 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                          <Zap className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Pomodoro + Nicotine Scheduling</h4>
                          <p className="text-sm text-muted-foreground">
                            If using nicotine, align consumption with your 5-minute Pomodoro breaks rather than during focus sessions for 
                            optimal cognitive enhancement timing.
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Recommended Reading</h3>
                    <ul className="space-y-2">
                      <li className="flex gap-2">
                        <Lightbulb className="h-5 w-5 text-amber-500 flex-shrink-0" />
                        <span>"Atomic Habits" by James Clear - Chapter on breaking addiction loops</span>
                      </li>
                      <li className="flex gap-2">
                        <Lightbulb className="h-5 w-5 text-amber-500 flex-shrink-0" />
                        <span>"The Craving Mind" by Judson Brewer - Mindfulness-based approach</span>
                      </li>
                      <li className="flex gap-2">
                        <Lightbulb className="h-5 w-5 text-amber-500 flex-shrink-0" />
                        <span>"Deep Work" by Cal Newport - Focusing without stimulants</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-100 dark:border-blue-900">
                    <h3 className="font-medium mb-2">Need Additional Support?</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      While Easier Focus helps you understand the relationship between nicotine and focus, you might want specialized support for reducing consumption.
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Find Support Resources</Button>
                      <Button className="bg-emerald-600 hover:bg-emerald-700" size="sm">Connect with Coach</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Craving Manager Dialog */}
      <CravingManager 
        isOpen={isCravingManagerOpen}
        onClose={() => setIsCravingManagerOpen(false)}
        onCravingHandled={handleCravingComplete}
      />
    </div>
  );
} 