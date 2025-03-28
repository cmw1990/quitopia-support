import React, { useState, useEffect } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ShareTool,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '../../components/ui';
import { 
  Brain, 
  Calculator, 
  CalendarDays, 
  MountainSnow, 
  Heart, 
  Battery,
  Menu,
  Cigarette,
  Package,
  Database,
  ShoppingBasket,
  Book,
  ChevronRight,
  PieChart,
  LineChart,
  Lightbulb,
  Speech,
  Building,
  Activity,
  Share2,
  Zap,
  Calendar
} from 'lucide-react';
// These components will be implemented later
// import { HealthCalculatorsTool } from './components/HealthCalculatorsTool';
// import { MoodSupportTool } from './components/MoodSupportTool';
// import { EnergyManagementTool } from './components/EnergyManagementTool';
// import { FatigueManagementTool } from './components/FatigueManagementTool';
// import { Header } from '../../components/Header';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { ProductCatalog } from '../nicotineTracking/ProductCatalog';
import SEO from '../../components/SEO';

// Tool descriptions for sharing
const toolDescriptions = {
  health: "Interactive health calculators that help you track your physical wellbeing during your fresh journey",
  energy: "Tools to understand and optimize your energy levels throughout your fresh journey",
  mood: "Support for tracking, understanding, and managing your emotional states during your fresh journey",
  fatigue: "Tools to understand and overcome fatigue during your fresh journey",
  general: "Interactive tools to support your fresh journey"
};

