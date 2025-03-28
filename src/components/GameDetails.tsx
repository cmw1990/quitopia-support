import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowLeft, Clock, Trophy, User, Calendar, BarChart, Brain, X } from 'lucide-react';
import { Game, GameStats } from './games/types';

// Update the props interface to include gameId, onPlayGame, and onBack
export interface GameDetailsProps {
  gameId: string;
  onPlayGame: (gameId: string) => void;
  onBack: () => void;
}

// Sample game data - would be fetched from API in a production app
const gamesData: Game[] = [
  {
    id: 'breathing-exercise',
    name: 'Breathing Exercise',
    description: 'Focus on your breath to reduce stress and cravings',
    category: 'breathing',
    difficulty: 'easy',
    thumbnail: 'icon',
    playTime: 3,
    benefits: ['Reduces stress', 'Manages cravings', 'Improves focus']
  },
  {
    id: 'memory-cards',
    name: 'Memory Match',
    description: 'Test your memory by matching card pairs',
    category: 'focus',
    difficulty: 'medium',
    thumbnail: 'icon',
    playTime: 5,
    benefits: ['Improves memory', 'Enhances concentration', 'Distracts from cravings']
  },
  {
    id: 'zen-garden',
    name: 'Zen Garden',
    description: 'Create a peaceful garden to calm your mind',
    category: 'relaxation',
    difficulty: 'easy',
    thumbnail: 'icon',
    playTime: 10,
    benefits: ['Promotes relaxation', 'Encourages creativity', 'Reduces anxiety']
  },
  {
    id: 'word-scramble',
    name: 'Word Scramble',
    description: 'Unscramble words as fast as you can',
    category: 'focus',
    difficulty: 'medium',
    thumbnail: 'icon',
    playTime: 2,
    benefits: ['Improves cognitive speed', 'Enhances vocabulary', 'Builds focus']
  },
  {
    id: 'pattern-match',
    name: 'Pattern Match',
    description: 'Recognize and complete visual patterns',
    category: 'focus',
    difficulty: 'hard',
    thumbnail: 'icon',
    playTime: 3,
    benefits: ['Enhances pattern recognition', 'Builds cognitive flexibility', 'Improves visual processing']
  },
  {
    id: 'balloon-journey',
    name: 'Balloon Journey',
    description: 'Navigate through obstacles while controlling your breathing',
    category: 'breathing',
    difficulty: 'medium',
    thumbnail: 'icon',
    playTime: 5,
    benefits: ['Improves breathing control', 'Enhances focus', 'Reduces stress']
  }
];

