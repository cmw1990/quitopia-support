import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { InfoIcon, Footprints, Gift, ShoppingCart, ChevronRight, ArrowUp, Check } from 'lucide-react';
import { StepTracker } from '../components/health/StepTracker';
import { StepIncentives } from '../components/health/StepIncentives';
import NRTDirectory from '../components/NRTDirectory/NRTDirectory';
import { motion } from 'framer-motion';

const EnhancedSupportPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Enhanced Support Tools | Mission Fresh</title>
      </Helmet>
      
      <div className="container max-w-7xl py-8">
        <header className="mb-10">
          <div className="flex justify-between items-start gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Enhanced Support Tools</h1>
              <p className="text-muted-foreground mt-1">
                Holistic tools to support your quit smoking journey
              </p>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Alert className="max-w-md">
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Enhanced Features Active</AlertTitle>
                <AlertDescription>
                  Stay active and earn rewards towards smokeless alternatives.
                </AlertDescription>
              </Alert>
            </motion.div>
          </div>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="grid gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle>Activity & Rewards Connection</CardTitle>
                      <Badge className="bg-green-500 hover:bg-green-600">New Feature</Badge>
                    </div>
                    <CardDescription>
                      Track your steps and earn discounts on smokeless nicotine products
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium flex items-center gap-2">
                          <Footprints className="h-4 w-4 text-primary" />
                          Step Tracking
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Monitor your daily activity and build healthy habits
                        </p>
                        <StepTracker />
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium flex items-center gap-2">
                          <Gift className="h-4 w-4 text-primary" />
                          Step Incentives
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Convert your steps into exclusive NRT product discounts
                        </p>
                        <StepIncentives />
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t">
                      <h3 className="text-sm font-medium mb-2">How It Works</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex flex-col items-center text-center p-3 bg-muted/30 rounded-lg">
                          <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center mb-2">
                            <Footprints className="h-4 w-4 text-primary" />
                          </div>
                          <h4 className="text-sm font-medium">Track Steps</h4>
                          <p className="text-xs text-muted-foreground">Connect your health app and track daily activity</p>
                        </div>
                        
                        <div className="flex flex-col items-center text-center p-3 bg-muted/30 rounded-lg">
                          <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center mb-2">
                            <ArrowUp className="h-4 w-4 text-primary" />
                          </div>
                          <h4 className="text-sm font-medium">Reach Milestones</h4>
                          <p className="text-xs text-muted-foreground">Accumulate steps to unlock reward tiers</p>
                        </div>
                        
                        <div className="flex flex-col items-center text-center p-3 bg-muted/30 rounded-lg">
                          <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center mb-2">
                            <Check className="h-4 w-4 text-primary" />
                          </div>
                          <h4 className="text-sm font-medium">Claim Rewards</h4>
                          <p className="text-xs text-muted-foreground">Redeem step incentives for NRT product discounts</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle>Smokeless Nicotine Directory</CardTitle>
                      <Badge className="bg-blue-500 hover:bg-blue-600">Enhanced</Badge>
                    </div>
                    <CardDescription>
                      Comprehensive directory of smokeless nicotine alternatives with health impact information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="directory">
                      <TabsList className="mb-4">
                        <TabsTrigger value="directory">Product Directory</TabsTrigger>
                        <TabsTrigger value="rewards">Apply Rewards</TabsTrigger>
                        <TabsTrigger value="health">Health Impacts</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="directory">
                        <div className="h-[500px] overflow-auto border rounded-md p-4">
                          <NRTDirectory />
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="rewards">
                        <div className="space-y-4 p-4 border rounded-md">
                          <Alert>
                            <Gift className="h-4 w-4" />
                            <AlertTitle>Redeem Your Step Rewards</AlertTitle>
                            <AlertDescription>
                              Step incentives can be applied at checkout when purchasing any eligible nicotine replacement product.
                            </AlertDescription>
                          </Alert>
                          
                          <div className="grid gap-4">
                            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                              <div>
                                <h4 className="text-sm font-medium">10% Discount</h4>
                                <p className="text-xs text-muted-foreground">For 25,000 steps milestone</p>
                              </div>
                              <Button size="sm" variant="outline">Apply</Button>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                              <div>
                                <h4 className="text-sm font-medium">25% Discount</h4>
                                <p className="text-xs text-muted-foreground">For 100,000 steps milestone</p>
                              </div>
                              <Button size="sm" variant="outline">Apply</Button>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                              <div>
                                <h4 className="text-sm font-medium">50% Discount</h4>
                                <p className="text-xs text-muted-foreground">For 500,000 steps milestone</p>
                              </div>
                              <Button size="sm" variant="outline">Apply</Button>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="health">
                        <div className="space-y-4 p-4 border rounded-md">
                          <h3 className="text-sm font-medium">Health Impact Comparison</h3>
                          
                          <div className="grid gap-4">
                            <div className="p-3 bg-muted/30 rounded-lg">
                              <h4 className="text-sm font-medium mb-2">Gum Health Impact</h4>
                              <div className="flex items-center space-x-4">
                                <div className="w-20 text-center">
                                  <div className="text-xs font-medium mb-1">Cigarettes</div>
                                  <div className="h-16 w-4 mx-auto bg-red-500 rounded-full relative">
                                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold">2/10</div>
                                  </div>
                                </div>
                                
                                <div className="w-20 text-center">
                                  <div className="text-xs font-medium mb-1">Patches</div>
                                  <div className="h-16 w-4 mx-auto bg-green-500 rounded-full relative">
                                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold">10/10</div>
                                  </div>
                                </div>
                                
                                <div className="w-20 text-center">
                                  <div className="text-xs font-medium mb-1">Gum</div>
                                  <div className="h-16 w-4 mx-auto bg-yellow-500 rounded-full relative">
                                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold">4/10</div>
                                  </div>
                                </div>
                                
                                <div className="w-20 text-center">
                                  <div className="text-xs font-medium mb-1">Pouches</div>
                                  <div className="h-16 w-4 mx-auto bg-yellow-500 rounded-full relative">
                                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold">7/10</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="p-3 bg-muted/30 rounded-lg">
                              <h4 className="text-sm font-medium mb-2">Lung Health Impact</h4>
                              <div className="flex items-center space-x-4">
                                <div className="w-20 text-center">
                                  <div className="text-xs font-medium mb-1">Cigarettes</div>
                                  <div className="h-16 w-4 mx-auto bg-red-500 rounded-full relative">
                                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold">1/10</div>
                                  </div>
                                </div>
                                
                                <div className="w-20 text-center">
                                  <div className="text-xs font-medium mb-1">Patches</div>
                                  <div className="h-16 w-4 mx-auto bg-green-500 rounded-full relative">
                                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold">9/10</div>
                                  </div>
                                </div>
                                
                                <div className="w-20 text-center">
                                  <div className="text-xs font-medium mb-1">Inhalers</div>
                                  <div className="h-16 w-4 mx-auto bg-green-500 rounded-full relative">
                                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold">8/10</div>
                                  </div>
                                </div>
                                
                                <div className="w-20 text-center">
                                  <div className="text-xs font-medium mb-1">Spray</div>
                                  <div className="h-16 w-4 mx-auto bg-yellow-500 rounded-full relative">
                                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold">7/10</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
          
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Benefits Overview</CardTitle>
                  <CardDescription>
                    Enhanced features to support your journey
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-primary/5 rounded-lg flex items-start gap-3">
                    <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                      <ShoppingCart className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Comprehensive NRT Directory</h3>
                      <p className="text-xs text-muted-foreground">Browse our expanded catalog of smokeless nicotine alternatives with detailed health information.</p>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-primary/5 rounded-lg flex items-start gap-3">
                    <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                      <Footprints className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Step-Based Incentives</h3>
                      <p className="text-xs text-muted-foreground">Get rewarded for physical activity with discounts on smokeless alternatives.</p>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-primary/5 rounded-lg flex items-start gap-3">
                    <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                      <InfoIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Health Impact Analysis</h3>
                      <p className="text-xs text-muted-foreground">Compare the health effects of different nicotine products to make informed decisions.</p>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-primary/5 rounded-lg flex items-start gap-3">
                    <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                      <Gift className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Exclusive Discounts</h3>
                      <p className="text-xs text-muted-foreground">Unlock up to 50% off on smokeless nicotine products by staying active.</p>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    Get Started
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Alert className="bg-amber-50 border-amber-200">
                <InfoIcon className="h-4 w-4 text-amber-600" />
                <AlertTitle>Health Device Integration</AlertTitle>
                <AlertDescription className="text-amber-800">
                  <p className="mb-2">Connect your health tracking device or app to automatically sync your steps and unlock rewards.</p>
                  <Button size="sm" variant="outline" className="mt-1 border-amber-300 hover:bg-amber-100 hover:text-amber-900">
                    Connect Device
                  </Button>
                </AlertDescription>
              </Alert>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EnhancedSupportPage; 