export const WebToolsPage: React.FC = () => {
  const session = useSession();
  const [activeTab, setActiveTab] = useState('all');
  const [isMobile, setIsMobile] = useState(false);
  const [pageUrl, setPageUrl] = useState('');
  const navigate = useNavigate();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Save preference to localStorage
    localStorage.setItem('web-tools-tab', value);
    
    // Scroll to top on mobile when changing tabs
    if (isMobile) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Update URL with hash for direct sharing of specific tools
    window.history.replaceState(
      null, 
      '', 
      `${window.location.pathname}${value !== 'health' ? `#${value}` : ''}`
    );
    setPageUrl(window.location.href);
  };

  // Use saved tab preference if it exists or extract from URL hash
  useEffect(() => {
    // Check hash from URL first
    const hash = window.location.hash.replace('#', '');
    const validTabs = ['health', 'energy', 'mood', 'fatigue', 'coming-soon', 'all'];
    
    if (hash && validTabs.includes(hash)) {
      setActiveTab(hash);
    } else {
      // Otherwise use localStorage
      const savedTab = localStorage.getItem('web-tools-tab');
      if (savedTab && validTabs.includes(savedTab)) {
        setActiveTab(savedTab);
      }
    }
    
    // Set initial page URL
    setPageUrl(window.location.href);
    
    // Check if device is mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Set up listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Get current tool name and description for sharing
  const getCurrentToolTitle = () => {
    switch(activeTab) {
      case 'health': return 'Health Calculators';
      case 'energy': return 'Energy Management';
      case 'mood': return 'Mood Support';
      case 'fatigue': return 'Fatigue Management';
      case 'coming-soon': return 'Fresh Tools';
      default: return 'Fresh Tools';
    }
  };
  
  const getCurrentToolDescription = () => {
    return toolDescriptions[activeTab as keyof typeof toolDescriptions] || toolDescriptions.general;
  };

  // SEO title and description based on active tab
  const getPageTitle = () => {
    const toolName = getCurrentToolTitle();
    return `${toolName} | Mission Fresh`;
  };
  
  const getPageDescription = () => {
    return getCurrentToolDescription();
  };

  const toolGroups = [
    {
      id: 'product-tools',
      title: 'Product Tools',
      items: [
        {
          id: 'nicotine-product-catalog',
          name: 'Nicotine Product Catalog',
          description: 'Browse, compare, and learn about different nicotine products',
          icon: <Cigarette className="h-6 w-6" />,
          path: '/products/nicotine',
          color: 'bg-blue-100 dark:bg-blue-900',
          featured: true
        },
        {
          id: 'alternative-products',
          name: 'Alternative Products',
          description: 'Explore nicotine-free alternatives for your cessation journey',
          icon: <ShoppingBasket className="h-6 w-6" />,
          path: '/app/alternative-products',
          color: 'bg-green-100 dark:bg-green-900'
        },
        {
          id: 'method-comparison',
          name: 'Method Comparison Tool',
          description: 'Compare different cessation approaches and find what works for you',
          icon: <PieChart className="h-6 w-6" />,
          path: '/app/method-comparison',
          color: 'bg-purple-100 dark:bg-purple-900'
        }
      ]
    },
    {
      id: 'calculators',
      title: 'Calculators & Trackers',
      items: [
        {
          id: 'savings-calculator',
          name: 'Savings Calculator',
          description: 'See how much money you can save by quitting',
          icon: <Calculator className="h-6 w-6" />,
          path: '/app/savings-calculator',
          color: 'bg-green-100 dark:bg-green-900',
          featured: true
        },
        {
          id: 'health-timeline',
          name: 'Health Recovery Timeline',
          description: 'Track how your body recovers after quitting',
          icon: <Activity className="h-6 w-6" />,
          path: '/app/health-timeline',
          color: 'bg-red-100 dark:bg-red-900',
          featured: true
        },
        {
          id: 'consumption-tracker',
          name: 'Consumption Tracker',
          description: 'Log and analyze your nicotine consumption patterns',
          icon: <LineChart className="h-6 w-6" />,
          path: '/app/consumption-tracker',
          color: 'bg-indigo-100 dark:bg-indigo-900'
        }
      ]
    },
    {
      id: 'support-tools',
      title: 'Support & Resources',
      items: [
        {
          id: 'trigger-identification',
          name: 'Trigger Identification Tool',
          description: 'Identify and plan for your personal triggers',
          icon: <Lightbulb className="h-6 w-6" />,
          path: '/app/trigger-analysis',
          color: 'bg-yellow-100 dark:bg-yellow-900',
          featured: true
        },
        {
          id: 'coping-strategies',
          name: 'Coping Strategies Database',
          description: 'Browse and save effective coping strategies',
          icon: <Database className="h-6 w-6" />,
          path: '/app/coping-strategies',
          color: 'bg-blue-100 dark:bg-blue-900'
        },
        {
          id: 'expert-advice',
          name: 'Expert Advice Library',
          description: 'Read advice from healthcare professionals and researchers',
          icon: <Book className="h-6 w-6" />,
          path: '/app/expert-advice',
          color: 'bg-purple-100 dark:bg-purple-900'
        }
      ]
    },
    {
      id: 'community',
      title: 'Community & Sharing',
      items: [
        {
          id: 'success-stories',
          name: 'Success Stories',
          description: 'Read inspiring success stories from others on the same journey',
          icon: <Speech className="h-6 w-6" />,
          path: '/app/success-stories',
          color: 'bg-green-100 dark:bg-green-900'
        },
        {
          id: 'progress-sharing',
          name: 'Progress Sharing Tool',
          description: 'Share your journey with friends and family',
          icon: <Share2 className="h-6 w-6" />,
          path: '/app/progress-sharing',
          color: 'bg-blue-100 dark:bg-blue-900'
        },
        {
          id: 'local-support',
          name: 'Local Support Finder',
          description: 'Find in-person support groups and resources in your area',
          icon: <Building className="h-6 w-6" />,
          path: '/app/local-support',
          color: 'bg-red-100 dark:bg-red-900'
        }
      ]
    },
    {
      id: 'health-tools',
      title: 'Health & Wellness',
      items: [
        {
          id: 'breathing-exercises',
          name: 'Breathing Exercises',
          description: 'Guided breathing exercises to manage cravings and stress',
          icon: <Zap className="h-6 w-6" />,
          path: '/app/breathing-exercises',
          color: 'bg-indigo-100 dark:bg-indigo-900'
        },
        {
          id: 'holistic-health',
          name: 'Holistic Health Dashboard',
          description: 'Track your overall well-being during your cessation journey',
          icon: <Heart className="h-6 w-6" />,
          path: '/app/health/holistic',
          color: 'bg-pink-100 dark:bg-pink-900'
        },
        {
          id: 'event-planner',
          name: 'Smoke-Free Event Planner',
          description: 'Plan for social events and challenging situations',
          icon: <Calendar className="h-6 w-6" />,
          path: '/app/event-planner',
          color: 'bg-orange-100 dark:bg-orange-900'
        }
      ]
    }
  ];
  
  // Filter tools based on active tab
  const getFilteredTools = () => {
    if (activeTab === 'all') {
      return toolGroups;
    }
    
    const filtered = toolGroups.find(group => group.id === activeTab);
    return filtered ? [filtered] : [];
  };
  
  // Get featured tools across all categories
  const getFeaturedTools = () => {
    const featured = toolGroups.flatMap(group => 
      group.items.filter(item => item.featured)
    );
    return featured;
  };

  return (
    <>
      <SEO 
        title="Nicotine Cessation Tools | Mission Fresh"
        description="Explore our comprehensive collection of nicotine cessation tools, including product comparisons, trackers, and resources to support your quit journey."
        keywords="nicotine cessation tools, quit smoking resources, nicotine products, cessation support"
      />
      <Helmet>
        <title>{getPageTitle()}</title>
        <meta name="description" content={getPageDescription()} />
        <meta property="og:title" content={getPageTitle()} />
        <meta property="og:description" content={getPageDescription()} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={getPageTitle()} />
        <meta name="twitter:description" content={getPageDescription()} />
      </Helmet>
    
      <div className="container mx-auto py-4 md:py-6 px-3 md:px-4 max-w-6xl">
        <div className="flex justify-between items-center">
          <div className="mb-4 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold">Fresh Web Tools</h1>
            <p className="text-muted-foreground">Interactive tools to support your fresh journey</p>
          </div>
          
          <ShareTool
            toolName="Fresh Web Tools"
            description={toolDescriptions.general}
            url={window.location.origin + window.location.pathname}
            className="hidden md:flex"
          />
        </div>
        
        {activeTab === 'catalog' ? (
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setActiveTab('all')}
              className="mb-6"
            >
              ← Back to all tools
            </Button>
            <div className="bg-background border rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Nicotine Product Catalog</h2>
              <ProductCatalog />
            </div>
          </div>
        ) : (
          <>
            {/* Featured Tools */}
            <div className="mb-10">
              <h2 className="text-xl font-semibold mb-4">Featured Tools</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {getFeaturedTools().map(tool => (
                  <Card key={tool.id} className="overflow-hidden transition-all hover:shadow-md">
                    <CardHeader className={`p-4 ${tool.color}`}>
                      <div className="flex items-center gap-3">
                        {tool.icon}
                        <CardTitle className="text-lg">{tool.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <p className="text-muted-foreground text-sm">{tool.description}</p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-end">
                      {tool.id === 'nicotine-product-catalog' ? (
                        <Button size="sm" onClick={() => setActiveTab('catalog')}>
                          Open Tool <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => navigate(tool.path)}>
                          Open Tool <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* Tool Categories Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-4 md:mt-8">
              <div className="sticky top-0 z-10 bg-background pt-2 pb-4 md:pb-6 shadow-sm">
                <TabsList className="grid grid-cols-5 mb-4 md:mb-8 w-full h-auto">
                  <TabsTrigger value="health" className="py-2 md:py-3 flex-col md:flex-row gap-1 md:gap-2">
                    <Heart className="h-4 w-4" />
                    <span className="text-xs md:text-sm">Health</span>
                  </TabsTrigger>
                  <TabsTrigger value="energy" className="py-2 md:py-3 flex-col md:flex-row gap-1 md:gap-2">
                    <Battery className="h-4 w-4" />
                    <span className="text-xs md:text-sm">Energy</span>
                  </TabsTrigger>
                  <TabsTrigger value="mood" className="py-2 md:py-3 flex-col md:flex-row gap-1 md:gap-2">
                    <Brain className="h-4 w-4" />
                    <span className="text-xs md:text-sm">Mood</span>
                  </TabsTrigger>
                  <TabsTrigger value="fatigue" className="py-2 md:py-3 flex-col md:flex-row gap-1 md:gap-2">
                    <MountainSnow className="h-4 w-4" />
                    <span className="text-xs md:text-sm">Fatigue</span>
                  </TabsTrigger>
                  <TabsTrigger value="coming-soon" className="py-2 md:py-3 flex-col md:flex-row gap-1 md:gap-2">
                    <CalendarDays className="h-4 w-4" />
                    <span className="text-xs md:text-sm">More</span>
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="health" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="prose prose-sm dark:prose-invert max-w-none mb-4 md:mb-6">
                    <p className="text-sm md:text-base">
                      Our health calculators help you track your physical wellbeing during your fresh journey.
                      Quitting smoking can lead to significant health improvements - these tools help you
                      quantify those benefits and make informed decisions.
                    </p>
                  </div>
                  <ShareTool
                    toolName="Health Calculators"
                    description={toolDescriptions.health}
                    variant="ghost"
                    size="sm"
                    iconOnly={isMobile}
                  />
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Health Calculators Coming Soon</CardTitle>
                    <CardDescription>We're working on comprehensive health tracking tools</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>These tools will help you track and visualize the health benefits you experience as you quit smoking.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="energy" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="prose prose-sm dark:prose-invert max-w-none mb-4 md:mb-6">
                    <p className="text-sm md:text-base">
                      Energy levels can fluctuate when quitting smoking. Our energy management tools help
                      you understand and optimize your energy throughout the day, creating personal
                      strategies to boost your vitality.
                    </p>
                  </div>
                  <ShareTool
                    toolName="Energy Management"
                    description={toolDescriptions.energy}
                    variant="ghost"
                    size="sm"
                    iconOnly={isMobile}
                  />
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Energy Management Tools Coming Soon</CardTitle>
                    <CardDescription>We're working on energy tracking and optimization tools</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>These tools will help you monitor and improve your energy levels during your quit journey.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="mood" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="prose prose-sm dark:prose-invert max-w-none mb-4 md:mb-6">
                    <p className="text-sm md:text-base">
                      Mood changes are common during the quitting journey. These tools help you track,
                      understand, and manage your emotional states, with personalized strategies for
                      maintaining emotional balance.
                    </p>
                  </div>
                  <ShareTool
                    toolName="Mood Support"
                    description={toolDescriptions.mood}
                    variant="ghost"
                    size="sm"
                    iconOnly={isMobile}
                  />
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Mood Support Tools Coming Soon</CardTitle>
                    <CardDescription>We're working on comprehensive mood tracking and analysis tools</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>These tools will help you understand and manage mood changes during your quit journey.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="fatigue" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="prose prose-sm dark:prose-invert max-w-none mb-4 md:mb-6">
                    <p className="text-sm md:text-base">
                      Feeling tired can be part of the quitting process. Our fatigue management tools
                      help you understand the root causes and develop personalized strategies to overcome
                      fatigue during your fresh journey.
                    </p>
                  </div>
                  <ShareTool
                    toolName="Fatigue Management"
                    description={toolDescriptions.fatigue}
                    variant="ghost"
                    size="sm"
                    iconOnly={isMobile}
                  />
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Fatigue Management Tools Coming Soon</CardTitle>
                    <CardDescription>We're working on fatigue analysis and management tools</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>These tools will help you overcome fatigue and maintain energy during your quit journey.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="coming-soon" className="space-y-4">
                <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    {
                      title: "Nicotine Product Tracker",
                      icon: <Cigarette className="h-10 w-10 md:h-12 md:w-12 text-orange-500" />,
                      description: "Comprehensive catalog of nicotine products with multi-product tracking.",
                      isAvailable: true,
                      link: "/products/nicotine"
                    },
                    {
                      title: "Stress Management",
                      icon: <MountainSnow className="h-10 w-10 md:h-12 md:w-12 text-blue-500" />,
                      description: "Interactive stress reduction techniques and personalized strategies.",
                      isAvailable: false
                    },
                    {
                      title: "Sleep Quality Optimizer",
                      icon: <CalendarDays className="h-10 w-10 md:h-12 md:w-12 text-indigo-500" />,
                      description: "Track sleep patterns and get personalized recommendations for better rest.",
                      isAvailable: false
                    },
                    {
                      title: "Craving Response Tool",
                      icon: <Brain className="h-10 w-10 md:h-12 md:w-12 text-purple-500" />,
                      description: "Interactive exercises to manage cravings in the moment they occur.",
                      isAvailable: false
                    },
                    {
                      title: "Habit Builder",
                      icon: <Calculator className="h-10 w-10 md:h-12 md:w-12 text-green-500" />,
                      description: "Create and track healthy habits to replace smoking behaviors.",
                      isAvailable: false
                    },
                    {
                      title: "Social Support Network",
                      icon: <Heart className="h-10 w-10 md:h-12 md:w-12 text-red-500" />,
                      description: "Build and visualize your support network for your fresh journey.",
                      isAvailable: false
                    }
                  ].map((tool, index) => (
                    <div key={index} className="border rounded-lg p-4 md:p-6 flex flex-col items-center text-center space-y-3 md:space-y-4 bg-card hover:shadow-md transition-shadow">
                      <div className="p-3 rounded-full bg-background">
                        {tool.icon}
                      </div>
                      <h3 className="text-base md:text-lg font-semibold">{tool.title}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">{tool.description}</p>
                      <div className="mt-auto pt-2 md:pt-4">
                        {tool.isAvailable && tool.link ? (
                          <Button asChild variant="default" size="sm">
                            <Link to={tool.link}>
                              Open Tool
                            </Link>
                          </Button>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 text-xs rounded-full bg-secondary text-secondary-foreground">
                            Coming Soon
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-muted">
                  <h3 className="text-base md:text-lg font-medium mb-2">Help Us Improve</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    We're constantly working to add new tools to better support your fresh journey.
                    Which tool would you like to see next?
                  </p>
                  <a 
                    href="mailto:feedback@missionfresh.com?subject=Fresh Tools Suggestion"
                    className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                  >
                    Send Feedback
                  </a>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </>
  );
};

export default WebToolsPage; 