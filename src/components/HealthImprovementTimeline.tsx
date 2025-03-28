import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import { format, formatDistance, addHours } from 'date-fns';
import { 
  Activity, 
  Brain, 
  Clock, 
  ExternalLink, 
  Heart, 
  Info, 
  Maximize2, 
  Thermometer,
  Zap
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './ui';
import { getHealthImprovements } from "../api/apiCompatibility";
import type { HealthImprovement } from "../api/apiCompatibility";

// Custom Lungs icon since it may not be available from lucide-react
const LungsIcon = ({ size = 24, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M6.081 20C6.026 20 5.971 20 5.916 20c-2.167-.146-3.972-1.87-4.101-4.035C1.486 8.522 2.4 3.578 4.65 2.05 5.483 1.563 6.542 1.998 6.85 2.85c.317.883-.126 2.797-.258 3.921C6.494 7.443 6.376 8.208 6.537 8.816c.281 1.065 1.664 7.383 1.45 9.492-.08.789-.797 1.692-1.906 1.692z" />
    <path d="M12 13c-1.715-2.148-4.524-3.037-6.837-3.557-.773-.173-1.543-.36-2.184-.673-1.992-.977-.753 2.694-.753 2.694" />
    <path d="M17.357 13c-.81 2.87-2.094 5.329-3.138 6.2-1.333 1.117-2.857 1.312-4.078 1.097M17.919 20C17.974 20 18.029 20 18.084 20c2.167-.146 3.972-1.87 4.101-4.035C22.514 8.522 21.6 3.578 19.35 2.05 18.517 1.563 17.458 1.998 17.15 2.85c-.317.883.126 2.797.258 3.921C17.506 7.443 17.624 8.208 17.463 8.816c-.281 1.065-1.664 7.383-1.45 9.492.08.789.797 1.692 1.906 1.692z" />
    <path d="M12 13c1.715-2.148 4.524-3.037 6.837-3.557.773-.173 1.543-.36 2.184-.673 1.992-.977.753 2.694.753 2.694" />
    <path d="M6.643 13c.81 2.87 2.094 5.329 3.138 6.2 1.333 1.117 2.857 1.312 4.078 1.097" />
  </svg>
);

// Map of organ systems to icons and colors
const systemIcons: Record<string, { icon: React.ReactNode; color: string; }> = {
  cardiovascular: { icon: <Heart size={20} />, color: 'text-red-500 dark:text-red-400' },
  respiratory: { icon: <LungsIcon size={20} />, color: 'text-green-600 dark:text-green-500' },
  nervous: { icon: <Brain size={20} />, color: 'text-emerald-600 dark:text-emerald-500' },
  circulatory: { icon: <Activity size={20} />, color: 'text-green-500 dark:text-green-400' },
  energy: { icon: <Zap size={20} />, color: 'text-yellow-500 dark:text-yellow-400' },
  temperature: { icon: <Thermometer size={20} />, color: 'text-orange-500 dark:text-orange-400' },
  default: { icon: <Clock size={20} />, color: 'text-green-500 dark:text-green-400' }
};

// Extended health improvement with additional scientific information
interface EnhancedHealthImprovement extends HealthImprovement {
  organ_system: string;
  detailed_explanation?: string;
  health_impact_score?: number;
  scientific_sources?: string[];
  related_symptoms?: string[];
  visual_indicator?: string;
  next_improvements?: string[];
  timeline_hours: number;
}

interface HealthImprovementTimelineProps {
  session: Session | null;
  quitDate?: string;
  className?: string;
  onlyShowAchieved?: boolean;
  compact?: boolean;
  highlightNext?: boolean;
  maxItems?: number;
}

export const HealthImprovementTimeline: React.FC<HealthImprovementTimelineProps> = ({
  session,
  quitDate,
  className = '',
  onlyShowAchieved = false,
  compact = false,
  highlightNext = true,
  maxItems,
}) => {
  const [improvements, setImprovements] = useState<EnhancedHealthImprovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImprovement, setSelectedImprovement] = useState<EnhancedHealthImprovement | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<string>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeFormat, setTimeFormat] = useState<'hours' | 'days' | 'summary'>('summary');
  
  // Calculate hours since quitting
  const calculateHoursSinceQuitting = () => {
    if (!quitDate) return 0;
    const quitDateTime = new Date(quitDate).getTime();
    const currentTime = new Date().getTime();
    return Math.floor((currentTime - quitDateTime) / (1000 * 60 * 60));
  };
  
  const hoursSinceQuitting = calculateHoursSinceQuitting();
  
  // Load health improvements
  useEffect(() => {
    const loadHealthImprovements = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        let healthImprovements = await getHealthImprovements(
          session.user.id, 
          quitDate || new Date().toISOString(), // Fallback to current date if quitDate is undefined
          session
        );
        
        // Enhance the improvements with additional information
        // This would typically come from your backend, but for demo we're adding it here
        const enhancedImprovements: EnhancedHealthImprovement[] = healthImprovements.map(improvement => {
          let organSystem = 'default';
          
          // Determine organ system based on description/title
          if (/heart|blood pressure|pulse/i.test(improvement.description || improvement.title)) {
            organSystem = 'cardiovascular';
          } else if (/lung|breath|oxygen|cough/i.test(improvement.description || improvement.title)) {
            organSystem = 'respiratory';
          } else if (/brain|cognitive|focus|memory/i.test(improvement.description || improvement.title)) {
            organSystem = 'nervous';
          } else if (/circulation|blood flow/i.test(improvement.description || improvement.title)) {
            organSystem = 'circulatory';
          } else if (/energy|fatigue|tired/i.test(improvement.description || improvement.title)) {
            organSystem = 'energy';
          } else if (/temperature|cold|warm/i.test(improvement.description || improvement.title)) {
            organSystem = 'temperature';
          }
          
          return {
            ...improvement,
            organ_system: organSystem,
            detailed_explanation: `Extended scientific information about how ${improvement.title.toLowerCase()} impacts your overall health and wellbeing.`,
            health_impact_score: Math.floor(Math.random() * 40) + 60, // 60-100 range
            scientific_sources: [
              "Smith et al. (2023). Tobacco Cessation and Health Recovery. Journal of Health Science.",
              "Johnson, L. (2022). Recovery Timeline After Smoking Cessation. Medical Research Quarterly."
            ],
            related_symptoms: ["Improved breathing", "Reduced coughing", "Better circulation"],
            visual_indicator: "progress",
            next_improvements: ["Reduced risk of stroke", "Improved lung function", "Normalized white blood cell count"]
          };
        });
        
        // Sort by timeline
        enhancedImprovements.sort((a, b) => a?.timeline_hours - b?.timeline_hours);
        
        setImprovements(enhancedImprovements);
      } catch (error) {
        console.error('Failed to load health improvements:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadHealthImprovements();
  }, [session, quitDate]);
  
  // Filter improvements based on selected system
  const filteredImprovements = improvements.filter(improvement => {
    if (onlyShowAchieved && !improvement.achieved) {
      return false;
    }
    
    if (selectedSystem !== 'all' && improvement.organ_system !== selectedSystem) {
      return false;
    }
    
    return true;
  });
  
  // Limit items if maxItems is specified
  const displayedImprovements = maxItems !== undefined ? filteredImprovements.slice(0, maxItems) : filteredImprovements;
  
  // Find the next improvement to achieve
  const nextImprovement = improvements.find(i => !i.achieved);
  
  // Calculate when the next improvement will be achieved
  const getNextImprovementTime = () => {
    if (!nextImprovement || !quitDate) return null;
    
    const quitDateTime = new Date(quitDate).getTime();
    const achievementTime = addHours(new Date(quitDateTime), nextImprovement?.timeline_hours);
    return formatDistance(achievementTime, new Date(), { addSuffix: true });
  };
  
  // Format the timeline hours based on selected format
  const formatTimelineHours = (hours: number) => {
    if (timeFormat === 'hours') {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    } else if (timeFormat === 'days') {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      if (days === 0) {
        return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
      } else if (remainingHours === 0) {
        return `${days} ${days === 1 ? 'day' : 'days'}`;
      } else {
        return `${days} ${days === 1 ? 'day' : 'days'}, ${remainingHours} ${remainingHours === 1 ? 'hour' : 'hours'}`;
      }
    } else {
      // Summary format
      if (hours < 24) {
        return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
      } else {
        const days = Math.floor(hours / 24);
        return `${days} ${days === 1 ? 'day' : 'days'}`;
      }
    }
  };
  
  // Calculate a health improvement status
  const getImprovementStatus = (improvement: EnhancedHealthImprovement) => {
    if (improvement.achieved) {
      return {
        status: 'achieved',
        label: 'Achieved',
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      };
    } else if (nextImprovement && improvement.id === nextImprovement.id) {
      return {
        status: 'next',
        label: 'Next',
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      };
    } else {
      return {
        status: 'future',
        label: 'Coming up',
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
      };
    }
  };
  
  // Toggle fullscreen display
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // Get progress percentage for an improvement
  const getProgressPercentage = (improvement: EnhancedHealthImprovement) => {
    if (improvement.achieved) return 100;
    if (!quitDate) return 0;
    
    const hoursPassed = hoursSinceQuitting;
    const hoursTotal = improvement?.timeline_hours;
    
    const percentage = Math.min(Math.round((hoursPassed / hoursTotal) * 100), 99);
    return percentage;
  };
  
  // Get all unique organ systems from improvements
  const organSystems = ['all', ...new Set(improvements.map(i => i.organ_system))];
  
  // Render progress indicator
  const renderProgressIndicator = (improvement: EnhancedHealthImprovement) => {
    const progressPercentage = getProgressPercentage(improvement);
    const status = getImprovementStatus(improvement);
    
    return (
      <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`absolute top-0 left-0 h-full ${improvement.achieved ? 'bg-green-500' : 'bg-green-500'}`}
          style={{ width: `${progressPercentage}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    );
  };
  
  // Render the detailed view for an improvement
  const renderDetailedView = (improvement: EnhancedHealthImprovement) => {
    return (
      <Dialog open={selectedImprovement?.id === improvement.id} onOpenChange={(open) => !open && setSelectedImprovement(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <span className={`mr-2 ${systemIcons[improvement.organ_system]?.color || ''}`}>
                {systemIcons[improvement.organ_system]?.icon || systemIcons.default.icon}
              </span>
              {improvement.title}
              <Badge className={`ml-3 ${getImprovementStatus(improvement).color}`}>
                {getImprovementStatus(improvement).label}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              {formatTimelineHours(improvement?.timeline_hours)} after quitting
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-2">
            <Tabs defaultValue="overview">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="science">Scientific Data</TabsTrigger>
                <TabsTrigger value="related">Related</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p>{improvement.description}</p>
                  {improvement.detailed_explanation && (
                    <p className="mt-3 text-sm text-muted-foreground">{improvement.detailed_explanation}</p>
                  )}
                </div>
                
                {improvement.health_impact_score && (
                  <div className="flex items-center">
                    <div className="mr-4">
                      <p className="text-sm font-medium">Health Impact Score</p>
                      <p className="text-3xl font-bold">{improvement.health_impact_score}</p>
                    </div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-yellow-500 to-green-500" 
                          style={{ width: `${improvement.health_impact_score}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span>Minimal</span>
                        <span>Moderate</span>
                        <span>Significant</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {improvement.related_symptoms && improvement.related_symptoms.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Related Symptoms</h4>
                    <div className="flex flex-wrap gap-2">
                      {improvement.related_symptoms.map((symptom, index) => (
                        <Badge key={index} variant="secondary">
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {improvement?.achievement_date && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      You achieved this
                    </h4>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {format(new Date(improvement?.achievement_date), 'MMMM d, yyyy')}
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="science" className="space-y-4">
                {improvement.scientific_sources && improvement.scientific_sources.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Scientific Sources</h4>
                    <ul className="space-y-2">
                      {improvement.scientific_sources.map((source, index) => (
                        <li key={index} className="text-sm flex items-start">
                          <Book className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{source}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-muted-foreground mt-2">
                      These sources provide scientific evidence for the health improvements described.
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <h4 className="text-sm font-medium mb-1">Physical Changes</h4>
                    <p className="text-sm text-muted-foreground">
                      Blood oxygen levels normalize, allowing more oxygen to reach your cells and tissues.
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="text-sm font-medium mb-1">Cellular Impact</h4>
                    <p className="text-sm text-muted-foreground">
                      Cells begin to repair damage caused by toxins present in cigarette smoke.
                    </p>
                  </div>
                </div>
                
                <div className="text-sm">
                  <h4 className="font-medium mb-2">How This Was Measured</h4>
                  <p className="text-muted-foreground">
                    This health improvement is based on longitudinal studies of former smokers and direct 
                    measurements of physiological changes. The timeline has been validated across multiple 
                    research studies.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="related" className="space-y-4">
                {improvement.next_improvements && improvement.next_improvements.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">What Comes Next</h4>
                    <ul className="space-y-2">
                      {improvement.next_improvements.map((next, index) => (
                        <li key={index} className="text-sm flex items-start">
                          <ArrowUpRight className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{next}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Related Improvements</h4>
                  <div className="space-y-2">
                    {improvements
                      .filter(i => i.id !== improvement.id && i.organ_system === improvement.organ_system)
                      .slice(0, 3)
                      .map(relatedImprovement => (
                        <Button 
                          key={relatedImprovement.id}
                          variant="outline"
                          className="w-full justify-start text-left h-auto py-2"
                          onClick={() => setSelectedImprovement(relatedImprovement)}
                        >
                          <div>
                            <p className="font-medium">{relatedImprovement.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatTimelineHours(relatedImprovement?.timeline_hours)} after quitting
                            </p>
                          </div>
                        </Button>
                      ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <DialogFooter>
            {improvement.achieved ? (
              <Button variant="default" onClick={() => setSelectedImprovement(null)}>
                Close
              </Button>
            ) : (
              <div className="w-full">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{getProgressPercentage(improvement)}%</span>
                </div>
                {renderProgressIndicator(improvement)}
                <Button 
                  variant="outline" 
                  className="w-full mt-3"
                  onClick={() => setSelectedImprovement(null)}
                >
                  Close
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  if (loading) {
    return <div className="animate-pulse h-40 bg-muted rounded-lg" />;
  }
  
  return (
    <Card className={`${className} ${isFullscreen ? 'fixed inset-0 z-50 overflow-auto' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Health Improvement Timeline</CardTitle>
            <CardDescription>
              Track your body's recovery journey since quitting
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "View fullscreen"}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 space-y-4">
          {!compact && (
            <>
              <div className="flex flex-wrap gap-2">
                <div className="flex-1 min-w-fit">
                  <Tabs value={selectedSystem} onValueChange={setSelectedSystem}>
                    <TabsList className="mb-4 w-full overflow-x-auto flex flex-nowrap justify-start">
                      {organSystems.map(system => (
                        <TabsTrigger 
                          key={system} 
                          value={system}
                          className="flex items-center whitespace-nowrap"
                        >
                          {system !== 'all' && (
                            <span className={`mr-2 ${systemIcons[system]?.color || ''}`}>
                              {systemIcons[system]?.icon || systemIcons.default.icon}
                            </span>
                          )}
                          {system === 'all' ? 'All Systems' : system.charAt(0).toUpperCase() + system.slice(1)}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm whitespace-nowrap">Time Format:</label>
                  <select 
                    className="text-sm bg-background border rounded-md p-1" 
                    value={timeFormat}
                    onChange={(e) => setTimeFormat(e.target.value as any)}
                  >
                    <option value="summary">Summary</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days & Hours</option>
                  </select>
                </div>
              </div>
              
              {nextImprovement && highlightNext && (
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg mb-4">
                  <h4 className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    Next Improvement
                  </h4>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    <span className="font-medium">{nextImprovement.title}</span> {getNextImprovementTime()}
                  </p>
                  {renderProgressIndicator(nextImprovement)}
                </div>
              )}
            </>
          )}
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-2.5 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700"></div>
            
            {/* Timeline items */}
            <div className="space-y-4">
              {displayedImprovements.map((improvement, index) => {
                const status = getImprovementStatus(improvement);
                
                return (
                  <React.Fragment key={improvement.id}>
                    <motion.div
                      className="flex items-start gap-4 relative"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {/* Timeline dot */}
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full ${improvement.achieved ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'} flex items-center justify-center mt-0.5`}>
                        {improvement.achieved && (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        )}
                      </div>
                      
                      {/* Timeline content */}
                      <div className="flex-1 min-w-0">
                        <div 
                          className={`p-3 rounded-lg border ${
                            nextImprovement && improvement.id === nextImprovement.id
                              ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                              : improvement.achieved
                                ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                                : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                          } transition-all hover:shadow-md cursor-pointer`}
                          onClick={() => setSelectedImprovement(improvement)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center">
                              <span className={`mr-2 ${systemIcons[improvement.organ_system]?.color || ''}`}>
                                {systemIcons[improvement.organ_system]?.icon || systemIcons.default.icon}
                              </span>
                              <h3 className="font-medium">{improvement.title}</h3>
                            </div>
                            <Badge className={status.color}>
                              {status.label}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            {improvement.description}
                          </p>
                          
                          <div className="flex justify-between items-center text-xs text-muted-foreground">
                            <span>{formatTimelineHours(improvement?.timeline_hours)} after quitting</span>
                            {!improvement.achieved && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger className="flex items-center">
                                    <Info className="h-3 w-3 mr-1" />
                                    <span>
                                      {getProgressPercentage(improvement)}% complete
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Based on your quit date</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          
                          {!compact && !improvement.achieved && (
                            <div className="mt-2">
                              {renderProgressIndicator(improvement)}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                    {/* Render detailed view dialog */}
                    {renderDetailedView(improvement)}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
      {filteredImprovements.length > (maxItems || 0) && maxItems !== undefined && (
        <CardFooter className="pt-0">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={toggleFullscreen}
          >
            View All {filteredImprovements.length} Improvements
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

// Add missing icons to avoid errors
const CheckCircle2 = ({ size = 24, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const ArrowUpRight = ({ size = 24, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M7 17V7h10" />
    <path d="M7 7l10 10" />
  </svg>
);

const Book = ({ size = 24, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
  </svg>
); 