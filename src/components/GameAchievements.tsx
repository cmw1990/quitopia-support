import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Session } from '@supabase/supabase-js';
import { Trophy, Medal, Award, Star, Crown, Flag, Clock, Zap } from 'lucide-react';
import { supabaseRestCall } from "../api/apiCompatibility";

interface GameAchievementsProps {
  session: Session | null;
}

interface GameAchievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  completed: boolean;
  unlocked_at?: string;
  game_id?: string;
}

const GameAchievements: React.FC<GameAchievementsProps> = ({ session }) => {
  const [achievements, setAchievements] = useState<GameAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  
  useEffect(() => {
    if (session?.user) {
      fetchAchievements();
    } else {
      // Sample achievements for non-authenticated users
      setAchievements(getSampleAchievements());
      setIsLoading(false);
    }
  }, [session]);
  
  const fetchAchievements = async () => {
    setIsLoading(true);
    
    try {
      if (!session?.user?.id) {
        setAchievements(getSampleAchievements());
        setIsLoading(false);
        return;
      }
      
      // Fetch game progress using REST API
      const gameProgress = await supabaseRestCall(
        `/rest/v1/game_progress?user_id=eq.${session.user.id}`,
        {
          method: 'GET',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          }
        },
        session
      );
      
      // Ensure gameProgress is treated as an array
      const progressArray = Array.isArray(gameProgress) ? gameProgress : [];
      
      if (progressArray.length > 0) {
        // Process game progress to generate achievements
        const achievements = generateAchievementsFromProgress(progressArray);
        setAchievements(achievements);
      } else {
        setAchievements(getSampleAchievements());
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
      setAchievements(getSampleAchievements());
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate achievements based on game progress
  const generateAchievementsFromProgress = (gameProgress: any[]) => {
    const achievements: GameAchievement[] = getSampleAchievements();
    
    // Group progress by game
    const gameProgressMap: Record<string, any[]> = {};
    gameProgress.forEach(progress => {
      if (!gameProgressMap[progress.game_id]) {
        gameProgressMap[progress.game_id] = [];
      }
      gameProgressMap[progress.game_id].push(progress);
    });
    
    // Update achievement progress based on game progress
    achievements.forEach(achievement => {
      if (achievement.game_id && gameProgressMap[achievement.game_id]) {
        const gameProgressItems = gameProgressMap[achievement.game_id];
        
        // Memory Game achievements
        if (achievement.game_id === 'memory-cards') {
          // Calculate total games played
          if (achievement.id === 'memory-games-played') {
            const gamesPlayed = gameProgressItems.length;
            achievement.progress = Math.min(100, (gamesPlayed / 10) * 100);
            achievement.completed = gamesPlayed >= 10;
            
            if (achievement.completed) {
              achievement.unlocked_at = new Date().toISOString();
            }
          }
          
          // High score achievement
          if (achievement.id === 'memory-master') {
            const highScore = Math.max(...gameProgressItems.map(p => p.score || 0));
            achievement.progress = Math.min(100, (highScore / 90) * 100);
            achievement.completed = highScore >= 90;
            
            if (achievement.completed) {
              achievement.unlocked_at = new Date().toISOString();
            }
          }
        }
        
        // Breathing exercise achievements
        if (achievement.game_id === 'breathing-exercise') {
          // Calculate total breathing sessions
          if (achievement.id === 'breathing-sessions') {
            const sessionsCompleted = gameProgressItems.length;
            achievement.progress = Math.min(100, (sessionsCompleted / 5) * 100);
            achievement.completed = sessionsCompleted >= 5;
            
            if (achievement.completed) {
              achievement.unlocked_at = new Date().toISOString();
            }
          }
          
          // High calm score achievement
          if (achievement.id === 'zen-master') {
            const highScore = Math.max(...gameProgressItems.map(p => p.score || 0));
            achievement.progress = Math.min(100, (highScore / 95) * 100);
            achievement.completed = highScore >= 95;
            
            if (achievement.completed) {
              achievement.unlocked_at = new Date().toISOString();
            }
          }
        }
      }
    });
    
    return achievements;
  };
  
  // Sample achievement data (would come from database in production)
  const getSampleAchievements = (): GameAchievement[] => {
    return [
      {
        id: 'first-game',
        title: 'First Steps',
        description: 'Complete your first game',
        icon: <Trophy className="h-6 w-6 text-yellow-500" />,
        progress: 100,
        completed: true,
        unlocked_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'breathing-sessions',
        title: 'Deep Breather',
        description: 'Complete 5 breathing exercise sessions',
        icon: <Wind className="h-6 w-6 text-blue-500" />,
        progress: 60,
        completed: false,
        game_id: 'breathing-exercise'
      },
      {
        id: 'zen-master',
        title: 'Zen Master',
        description: 'Reach a calm score of 95 or higher',
        icon: <Award className="h-6 w-6 text-purple-500" />,
        progress: 80,
        completed: false,
        game_id: 'breathing-exercise'
      },
      {
        id: 'memory-games-played',
        title: 'Memory Champion',
        description: 'Play the memory game 10 times',
        icon: <Medal className="h-6 w-6 text-amber-500" />,
        progress: 30,
        completed: false,
        game_id: 'memory-cards'
      },
      {
        id: 'memory-master',
        title: 'Perfect Match',
        description: 'Score 90 or higher in Memory Match',
        icon: <Star className="h-6 w-6 text-yellow-500" />,
        progress: 70,
        completed: false,
        game_id: 'memory-cards'
      },
      {
        id: 'perfect-streak',
        title: 'Perfect Streak',
        description: 'Complete 3 games in a row with a score of 85+',
        icon: <Zap className="h-6 w-6 text-orange-500" />,
        progress: 33,
        completed: false
      },
      {
        id: 'daily-challenge',
        title: 'Daily Challenger',
        description: 'Complete a game every day for 7 days',
        icon: <Flag className="h-6 w-6 text-green-500" />,
        progress: 45,
        completed: false
      },
      {
        id: 'puzzle-master',
        title: 'Puzzle Master',
        description: 'Complete all puzzle games at least once',
        icon: <Crown className="h-6 w-6 text-purple-500" />,
        progress: 50,
        completed: false
      }
    ];
  };
  
  // Filter achievements based on active tab
  const getFilteredAchievements = () => {
    if (activeTab === 'all') return achievements;
    if (activeTab === 'unlocked') return achievements.filter(a => a.completed);
    return achievements.filter(a => !a.completed);
  };
  
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  return (
    <div className="container px-4 py-6 mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Your Achievements</h1>
        <p className="text-muted-foreground">
          Track your progress and unlock rewards as you play games
        </p>
      </div>
      
      <div className="flex mb-6 overflow-auto pb-2">
        <Button 
          variant={activeTab === 'all' ? 'default' : 'outline'} 
          onClick={() => setActiveTab('all')}
          className="mr-2"
        >
          All ({achievements.length})
        </Button>
        <Button 
          variant={activeTab === 'unlocked' ? 'default' : 'outline'} 
          onClick={() => setActiveTab('unlocked')}
          className="mr-2"
        >
          Unlocked ({achievements.filter(a => a.completed).length})
        </Button>
        <Button 
          variant={activeTab === 'locked' ? 'default' : 'outline'} 
          onClick={() => setActiveTab('locked')}
        >
          In Progress ({achievements.filter(a => !a.completed).length})
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {getFilteredAchievements().map(achievement => (
            <Card key={achievement.id} className={achievement.completed ? 'border-primary/30 bg-primary/5' : ''}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-2 ${achievement.completed ? 'bg-primary/20' : 'bg-muted'}`}>
                      {achievement.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{achievement.title}</CardTitle>
                      <CardDescription>{achievement.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={achievement.completed ? 'default' : 'outline'}>
                    {achievement.completed ? 'Unlocked' : 'In Progress'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                {!achievement.completed && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Progress</span>
                      <span>{achievement.progress}%</span>
                    </div>
                    <Progress value={achievement.progress} className="h-2" />
                  </div>
                )}
                
                {achievement.completed && achievement.unlocked_at && (
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Unlocked on {formatDate(achievement.unlocked_at)}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {!isLoading && getFilteredAchievements().length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
            <h3 className="text-xl font-semibold mb-2">No achievements found</h3>
            <p className="text-muted-foreground mb-6">
              {activeTab === 'unlocked' 
                ? "You haven't unlocked any achievements yet. Play more games to earn rewards!"
                : activeTab === 'locked'
                  ? "No in-progress achievements to display."
                  : "No achievements found. Start playing games to earn rewards!"}
            </p>
            <Button>Play Games</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GameAchievements;

function Wind(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
      <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
      <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
    </svg>
  )
} 