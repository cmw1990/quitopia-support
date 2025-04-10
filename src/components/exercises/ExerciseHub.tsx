import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@/lib/auth';
import {
  Activity, Heart, Calendar, Trophy, Filter, Search, Star,
  Info, Users, Brain, Eye, Dumbbell, Running, Bike,
  Moon, Sunrise, Clock, Lightbulb, Scale, Zap,
  BrainCircuit, Footprints, ArrowUpRight
} from 'lucide-react';
import {
  getExerciseCategories,
  getExercisesByCategory,
  getExerciseWithDetails,
  toggleExerciseFavorite,
  recordExerciseProgress,
  getUserExerciseHistory,
  getUserFavoriteExercises,
} from '@/lib/exercise-db';
import type {
  Exercise,
  ExerciseCategory,
  ExerciseWithDetails,
  UserExerciseProgress,
} from '@/types/exercise';
import ExerciseGuideCard from './ExerciseGuideCard';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const CATEGORY_ICONS = {
  'desk-exercises': Activity,
  'eye-health': Eye,
  'stress-relief': Brain,
  'reproductive-health': Heart,
  'circulation': Zap,
  'back-neck-care': Activity,
  'focus': BrainCircuit,
  'decision-fatigue': Brain,
  'walking': Footprints,
  'running': Running,
  'cycling': Bike,
  'night-shift': Moon,
  'creative-energy': Lightbulb,
  'extended-hours': Clock,
  'weight-loss': Scale,
  'body-recomp': Dumbbell,
} as const;

const DIFFICULTY_COLORS = {
  beginner: 'bg-green-500/10 text-green-700 dark:text-green-300',
  intermediate: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
  advanced: 'bg-red-500/10 text-red-700 dark:text-red-300',
} as const;

