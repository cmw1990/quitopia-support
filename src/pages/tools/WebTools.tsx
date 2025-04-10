import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchIcon, Brain, Focus, Zap, Battery, ShieldCheck, Clock, Activity, HeartPulse, Sparkles, ArrowRight, RefreshCw, Users, Headphones } from 'lucide-react';

interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  tags: string[];
  isNew?: boolean;
}

const ToolCard = ({ title, description, icon, href, tags, isNew = false }: ToolCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
  >
    <Card className="h-full flex flex-col overflow-hidden border-2 hover:border-primary/50 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              {icon}
            </div>
            <CardTitle className="text-xl">{title}</CardTitle>
          </div>
          {isNew && <Badge variant="default" className="ml-auto">New</Badge>}
        </div>
        <CardDescription className="pt-2">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pb-2">
        <div className="flex flex-wrap gap-1 mt-1">
          {tags.map((tag, i) => (
            <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button asChild className="w-full">
          <Link to={href}>Open Tool <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </CardFooter>
    </Card>
  </motion.div>
);

export function WebTools() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const tools: ToolCardProps[] = [
    {
      title: "Enhanced Focus",
      description: "Boost your concentration and maintain deep work sessions for longer periods.",
      icon: <Focus className="h-6 w-6" />,
      href: "/enhanced-focus",
      tags: ["focus", "productivity", "deep work"],
    },
    {
      title: "Focus Sounds",
      description: "Mix ambient sounds and noise generators to create your perfect focus environment.",
      icon: <Headphones className="h-6 w-6" />,
      href: "/focus-sounds",
      tags: ["audio", "ambient", "noise"],
      isNew: true,
    },
    {
      title: "Anti-Fatigue",
      description: "Combat mental exhaustion and maintain energy levels throughout your day.",
      icon: <Battery className="h-6 w-6" />,
      href: "/anti-fatigue",
      tags: ["energy", "fatigue", "wellness"],
    },
    {
      title: "Energy Management",
      description: "Track and optimize your energy patterns to work smarter, not harder.",
      icon: <Activity className="h-6 w-6" />,
      href: "/energy",
      tags: ["energy", "tracking", "optimization"],
    },
    {
      title: "Anti-Googlitis",
      description: "Break the habit of compulsively searching online for solutions to every problem.",
      icon: <ShieldCheck className="h-6 w-6" />,
      href: "/anti-googlitis",
      tags: ["focus", "productivity", "digital habits"],
    },
    {
      title: "Flow State",
      description: "Achieve and maintain the ideal state of focused immersion in your work.",
      icon: <Zap className="h-6 w-6" />,
      href: "/flow-state",
      tags: ["flow", "focus", "performance"],
    },
    {
      title: "Body Doubling",
      description: "Work alongside virtual partners to maintain accountability and focus.",
      icon: <Users className="h-6 w-6" />,
      href: "/body-doubling",
      tags: ["accountability", "adhd", "focus"],
    },
    {
      title: "Context Switching",
      description: "Minimize mental friction when moving between different tasks or projects.",
      icon: <RefreshCw className="h-6 w-6" />,
      href: "/context-switching",
      tags: ["productivity", "adhd", "workflow"],
      isNew: true,
    },
  ];

  const categories = [
    { id: 'all', label: 'All Tools' },
    { id: 'focus', label: 'Focus' },
    { id: 'adhd', label: 'ADHD' },
    { id: 'energy', label: 'Energy' },
    { id: 'productivity', label: 'Productivity' },
  ];

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = activeCategory === 'all' || tool.tags.includes(activeCategory);
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto py-12 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Focus & Productivity Tools</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Free online tools to enhance focus, manage energy levels, and optimize your productivity.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
        <div className="relative w-full sm:w-96">
          <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tools..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-3 sm:grid-cols-5 w-full sm:w-auto">
            {categories.map(category => (
              <TabsTrigger key={category.id} value={category.id}>{category.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool, index) => (
            <ToolCard key={index} {...tool} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No matching tools found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filter criteria
          </p>
          <Button variant="outline" onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}>
            Reset filters
          </Button>
        </div>
      )}

      <div className="bg-muted/30 rounded-lg p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Need more powerful features?</h2>
        <p className="text-muted-foreground mb-4">
          Get access to our full suite of productivity tools, personal dashboard, and progress tracking.
        </p>
        <Button size="lg" asChild>
          <Link to="/register">Create Free Account</Link>
        </Button>
      </div>
    </div>
  );
}

export default WebTools; 