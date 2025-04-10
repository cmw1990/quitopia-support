import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { useFatigue, FatigueStrategy } from './AntiFatigueContext';
import { Brain, Coffee, Users, Dumbbell, BookOpen, Zap, Heart, Search, Sparkles, Tag, Clock } from 'lucide-react';

interface StrategyCardProps {
  strategy: FatigueStrategy;
}

export function FatigueStrategyLibrary() {
  const { strategies = [] } = useFatigue();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedFatigueTypes, setSelectedFatigueTypes] = useState<string[]>([]);
  
  // Filter strategies based on search term and selected tags
  const filteredStrategies = strategies.filter(strategy => {
    // Search term filter
    const matchesSearch = !searchTerm || 
      strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      strategy.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Tags filter
    const matchesTags = selectedTags.length === 0 || 
      strategy.tags.some(tag => selectedTags.includes(tag));
    
    // Fatigue types filter
    const matchesFatigueTypes = selectedFatigueTypes.length === 0 || 
      selectedFatigueTypes.includes(strategy.fatigue_type);
    
    return matchesSearch && matchesTags && matchesFatigueTypes;
  });
  
  // Get all unique tags from strategies
  const allTags = Array.from(
    new Set(strategies.flatMap(strategy => strategy.tags))
  );
  
  // Get all unique fatigue types from strategies
  const allFatigueTypes = Array.from(
    new Set(strategies.map(strategy => strategy.fatigue_type))
  );
  
  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };
  
  // Toggle fatigue type selection
  const toggleFatigueType = (type: string) => {
    setSelectedFatigueTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };
  
  // Get icon based on strategy type
  const getStrategyIcon = (fatigueType: string) => {
    if (fatigueType === 'mental') {
      return <Brain className="h-5 w-5 text-indigo-500" />;
    } else if (fatigueType === 'physical') {
      return <Dumbbell className="h-5 w-5 text-green-500" />;
    } else if (fatigueType === 'emotional') {
      return <Heart className="h-5 w-5 text-red-500" />;
    } else if (fatigueType === 'sensory') {
      return <Zap className="h-5 w-5 text-amber-500" />;
    } else {
      return <Coffee className="h-5 w-5 text-blue-500" />;
    }
  };
  
  // Render effectiveness stars
  const renderEffectiveness = (level: number) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Sparkles
            key={i}
            className={`h-3.5 w-3.5 ${
              i < level ? 'text-amber-500' : 'text-muted-foreground/30'
            }`}
          />
        ))}
      </div>
    );
  };
  
  // Format duration in minutes to readable format
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 
        ? `${hours} hr ${remainingMinutes} min` 
        : `${hours} hr`;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Fatigue Management Strategies
        </CardTitle>
        <CardDescription>
          Find evidence-based strategies to manage different types of fatigue
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search and filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search strategies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter by tags:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter by fatigue type:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {allFatigueTypes.map(type => (
                <Badge
                  key={type}
                  variant={selectedFatigueTypes.includes(type) ? "default" : "outline"}
                  className={`cursor-pointer ${
                    type === 'mental' ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200' :
                    type === 'physical' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                    type === 'emotional' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                    type === 'sensory' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' :
                    ''
                  }`}
                  onClick={() => toggleFatigueType(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        {/* Strategy cards */}
        {filteredStrategies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStrategies.map(strategy => (
              <Card key={strategy.id} className="overflow-hidden border border-muted hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getStrategyIcon(strategy.fatigue_type)}
                      <CardTitle className="text-base">{strategy.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatDuration(strategy.duration_minutes)}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2 text-sm">
                  <p className="line-clamp-3">{strategy.description}</p>
                </CardContent>
                <CardFooter className="flex flex-col items-start">
                  <div className="w-full flex items-center justify-between mb-2">
                    <div className="text-xs text-muted-foreground">Effectiveness</div>
                    {renderEffectiveness(strategy.effectiveness_rating)}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {strategy.fatigue_type.charAt(0).toUpperCase() + strategy.fatigue_type.slice(1)}
                    </Badge>
                    {strategy.adhd_specific && (
                      <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                        ADHD-specific
                      </Badge>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No matching strategies</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or search term
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setSelectedTags([]);
                setSelectedFatigueTypes([]);
              }}
            >
              Reset filters
            </Button>
          </div>
        )}
        
        {/* Empty state */}
        {strategies.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">Strategy Library</h3>
            <p className="text-muted-foreground mb-4">
              Strategies will appear here after you track your fatigue levels
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 