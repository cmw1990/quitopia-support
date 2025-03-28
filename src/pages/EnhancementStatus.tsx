import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EnhancementCategory {
  name: string;
  description: string;
  progress: number;
  features: EnhancementFeature[];
}

interface EnhancementFeature {
  name: string;
  description: string;
  status: 'not-started' | 'in-progress' | 'completed';
  progress: number;
  tasks: EnhancementTask[];
}

interface EnhancementTask {
  name: string;
  description: string;
  status: 'not-started' | 'in-progress' | 'completed';
  progress: number;
}

const EnhancementStatus: React.FC = () => {
  const [categories, setCategories] = useState<EnhancementCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalProgress, setTotalProgress] = useState(0);

  useEffect(() => {
    // In a real implementation, this would fetch the data from an API or file
    // For now, we'll hardcode the data based on IMPLEMENTATION_PLAN.md
    const categoriesData: EnhancementCategory[] = [
      {
        name: 'TypeScript & Framework Alignment',
        description: 'Critical fixes for TypeScript errors and framework alignment',
        progress: 70,
        features: [
          {
            name: 'API Implementation',
            description: 'Ensure all API calls are compliant with ssot8001',
            status: 'in-progress',
            progress: 80,
            tasks: [
              {
                name: 'Fix BackwardCompatibility API',
                description: 'Ensure all compatibility layer functions have proper types',
                status: 'in-progress',
                progress: 70
              },
              {
                name: 'Complete missionFreshApiClient.ts',
                description: 'Fix return types and add missing API functions',
                status: 'in-progress',
                progress: 80
              },
              {
                name: 'Integrate offline capabilities',
                description: 'Connect offline storage with API client',
                status: 'in-progress',
                progress: 75
              },
              {
                name: 'Fix remaining type errors',
                description: 'Resolve TypeScript errors in API code',
                status: 'in-progress',
                progress: 65
              }
            ]
          },
          {
            name: 'Authentication Flow',
            description: 'Fix issues with authentication flow',
            status: 'not-started',
            progress: 0,
            tasks: [
              {
                name: 'Consistent session management',
                description: 'Ensure session handling is consistent',
                status: 'not-started',
                progress: 0
              },
              {
                name: 'Error handling improvement',
                description: 'Implement standardized error handling',
                status: 'not-started',
                progress: 0
              },
              {
                name: 'Mobile auth flow optimization',
                description: 'Test and optimize mobile authentication',
                status: 'not-started',
                progress: 0
              }
            ]
          },
          {
            name: 'Type Definition Cleanup',
            description: 'Clean up and standardize type definitions',
            status: 'in-progress',
            progress: 45,
            tasks: [
              {
                name: 'Create consistent type definitions',
                description: 'Standardize types across the application',
                status: 'in-progress',
                progress: 50
              },
              {
                name: 'Remove unused imports',
                description: 'Clean up code by removing unnecessary imports',
                status: 'not-started',
                progress: 0
              },
              {
                name: 'Fix remaining type errors',
                description: 'Resolve remaining TypeScript errors',
                status: 'in-progress',
                progress: 40
              }
            ]
          }
        ]
      },
      {
        name: 'Mobile Experience',
        description: 'Optimize the app for mobile users',
        progress: 30,
        features: [
          {
            name: 'Mobile Navigation',
            description: 'Enhance mobile navigation experience',
            status: 'not-started',
            progress: 0,
            tasks: [
              {
                name: 'Implement gesture navigation',
                description: 'Add swipe gestures for mobile navigation',
                status: 'not-started',
                progress: 0
              },
              {
                name: 'Create mobile layouts',
                description: 'Optimize layouts for mobile screens',
                status: 'not-started',
                progress: 0
              },
              {
                name: 'Enhance bottom tab navigation',
                description: 'Add haptic feedback and visual improvements',
                status: 'not-started',
                progress: 0
              }
            ]
          },
          {
            name: 'Offline Mode',
            description: 'Complete offline functionality',
            status: 'in-progress',
            progress: 75,
            tasks: [
              {
                name: 'Complete offline storage service',
                description: 'Finish implementing offline storage',
                status: 'in-progress',
                progress: 85
              },
              {
                name: 'Fix sync queue functionality',
                description: 'Ensure proper sync queue operation',
                status: 'in-progress',
                progress: 75
              },
              {
                name: 'Conflict resolution',
                description: 'Implement conflict resolution for offline changes',
                status: 'in-progress',
                progress: 30
              },
              {
                name: 'Visual indicators',
                description: 'Enhance offline/online status indicators',
                status: 'in-progress',
                progress: 70
              }
            ]
          },
          {
            name: 'Mobile-Specific Features',
            description: 'Add features optimized for mobile',
            status: 'not-started',
            progress: 0,
            tasks: [
              {
                name: 'Step tracking integration',
                description: 'Finalize health API integration',
                status: 'not-started',
                progress: 0
              },
              {
                name: 'Deep linking',
                description: 'Implement proper deep linking',
                status: 'not-started',
                progress: 0
              },
              {
                name: 'Notification management',
                description: 'Add mobile notification support',
                status: 'not-started',
                progress: 0
              },
              {
                name: 'Optimize visual components',
                description: 'Ensure UI works well on mobile',
                status: 'not-started',
                progress: 0
              }
            ]
          }
        ]
      },
      {
        name: 'Core Features',
        description: 'Enhance core app functionality',
        progress: 40,
        features: [
          {
            name: 'Progress Tracking',
            description: 'Enhanced visualization and tracking',
            status: 'in-progress',
            progress: 30,
            tasks: [
              {
                name: 'Advanced visualization',
                description: 'Implement health improvement visualizations',
                status: 'not-started',
                progress: 0
              },
              {
                name: 'Customizable dashboard',
                description: 'Allow users to select/arrange metrics',
                status: 'in-progress',
                progress: 30
              },
              {
                name: 'Enhanced streak tracking',
                description: 'Add motivational elements to streaks',
                status: 'in-progress',
                progress: 50
              },
              {
                name: 'Success path visualization',
                description: 'Create visual milestones',
                status: 'not-started',
                progress: 0
              }
            ]
          },
          {
            name: 'Consumption Logger',
            description: 'Optimize logging and analytics',
            status: 'in-progress',
            progress: 45,
            tasks: [
              {
                name: 'Mobile interface for logging',
                description: 'Enhance mobile UI for quick logging',
                status: 'in-progress',
                progress: 60
              },
              {
                name: 'Consumption pattern analytics',
                description: 'Add advanced analytics for patterns',
                status: 'in-progress',
                progress: 40
              },
              {
                name: 'Trigger analysis',
                description: 'Create pattern recognition for triggers',
                status: 'not-started',
                progress: 0
              }
            ]
          },
          {
            name: 'NRT Directory & Marketplace',
            description: 'Complete directory and marketplace',
            status: 'in-progress',
            progress: 60,
            tasks: [
              {
                name: 'Affiliate link integration',
                description: 'Complete affiliate link functionality',
                status: 'in-progress',
                progress: 80
              },
              {
                name: 'Enhanced filtering',
                description: 'Improve product search and filtering',
                status: 'in-progress',
                progress: 65
              },
              {
                name: 'Vendor directory',
                description: 'Add comprehensive vendor information',
                status: 'in-progress',
                progress: 50
              },
              {
                name: 'Ratings system',
                description: 'Implement user reviews and ratings',
                status: 'not-started',
                progress: 0
              }
            ]
          }
        ]
      },
      {
        name: 'Innovative Differentiation',
        description: 'Unique features that set the app apart',
        progress: 20,
        features: [
          {
            name: 'Comprehensive Quitting Methods',
            description: 'Support for all quitting methods',
            status: 'in-progress',
            progress: 25,
            tasks: [
              {
                name: 'Method support',
                description: 'Support all quitting methods',
                status: 'in-progress',
                progress: 40
              },
              {
                name: 'Method comparison',
                description: 'Add method comparison analytics',
                status: 'not-started',
                progress: 0
              },
              {
                name: 'Personalized recommendations',
                description: 'Implement personalized method recommendations',
                status: 'not-started',
                progress: 0
              }
            ]
          },
          {
            name: 'Step-Based Rewards',
            description: 'Complete rewards system for steps',
            status: 'in-progress',
            progress: 15,
            tasks: [
              {
                name: 'Subscription discounts',
                description: 'Finalize discount calculations',
                status: 'in-progress',
                progress: 30
              },
              {
                name: 'Social competitions',
                description: 'Implement step challenges',
                status: 'not-started',
                progress: 0
              },
              {
                name: 'Achievement celebrations',
                description: 'Add visual rewards',
                status: 'not-started',
                progress: 0
              }
            ]
          }
        ]
      },
      {
        name: 'Technical Excellence',
        description: 'Performance and code quality',
        progress: 35,
        features: [
          {
            name: 'Performance Optimization',
            description: 'Ensure optimal app performance',
            status: 'in-progress',
            progress: 40,
            tasks: [
              {
                name: 'Caching strategies',
                description: 'Implement advanced caching',
                status: 'in-progress',
                progress: 60
              },
              {
                name: 'Asset optimization',
                description: 'Optimize images and assets',
                status: 'in-progress',
                progress: 30
              },
              {
                name: 'Progressive web app',
                description: 'Add PWA capabilities',
                status: 'not-started',
                progress: 0
              }
            ]
          },
          {
            name: 'Cross-Device Synchronization',
            description: 'Enhance data syncing between devices',
            status: 'in-progress',
            progress: 30,
            tasks: [
              {
                name: 'Data syncing',
                description: 'Enhance multi-device syncing',
                status: 'in-progress',
                progress: 45
              },
              {
                name: 'Smart sync strategies',
                description: 'Minimize data usage during sync',
                status: 'in-progress',
                progress: 25
              },
              {
                name: 'Seamless user experience',
                description: 'Create consistent cross-platform experience',
                status: 'not-started',
                progress: 0
              }
            ]
          }
        ]
      }
    ];

    setCategories(categoriesData);
    
    // Calculate total progress
    const total = categoriesData.reduce((sum, category) => sum + category.progress, 0);
    setTotalProgress(Math.round(total / categoriesData.length));
    
    setIsLoading(false);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success" className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Completed
        </Badge>;
      case 'in-progress':
        return <Badge variant="warning" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          In Progress
        </Badge>;
      default:
        return <Badge variant="outline" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Not Started
        </Badge>;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
    </div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Mission Fresh Enhancement Status</h1>
      <p className="text-muted-foreground mb-6">
        Current progress on enhancing the world's best smoking cessation application
      </p>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
          <CardDescription>
            {totalProgress}% of all enhancement features completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={totalProgress} className="h-3" />
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mt-6">
            {categories.map((category, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="relative">
                  <svg className="w-20 h-20">
                    <circle
                      className="text-muted stroke-current"
                      strokeWidth="5"
                      stroke="currentColor"
                      fill="transparent"
                      r="30"
                      cx="40"
                      cy="40"
                    />
                    <circle
                      className="text-primary stroke-current"
                      strokeWidth="5"
                      strokeDasharray={30 * 2 * Math.PI}
                      strokeDashoffset={30 * 2 * Math.PI * (1 - category.progress / 100)}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="30"
                      cx="40"
                      cy="40"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                    {category.progress}%
                  </div>
                </div>
                <span className="mt-2 text-sm font-medium">{category.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue={categories[0]?.name.toLowerCase().replace(/\s+/g, '-')}>
        <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-8">
          {categories.map((category, index) => (
            <TabsTrigger
              key={index}
              value={category.name.toLowerCase().replace(/\s+/g, '-')}
              className="text-xs sm:text-sm"
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {categories.map((category, index) => (
          <TabsContent
            key={index}
            value={category.name.toLowerCase().replace(/\s+/g, '-')}
          >
            <Card>
              <CardHeader>
                <CardTitle>{category.name}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {category.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="border rounded-lg p-4">
                    <div className="flex flex-wrap items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-medium">{feature.name}</h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </div>
                      <div className="mt-1">
                        {getStatusBadge(feature.status)}
                      </div>
                    </div>
                    
                    <Progress value={feature.progress} className="h-2 mb-4" />
                    
                    <div className="space-y-3 mt-4">
                      {feature.tasks.map((task, taskIndex) => (
                        <div key={taskIndex} className="flex items-center justify-between p-2 border-b last:border-0">
                          <div>
                            <p className="font-medium">{task.name}</p>
                            <p className="text-sm text-muted-foreground">{task.description}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-12 text-right text-sm font-medium">
                              {task.progress}%
                            </div>
                            {getStatusBadge(task.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default EnhancementStatus; 