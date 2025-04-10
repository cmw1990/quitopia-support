import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { motion } from 'framer-motion';
import { Brain, Zap, Hourglass, Award, MousePointer, Eye, Puzzle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../AuthProvider';
import { supabaseRequest } from '@/utils/supabaseRequest'; // Corrected import

// Game categories and metadata
const gameCategories = [
  {
    id: 'focus',
    name: 'Focus Training',
    description: 'Games that help improve sustained attention',
    icon: <Brain className="h-5 w-5" />,
    games: [
      { 
        id: 'zen-drift', 
        name: 'Zen Drift', 
        description: 'Stay focused on a moving target while ignoring distractions',
        difficulty: 'Medium',
        timeToComplete: '5 min',
        imageUrl: 'https://placehold.co/300x200/4F46E5/white?text=Zen+Drift'
      },
      { 
        id: 'stroop-test', 
        name: 'Stroop Test', 
        description: 'Identify the color of words, not the word itself',
        difficulty: 'Hard',
        timeToComplete: '3 min',
        imageUrl: 'https://placehold.co/300x200/10B981/white?text=Stroop+Test'
      },
      { 
        id: 'breathing-game', 
        name: 'Breathing Focus', 
        description: 'Sync your breathing with visual cues',
        difficulty: 'Easy',
        timeToComplete: '5 min',
        imageUrl: 'https://placehold.co/300x200/3B82F6/white?text=Breathing+Focus'
      }
    ]
  },
  {
    id: 'memory',
    name: 'Working Memory',
    description: 'Games that train your ability to hold and manipulate information',
    icon: <Zap className="h-5 w-5" />,
    games: [
      { 
        id: 'memory-cards', 
        name: 'Memory Cards', 
        description: 'Match pairs of cards by remembering their positions',
        difficulty: 'Medium',
        timeToComplete: '5 min',
        imageUrl: 'https://placehold.co/300x200/F59E0B/white?text=Memory+Cards'
      },
      { 
        id: 'sequence-memory', 
        name: 'Sequence Memory', 
        description: 'Remember and repeat sequences of increasing length',
        difficulty: 'Hard',
        timeToComplete: '4 min',
        imageUrl: 'https://placehold.co/300x200/EC4899/white?text=Sequence+Memory'
      },
      { 
        id: 'digit-span', 
        name: 'Digit Span', 
        description: 'Remember and recall a series of numbers',
        difficulty: 'Medium',
        timeToComplete: '3 min',
        imageUrl: 'https://placehold.co/300x200/8B5CF6/white?text=Digit+Span'
      }
    ]
  },
  {
    id: 'processing',
    name: 'Processing Speed',
    description: 'Games that enhance mental processing velocity',
    icon: <Hourglass className="h-5 w-5" />,
    games: [
      { 
        id: 'reaction-time', 
        name: 'Reaction Time', 
        description: 'Test how quickly you can respond to visual stimuli',
        difficulty: 'Easy',
        timeToComplete: '2 min',
        imageUrl: 'https://placehold.co/300x200/EF4444/white?text=Reaction+Time'
      },
      { 
        id: 'speed-typing', 
        name: 'Speed Typing', 
        description: 'Type words as quickly and accurately as possible',
        difficulty: 'Medium',
        timeToComplete: '3 min',
        imageUrl: 'https://placehold.co/300x200/14B8A6/white?text=Speed+Typing'
      },
      { 
        id: 'math-speed', 
        name: 'Math Speed', 
        description: 'Solve basic math problems against the clock',
        difficulty: 'Hard',
        timeToComplete: '3 min',
        imageUrl: 'https://placehold.co/300x200/F97316/white?text=Math+Speed'
      }
    ]
  },
  {
    id: 'pattern',
    name: 'Pattern Recognition',
    description: 'Games that develop pattern detection and abstract thinking',
    icon: <Puzzle className="h-5 w-5" />,
    games: [
      { 
        id: 'pattern-match', 
        name: 'Pattern Match', 
        description: 'Identify matching patterns in a grid of images',
        difficulty: 'Medium',
        timeToComplete: '4 min',
        imageUrl: 'https://placehold.co/300x200/6366F1/white?text=Pattern+Match'
      },
      { 
        id: 'visual-memory', 
        name: 'Visual Memory', 
        description: 'Remember the position of highlighted squares in a grid',
        difficulty: 'Hard',
        timeToComplete: '5 min',
        imageUrl: 'https://placehold.co/300x200/D946EF/white?text=Visual+Memory'
      },
      { 
        id: 'simon-says', 
        name: 'Simon Says', 
        description: 'Repeat increasingly complex patterns of colors and sounds',
        difficulty: 'Medium',
        timeToComplete: '4 min',
        imageUrl: 'https://placehold.co/300x200/0EA5E9/white?text=Simon+Says'
      }
    ]
  }
];

export function GamesSection() {
  const [selectedCategory, setSelectedCategory] = useState('focus');
  const navigate = useNavigate();
  const { session, user } = useAuth();
  const [loadingGame, setLoadingGame] = useState<string | null>(null);

  const handlePlayGame = async (gameId: string) => {
    setLoadingGame(gameId);
    
    // Start a focus session when playing a game
    if (user && session) {
      try {
        // Record the game session in the database
        // Use supabaseRequest, handle error, remove session arg
        const { error: startGameError } = await supabaseRequest(
          `/rest/v1/focus_game_sessions8`,
          {
            method: "POST",
            headers: { 'Prefer': 'return=minimal' }, // Don't need result back
            body: JSON.stringify({
              user_id: user.id,
              game_id: gameId,
              status: 'started',
              focus_benefits: getTotalFocusBenefits(gameId),
            })
          }
          // Removed session argument
        );
         if (startGameError) throw startGameError; // Propagate error
        
        // Navigate to the game
        navigate(`/app/games/${gameId}`);
      } catch (error) {
        console.error("Error starting game session:", error);
        toast.error("Couldn't start game session. Please try again.");
      } finally {
        setLoadingGame(null);
      }
    } else {
      // Allow playing without login, but prompt to sign in for progress tracking
      toast.info("Sign in to track your progress and earn focus points!");
      navigate(`/app/games/${gameId}`);
      setLoadingGame(null);
    }
  };
  
  // Calculate focus benefits for a game
  const getTotalFocusBenefits = (gameId: string) => {
    // Find the game in all categories
    for (const category of gameCategories) {
      const game = category.games.find(g => g.id === gameId);
      if (game) {
        // Base points by difficulty
        const difficultyPoints = game.difficulty === 'Easy' ? 10 : 
                                game.difficulty === 'Medium' ? 15 : 20;
        
        // Time-based multiplier (more time = more benefit)
        const timeMinutes = parseInt(game.timeToComplete.split(' ')[0]);
        const timeMultiplier = timeMinutes / 3; // 3 minutes is baseline
        
        return Math.round(difficultyPoints * timeMultiplier);
      }
    }
    return 10; // Default value if game not found
  };

  return (
    <div className="space-y-6">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-3">Focus Training Games</h2>
        <p className="text-muted-foreground mb-8">
          Strengthen your mental muscles with games designed to boost attention, memory, and cognitive processing.
          Each game targets specific mental faculties that help improve focus and reduce ADHD symptoms.
        </p>
      </div>

      <Tabs defaultValue="focus" value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8">
          {gameCategories.map(category => (
            <TabsTrigger key={category.id} value={category.id} className="flex items-center">
              {category.icon}
              <span className="ml-2">{category.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {gameCategories.map(category => (
          <TabsContent key={category.id} value={category.id}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {category.games.map((game, index) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="h-full flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle>{game.name}</CardTitle>
                      <CardDescription>{game.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="relative aspect-video mb-4 rounded-md overflow-hidden">
                        <img 
                          src={game.imageUrl} 
                          alt={game.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <div className="flex items-center">
                          <Award className="h-4 w-4 mr-1" />
                          <span>Difficulty: {game.difficulty}</span>
                        </div>
                        <div className="flex items-center">
                          <Hourglass className="h-4 w-4 mr-1" />
                          <span>{game.timeToComplete}</span>
                        </div>
                      </div>
                      <div className="border-t pt-3 mt-2">
                        <span className="text-sm font-medium flex items-center">
                          <Brain className="h-4 w-4 mr-1 text-blue-500" />
                          Focus Benefits: +{getTotalFocusBenefits(game.id)} points
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        onClick={() => handlePlayGame(game.id)}
                        disabled={loadingGame === game.id}
                      >
                        {loadingGame === game.id ? 'Loading...' : 'Play Game'}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
            
            <div className="text-center mt-8 text-muted-foreground">
              <p>Playing focus games for just 10 minutes daily can significantly improve attention span and cognitive control.</p>
              <div className="mt-4">
                <Button variant="outline" asChild>
                  <Link to="/app/games/benefits">Learn about cognitive benefits</Link>
                </Button>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}