import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TopNav } from "@/components/layout/TopNav"
import { ToolAnalyticsWrapper } from "@/components/tools/ToolAnalyticsWrapper"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EnergyFocusIntegration } from "@/components/energy/EnergyFocusIntegration"
import { BatteryCharging, Brain, Zap, Activity, LineChart } from "lucide-react"

export default function EnergyFocus() {
  const [activeTab, setActiveTab] = useState("integration")

  return (
    <ToolAnalyticsWrapper 
      toolName="energy-focus"
      toolType="productivity"
      toolSettings={{}}
    >
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto p-4 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BatteryCharging className="h-6 w-6 text-primary" />
                  <CardTitle>Energy & Focus Management</CardTitle>
                </div>
                <CardDescription>
                  Track your energy levels and optimize your focus sessions for peak productivity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="integration" className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <span className="hidden sm:inline">Energy-Focus Integration</span>
                      <span className="sm:hidden">Integration</span>
                    </TabsTrigger>
                    <TabsTrigger value="metrics" className="flex items-center gap-2">
                      <LineChart className="h-4 w-4" />
                      <span className="hidden sm:inline">Performance Metrics</span>
                      <span className="sm:hidden">Metrics</span>
                    </TabsTrigger>
                    <TabsTrigger value="recommendations" className="flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      <span className="hidden sm:inline">Recommendations</span>
                      <span className="sm:hidden">Tips</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="integration" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        <EnergyFocusIntegration />
                      </div>
                      <div>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Activity className="h-5 w-5 text-primary" />
                              Energy Optimization
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div>
                                <h3 className="font-medium mb-2">Energy-Focus Connection</h3>
                                <p className="text-sm text-muted-foreground">
                                  Your energy levels directly impact your ability to focus. Optimal energy (not too high, not too low) typically yields the best focus results.
                                </p>
                              </div>
                              
                              <div className="space-y-2">
                                <h3 className="font-medium">Tips for Energy Management</h3>
                                <ul className="text-sm text-muted-foreground space-y-2">
                                  <li className="flex gap-2">
                                    <span className="text-primary">•</span>
                                    <span>Schedule challenging tasks during your energy peaks</span>
                                  </li>
                                  <li className="flex gap-2">
                                    <span className="text-primary">•</span>
                                    <span>Take short breaks before energy dips become severe</span>
                                  </li>
                                  <li className="flex gap-2">
                                    <span className="text-primary">•</span>
                                    <span>Stay hydrated - even mild dehydration reduces focus</span>
                                  </li>
                                  <li className="flex gap-2">
                                    <span className="text-primary">•</span>
                                    <span>Use 90-minute work cycles aligned with ultradian rhythms</span>
                                  </li>
                                  <li className="flex gap-2">
                                    <span className="text-primary">•</span>
                                    <span>Balance protein, complex carbs and healthy fats for sustained energy</span>
                                  </li>
                                </ul>
                              </div>
                              
                              <div>
                                <h3 className="font-medium mb-2">The Perfect Balance</h3>
                                <p className="text-sm text-muted-foreground">
                                  Your personal data will help identify your optimal energy zone for peak focus and productivity. Track consistently for better insights.
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="metrics" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Energy Patterns</CardTitle>
                          <CardDescription>
                            Your energy fluctuations throughout the day
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="h-80 flex items-center justify-center">
                          <div className="text-center text-muted-foreground">
                            <p>Track your energy levels regularly to see patterns emerge here</p>
                            <p className="text-sm mt-2">Minimum 5 days of data needed</p>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Focus Performance</CardTitle>
                          <CardDescription>
                            How focus quality correlates with energy levels
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="h-80 flex items-center justify-center">
                          <div className="text-center text-muted-foreground">
                            <p>Record focus sessions to visualize the energy-focus relationship</p>
                            <p className="text-sm mt-2">Minimum 5 sessions of data needed</p>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="md:col-span-2">
                        <CardHeader>
                          <CardTitle className="text-lg">Energy Insights</CardTitle>
                          <CardDescription>
                            Personalized analysis of your energy patterns
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <p className="text-muted-foreground">
                              Your personal energy insights will appear here as you log more data. We analyze:
                            </p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                              <div className="p-4 border rounded-lg">
                                <h3 className="font-medium mb-2 flex items-center gap-2">
                                  <span className="h-2 w-2 rounded-full bg-primary"></span>
                                  Peak Energy Times
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  When your energy naturally peaks during the day
                                </p>
                              </div>
                              
                              <div className="p-4 border rounded-lg">
                                <h3 className="font-medium mb-2 flex items-center gap-2">
                                  <span className="h-2 w-2 rounded-full bg-primary"></span>
                                  Optimal Focus Level
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  Your ideal energy level for maximum focus
                                </p>
                              </div>
                              
                              <div className="p-4 border rounded-lg">
                                <h3 className="font-medium mb-2 flex items-center gap-2">
                                  <span className="h-2 w-2 rounded-full bg-primary"></span>
                                  Energy Disruptors
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  Factors that most impact your energy levels
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="recommendations" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Morning Energy</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            <li className="flex gap-3">
                              <div className="text-primary mt-0.5">•</div>
                              <div>
                                <p className="font-medium">Hydrate First</p>
                                <p className="text-sm text-muted-foreground">Drink 16oz of water with lemon upon waking to rehydrate after sleep.</p>
                              </div>
                            </li>
                            
                            <li className="flex gap-3">
                              <div className="text-primary mt-0.5">•</div>
                              <div>
                                <p className="font-medium">Natural Light Exposure</p>
                                <p className="text-sm text-muted-foreground">Get 10+ minutes of morning sunlight to regulate circadian rhythm.</p>
                              </div>
                            </li>
                            
                            <li className="flex gap-3">
                              <div className="text-primary mt-0.5">•</div>
                              <div>
                                <p className="font-medium">Protein-Rich Breakfast</p>
                                <p className="text-sm text-muted-foreground">Include 20-30g protein in your first meal for steady energy release.</p>
                              </div>
                            </li>
                            
                            <li className="flex gap-3">
                              <div className="text-primary mt-0.5">•</div>
                              <div>
                                <p className="font-medium">Move Your Body</p>
                                <p className="text-sm text-muted-foreground">Even 5 minutes of movement increases circulation and energy.</p>
                              </div>
                            </li>
                          </ul>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Midday Optimization</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            <li className="flex gap-3">
                              <div className="text-primary mt-0.5">•</div>
                              <div>
                                <p className="font-medium">Strategic Caffeine</p>
                                <p className="text-sm text-muted-foreground">Time caffeine 90 minutes before peak performance needs.</p>
                              </div>
                            </li>
                            
                            <li className="flex gap-3">
                              <div className="text-primary mt-0.5">•</div>
                              <div>
                                <p className="font-medium">Microbreaks</p>
                                <p className="text-sm text-muted-foreground">Take 2-minute breaks every 25-30 minutes to prevent mental fatigue.</p>
                              </div>
                            </li>
                            
                            <li className="flex gap-3">
                              <div className="text-primary mt-0.5">•</div>
                              <div>
                                <p className="font-medium">Lunch Optimization</p>
                                <p className="text-sm text-muted-foreground">Moderate portions with balanced macros to avoid post-lunch crashes.</p>
                              </div>
                            </li>
                            
                            <li className="flex gap-3">
                              <div className="text-primary mt-0.5">•</div>
                              <div>
                                <p className="font-medium">Breath Work</p>
                                <p className="text-sm text-muted-foreground">Use 4-7-8 breathing (4s inhale, 7s hold, 8s exhale) for energy reset.</p>
                              </div>
                            </li>
                          </ul>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Afternoon Rescue</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            <li className="flex gap-3">
                              <div className="text-primary mt-0.5">•</div>
                              <div>
                                <p className="font-medium">Nature Break</p>
                                <p className="text-sm text-muted-foreground">Take a 10-minute outdoor walk to boost energy and mental clarity.</p>
                              </div>
                            </li>
                            
                            <li className="flex gap-3">
                              <div className="text-primary mt-0.5">•</div>
                              <div>
                                <p className="font-medium">Cold Exposure</p>
                                <p className="text-sm text-muted-foreground">Splash cold water on face or take a cold shower for an energy boost.</p>
                              </div>
                            </li>
                            
                            <li className="flex gap-3">
                              <div className="text-primary mt-0.5">•</div>
                              <div>
                                <p className="font-medium">Snack Strategically</p>
                                <p className="text-sm text-muted-foreground">Nuts, dark chocolate, or apple with nut butter for sustained energy.</p>
                              </div>
                            </li>
                            
                            <li className="flex gap-3">
                              <div className="text-primary mt-0.5">•</div>
                              <div>
                                <p className="font-medium">Task Variety</p>
                                <p className="text-sm text-muted-foreground">Switch between different types of tasks to avoid mental fatigue.</p>
                              </div>
                            </li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </ToolAnalyticsWrapper>
  )
} 