const GameDetails: React.FC<GameDetailsProps> = ({ gameId, onPlayGame, onBack }) => {
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  
  useEffect(() => {
    // Find the game by ID - would be an API call in production
    const foundGame = gamesData.find(g => g.id === gameId);
    
    if (foundGame) {
      setGame(foundGame);
      
      // Sample stats - would be fetched from API in production
      setGameStats({
        timesPlayed: 5,
        averageScore: 78,
        highScore: 95,
        totalTimePlayed: 840, // in seconds
        mostPlayed: foundGame.id === 'breathing-exercise'
      });
    }
  }, [gameId]);
  
  const handlePlay = () => {
    onPlayGame(gameId);
  };
  
  // Format time as HH:MM:SS or MM:SS depending on length
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
  
  if (!game) {
    return (
      <div className="container px-4 py-6 mx-auto max-w-3xl">
        <Button variant="outline" onClick={onBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Games
        </Button>
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <X className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Game Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The game you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={onBack}>
                Return to Game Hub
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container px-4 py-6 mx-auto max-w-3xl">
      <Button variant="outline" onClick={onBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Games
      </Button>
      
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{game.name}</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/achievements')}
          className="flex items-center gap-2"
        >
          <Trophy className="h-4 w-4" />
          Achievements
        </Button>
      </div>
      
      <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{game.name}</CardTitle>
                  <CardDescription>{game.description}</CardDescription>
                </div>
                <Badge className={getDifficultyColor(game.difficulty)}>
                  {game.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Time</p>
                    <p className="font-medium">{game.playTime} minutes</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">High Score</p>
                    <p className="font-medium">{gameStats?.highScore || 'No score yet'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Games Played</p>
                    <p className="font-medium">{gameStats?.timesPlayed || 0}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Benefits</h3>
                <div className="flex flex-wrap gap-2">
                  {game.benefits.map((benefit, index) => (
                    <Badge key={index} variant="outline" className="font-normal">
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">How to Play</h3>
                {game.id === 'breathing-exercise' && (
                  <div className="space-y-2 text-muted-foreground">
                    <p>1. Set your preferred breathing rate (breaths per minute)</p>
                    <p>2. Press start and follow the animated circle</p>
                    <p>3. Inhale when it expands, exhale when it contracts</p>
                    <p>4. Complete a full session to earn a calm score</p>
                  </div>
                )}
                
                {game.id === 'memory-cards' && (
                  <div className="space-y-2 text-muted-foreground">
                    <p>1. Flip cards by clicking on them</p>
                    <p>2. Find matching pairs of cards</p>
                    <p>3. Match all pairs to complete the game</p>
                    <p>4. Faster completion with fewer moves earns a higher score</p>
                  </div>
                )}
                
                {game.id === 'zen-garden' && (
                  <div className="space-y-2 text-muted-foreground">
                    <p>1. Create your garden by adding different elements</p>
                    <p>2. Arrange rocks, plants, and water features</p>
                    <p>3. Find your zen as you design your space</p>
                    <p>4. Your garden's balance affects your relaxation score</p>
                  </div>
                )}
                
                {game.id === 'word-scramble' && (
                  <div className="space-y-2 text-muted-foreground">
                    <p>1. Unscramble the jumbled letters to form a real word</p>
                    <p>2. Type your answer and submit</p>
                    <p>3. Solve as many words as you can before time runs out</p>
                    <p>4. Points are awarded based on difficulty and speed</p>
                  </div>
                )}
                
                {game.id === 'pattern-match' && (
                  <div className="space-y-2 text-muted-foreground">
                    <p>1. Observe the sequence of shapes and colors</p>
                    <p>2. Select the shape that completes the pattern</p>
                    <p>3. Match as many patterns as you can within the time limit</p>
                    <p>4. More difficult patterns award more points</p>
                  </div>
                )}
                
                {game.id === 'balloon-journey' && (
                  <div className="space-y-2 text-muted-foreground">
                    <p>1. Control your breathing in sync with the on-screen indicator</p>
                    <p>2. Inhale to make the balloon rise, exhale to descend</p>
                    <p>3. Navigate around obstacles to travel further</p>
                    <p>4. Your score increases with distance and obstacles avoided</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button size="lg" onClick={handlePlay} className="w-full">
                Play Now
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Your Stats</CardTitle>
              <CardDescription>
                Track your progress and achievements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {gameStats ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-primary/5 p-4 rounded-lg text-center">
                      <Trophy className="h-5 w-5 mx-auto mb-1 text-primary" />
                      <p className="text-sm text-muted-foreground">High Score</p>
                      <p className="text-2xl font-bold">{gameStats.highScore}</p>
                    </div>
                    
                    <div className="bg-primary/5 p-4 rounded-lg text-center">
                      <BarChart className="h-5 w-5 mx-auto mb-1 text-primary" />
                      <p className="text-sm text-muted-foreground">Average Score</p>
                      <p className="text-2xl font-bold">{gameStats.averageScore}</p>
                    </div>
                    
                    <div className="bg-primary/5 p-4 rounded-lg text-center">
                      <Calendar className="h-5 w-5 mx-auto mb-1 text-primary" />
                      <p className="text-sm text-muted-foreground">Games Played</p>
                      <p className="text-2xl font-bold">{gameStats.timesPlayed}</p>
                    </div>
                    
                    <div className="bg-primary/5 p-4 rounded-lg text-center">
                      <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
                      <p className="text-sm text-muted-foreground">Total Time</p>
                      <p className="text-2xl font-bold">{formatTime(gameStats.totalTimePlayed)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Activity chart would go here in production version
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Stats Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Play this game to start tracking your progress!
                  </p>
                  <Button onClick={handlePlay}>
                    Play Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GameDetails; 