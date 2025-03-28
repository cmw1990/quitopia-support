import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { GameCategory, Game } from './games/types';
import { Session } from '@supabase/supabase-js';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { BrainCircuit, Brain, Wind, Puzzle, Trophy, Activity, ArrowRight } from 'lucide-react';

interface GameHubProps {
  session: Session | null;
}

// Sample game data (to be replaced with real database data)
const gamesData: Game[] = [
  {
    id: 'breathing-exercise',
    name: 'Breathing Exercise',
    description: 'Focus on your breath to reduce stress and cravings',
    category: 'breathing',
    difficulty: 'easy',
    thumbnail: '/images/games/breathing-exercise.jpg',
    playTime: 3,
    benefits: ['Reduces stress', 'Manages cravings', 'Improves focus']
  },
  {
    id: 'memory-cards',
    name: 'Memory Match',
    description: 'Test your memory by matching card pairs',
    category: 'focus',
    difficulty: 'medium',
    thumbnail: '/images/games/memory-cards.jpg',
    playTime: 5,
    benefits: ['Improves memory', 'Enhances concentration', 'Distracts from cravings']
  },
  {
    id: 'zen-garden',
    name: 'Zen Garden',
    description: 'Create a peaceful garden to calm your mind',
    category: 'relaxation',
    difficulty: 'easy',
    thumbnail: '/images/games/zen-garden.jpg',
    playTime: 10,
    benefits: ['Promotes relaxation', 'Encourages creativity', 'Reduces anxiety']
  },
  {
    id: 'word-scramble',
    name: 'Word Scramble',
    description: 'Unscramble letters to form words',
    category: 'focus',
    difficulty: 'medium',
    thumbnail: '/images/games/word-scramble.jpg',
    playTime: 5, 
    benefits: ['Builds vocabulary', 'Challenges the mind', 'Improves cognition']
  },
  {
    id: 'pattern-match',
    name: 'Pattern Match',
    description: 'Recognize and complete visual patterns',
    category: 'focus',
    difficulty: 'hard',
    thumbnail: '/images/games/pattern-match.jpg',
    playTime: 3,
    benefits: ['Enhances pattern recognition', 'Builds cognitive flexibility', 'Improves visual processing']
  },
  {
    id: 'balloon-journey',
    name: 'Balloon Journey',
    description: 'Guide a balloon with controlled breathing',
    category: 'breathing',
    difficulty: 'medium',
    thumbnail: '/images/games/balloon-journey.jpg',
    playTime: 5,
    benefits: ['Regulates breathing', 'Encourages mindfulness', 'Enhances relaxation']
  }
];

const GameHub: React.FC<GameHubProps> = ({ session }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // Filter games based on active category
  const filteredGames = activeTab === 'all' 
    ? gamesData 
    : gamesData.filter(game => game.category === activeTab);
  
  // Get game icon based on category
  const getGameIcon = (category: GameCategory) => {
    switch (category) {
      case 'breathing':
        return <Wind className="h-6 w-6 text-blue-500" />;
      case 'focus':
        return <BrainCircuit className="h-6 w-6 text-purple-500" />;
      case 'relaxation':
        return <Brain className="h-6 w-6 text-green-500" />;
      case 'puzzle':
        return <Puzzle className="h-6 w-6 text-amber-500" />;
      default:
        return <Activity className="h-6 w-6 text-primary" />;
    }
  };
  
  // Get difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-primary/10 text-primary';
    }
  };
  
  // Handle game selection
  const handleGameSelect = (gameId: string) => {
    // Check if game is implemented
    const implementedGames = ['breathing-exercise', 'memory-cards', 'zen-garden', 'word-scramble', 'pattern-match', 'balloon-journey'];
    
    if (implementedGames.includes(gameId)) {
      navigate(`/app/games/${gameId}`);
    } else {
      // Show a placeholder for games not yet implemented
      navigate(`/app/games/${gameId}`);
    }
  };
  
  // Provide haptic feedback on game selection
  const provideHapticFeedback = () => {
    if (navigator.vibrate) {
      navigator.vibrate(15); // Light haptic feedback
    }
  };
  
  return (
    <div className="container px-4 py-6 mx-auto max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Game Hub</h1>
          <p className="text-muted-foreground">
            Interactive games to help you manage cravings and improve wellbeing
          </p>
        </div>
        
        <Card className="w-full md:w-auto">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 bg-primary/10">
                <AvatarFallback>
                  <Trophy className="h-5 w-5 text-primary" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">Your achievements</p>
                <p className="text-xs text-muted-foreground">Play games to earn rewards</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0 pb-4 px-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => {
                provideHapticFeedback();
                navigate('/app/achievements');
              }}
            >
              View All Achievements
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="mb-6 overflow-x-auto pb-2">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="all" className="flex gap-2 min-w-[80px]">
              <Activity className="h-4 w-4" />
              All Games
            </TabsTrigger>
            <TabsTrigger value="breathing" className="flex gap-2 min-w-[80px]">
              <Wind className="h-4 w-4" />
              Breathing
            </TabsTrigger>
            <TabsTrigger value="focus" className="flex gap-2 min-w-[80px]">
              <BrainCircuit className="h-4 w-4" />
              Focus
            </TabsTrigger>
            <TabsTrigger value="relaxation" className="flex gap-2 min-w-[80px]">
              <Brain className="h-4 w-4" />
              Relaxation
            </TabsTrigger>
            <TabsTrigger value="puzzle" className="flex gap-2 min-w-[80px]">
              <Puzzle className="h-4 w-4" />
              Puzzles
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGames.map(game => (
              <Card key={game.id} className="overflow-hidden h-full flex flex-col cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99]" onClick={() => {
                provideHapticFeedback();
                handleGameSelect(game.id);
              }}>
                <div className="aspect-video bg-muted relative">
                  <div className="absolute inset-0 flex items-center justify-center bg-primary/5">
                    {getGameIcon(game.category)}
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg md:text-xl">{game.name}</CardTitle>
                      <CardDescription>{game.description}</CardDescription>
                    </div>
                    <Badge className={getDifficultyColor(game.difficulty)}>
                      {game.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-2 flex-grow">
                  <div className="flex flex-wrap gap-1 mt-2">
                    {game.benefits.map((benefit, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="p-4 mt-auto">
                  <div className="flex justify-between items-center w-full">
                    <span className="text-sm text-muted-foreground flex items-center">
                      <Clock className="h-4 w-4 mr-1" /> {game.playTime} min
                    </span>
                    <Button size="sm">
                      Play Game <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="breathing" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGames.map(game => (
              <Card key={game.id} className="overflow-hidden h-full flex flex-col cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99]" onClick={() => handleGameSelect(game.id)}>
                <div className="aspect-video bg-muted relative">
                  <div className="absolute inset-0 flex items-center justify-center bg-primary/5">
                    {getGameIcon(game.category)}
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg md:text-xl">{game.name}</CardTitle>
                      <CardDescription>{game.description}</CardDescription>
                    </div>
                    <Badge className={getDifficultyColor(game.difficulty)}>
                      {game.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-2 flex-grow">
                  <div className="flex flex-wrap gap-1 mt-2">
                    {game.benefits.map((benefit, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="p-4 mt-auto">
                  <div className="flex justify-between items-center w-full">
                    <span className="text-sm text-muted-foreground flex items-center">
                      <Clock className="h-4 w-4 mr-1" /> {game.playTime} min
                    </span>
                    <Button size="sm">
                      Play Game <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Repeat for other categories */}
      </Tabs>
    </div>
  );
};

// Clock Icon Component
const Clock = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export default GameHub;