export default function ExerciseHub() {
  const { user } = useUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('discover');
  const [categories, setCategories] = useState<ExerciseCategory[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseWithDetails | null>(null);
  const [exerciseHistory, setExerciseHistory] = useState<(UserExerciseProgress & { exercise: Exercise })[]>([]);
  const [favoriteExercises, setFavoriteExercises] = useState<(Exercise & { category: ExerciseCategory })[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterDuration, setFilterDuration] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    loadInitialData();
  }, [user?.id]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [categories, history, favorites] = await Promise.all([
        getExerciseCategories(),
        getUserExerciseHistory(user!.id),
        getUserFavoriteExercises(user!.id),
      ]);
      
      setCategories(categories);
      setExerciseHistory(history);
      setFavoriteExercises(favorites);
    } catch (error) {
      toast({
        title: 'Error loading data',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || exercise.difficulty === filterDifficulty;
    const matchesDuration = filterDuration === 'all' ||
      (filterDuration === 'short' && exercise.duration <= 15) ||
      (filterDuration === 'medium' && exercise.duration > 15 && exercise.duration <= 30) ||
      (filterDuration === 'long' && exercise.duration > 30);

    return matchesSearch && matchesDifficulty && matchesDuration;
  });

  const loadExercises = async (categoryId: string) => {
    setIsLoading(true);
    try {
      const exercises = await getExercisesByCategory(categoryId);
      setExercises(exercises);
      setSelectedCategory(categoryId);
    } catch (error) {
      toast({
        title: 'Error loading exercises',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExerciseSelect = async (exerciseId: string) => {
    setIsLoading(true);
    try {
      const exercise = await getExerciseWithDetails(exerciseId, user?.id);
      setSelectedExercise(exercise);
    } catch (error) {
      toast({
        title: 'Error loading exercise details',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExerciseComplete = async (exerciseId: string, durationSeconds: number, caloriesBurned: number) => {
    try {
      await recordExerciseProgress(user!.id, exerciseId, durationSeconds, caloriesBurned);
      setSelectedExercise(null);
      loadInitialData(); // Refresh history
      toast({
        title: 'Exercise completed!',
        description: 'Your progress has been recorded.',
      });
    } catch (error) {
      toast({
        title: 'Error recording progress',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleFavorite = async (exerciseId: string) => {
    try {
      const isFavorite = await toggleExerciseFavorite(exerciseId, user!.id);
      if (selectedExercise?.id === exerciseId) {
        setSelectedExercise({ ...selectedExercise, is_favorite: isFavorite });
      }
      loadInitialData(); // Refresh favorites
      toast({
        title: isFavorite ? 'Added to favorites' : 'Removed from favorites',
      });
    } catch (error) {
      toast({
        title: 'Error updating favorites',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Exercise Hub</h1>
        <Badge variant="outline" className="text-primary">
          {user?.subscription_tier === 'premium' ? 'Premium' : 'Free'} Account
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="discover">
            <Activity className="w-4 h-4 mr-2" />
            Discover
          </TabsTrigger>
          <TabsTrigger value="history">
            <Calendar className="w-4 h-4 mr-2" />
            History
          </TabsTrigger>
          <TabsTrigger value="favorites">
            <Heart className="w-4 h-4 mr-2" />
            Favorites
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setShowFilters(true)}
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((category) => {
              const IconComponent = CATEGORY_ICONS[category.slug as keyof typeof CATEGORY_ICONS] || Activity;
              return (
                <Card
                  key={category.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    selectedCategory === category.id && "border-primary bg-primary/5"
                  )}
                  onClick={() => loadExercises(category.id)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <IconComponent className="w-5 h-5 text-primary" />
                      <span>{category.name}</span>
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {category.target_audience?.slice(0, 3).map((audience, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {audience}
                        </Badge>
                      ))}
                      {(category.target_audience?.length || 0) > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{(category.target_audience?.length || 0) - 3} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Exercise List */}
          {selectedCategory && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExercises.map((exercise) => (
                <Card
                  key={exercise.id}
                  className="cursor-pointer hover:shadow-md transition-all"
                  onClick={() => handleExerciseSelect(exercise.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <span>{exercise.name}</span>
                      </CardTitle>
                      <Badge className={cn(
                        DIFFICULTY_COLORS[exercise.difficulty as keyof typeof DIFFICULTY_COLORS]
                      )}>
                        {exercise.difficulty}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {exercise.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {exercise.duration} mins
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(exercise.id);
                        }}
                      >
                        <Heart
                          className={cn(
                            "w-4 h-4",
                            exercise.is_favorite && "fill-primary text-primary"
                          )}
                        />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exerciseHistory.map((entry) => (
              <Card key={entry.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{entry.exercise.name}</span>
                    <Badge variant="outline">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Duration</span>
                    <span>{entry.duration_minutes} mins</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Calories</span>
                    <span>{entry.calories_burned} kcal</span>
                  </div>
                  {entry.notes && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {entry.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteExercises.map((exercise) => (
              <Card
                key={exercise.id}
                className="cursor-pointer hover:shadow-md transition-all"
                onClick={() => handleExerciseSelect(exercise.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{exercise.name}</CardTitle>
                    <Badge className={cn(
                      DIFFICULTY_COLORS[exercise.difficulty as keyof typeof DIFFICULTY_COLORS]
                    )}>
                      {exercise.difficulty}
                    </Badge>
                  </div>
                  <CardDescription>
                    {exercise.category.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      {exercise.duration} mins
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(exercise.id);
                      }}
                    >
                      <Heart className="w-4 h-4 fill-primary text-primary" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Exercise Details Dialog */}
      <Dialog open={!!selectedExercise} onOpenChange={() => setSelectedExercise(null)}>
        <DialogContent className="max-w-4xl">
          {selectedExercise && (
            <ExerciseGuideCard
              exercise={selectedExercise}
              onComplete={handleExerciseComplete}
              onFavoriteToggle={() => handleToggleFavorite(selectedExercise.id)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Filters Dialog */}
      <Dialog open={showFilters} onOpenChange={setShowFilters}>
        <DialogContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty</label>
              <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Duration</label>
              <Select value={filterDuration} onValueChange={setFilterDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Durations</SelectItem>
                  <SelectItem value="short">Quick (≤15 mins)</SelectItem>
                  <SelectItem value="medium">Medium (15-30 mins)</SelectItem>
                  <SelectItem value="long">Long {'>'}30 mins</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setFilterDifficulty('all');
                setFilterDuration('all');
              }}>
                Reset
              </Button>
              <Button onClick={() => setShowFilters(false)}>
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
