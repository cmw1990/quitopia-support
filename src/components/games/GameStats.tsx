import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useAuth } from '../AuthProvider';
import { supabaseRequest } from '@/utils/supabaseRequest'; // Corrected import
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { CalendarIcon, TrophyIcon, BrainIcon, ActivityIcon } from 'lucide-react';

// Types
interface GameResult {
  id: string;
  game_id: string;
  score: number;
  level_reached?: number;
  correct_matches?: number;
  total_attempts?: number;
  accuracy?: number;
  moves_made?: number;
  pairs_matched?: number;
  time_played?: number;
  breath_count?: number;
  longest_focus_streak?: number;
  distractions?: number;
  date_played: string;
}

interface GameSummary {
  game_id: string;
  total_played: number;
  avg_score: number;
  max_score: number;
  avg_level: number;
  max_level: number;
  total_time_played: number;
}

interface AggregatedDataPoint {
  date: string;
  score: number;
  games_played: number;
}

const GAME_NAMES: Record<string, string> = {
  'pattern-match': 'Pattern Match',
  'memory-cards': 'Memory Cards',
  'zen-drift': 'Zen Drift',
  'word-scramble': 'Word Scramble',
  'reaction-test': 'Reaction Test',
};

export function GameStats() {
  const { user, session } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [gameResults, setGameResults] = useState<GameResult[]>([]);
  const [gameSummaries, setGameSummaries] = useState<GameSummary[]>([]);
  const [aggregatedData, setAggregatedData] = useState<AggregatedDataPoint[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('week');

  // Load game results
  useEffect(() => {
    const fetchGameResults = async () => {
      if (!user || !session) return;
      
      try {
        setIsLoading(true);
        
        // Date range based on selected timeRange
        const today = new Date();
        let startDate;
        
        switch (timeRange) {
          case 'week':
            startDate = subDays(today, 7);
            break;
          case 'month':
            startDate = subDays(today, 30);
            break;
          case 'year':
            startDate = subDays(today, 365);
            break;
          default:
            startDate = subDays(today, 7);
        }
        
        const formattedStartDate = startDate.toISOString();
        
        // Fetch game results
        // Use supabaseRequest, handle response, remove session arg
        const { data: response, error: fetchError } = await supabaseRequest<GameResult[]>(
          `/rest/v1/focus_game_results8?user_id=eq.${user.id}&date_played=gte.${formattedStartDate}&order=date_played.desc`,
          { method: 'GET' }
          // Removed session argument
        );
        if (fetchError) throw fetchError; // Propagate error
        
        if (Array.isArray(response)) {
          setGameResults(response);
          processGameData(response);
        }
      } catch (error) {
        console.error('Error fetching game results:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGameResults();
  }, [user, session, timeRange]);
  
  // Process game data for charts and summaries
  const processGameData = (results: GameResult[]) => {
    // Generate game summaries
    const summariesByGame: Record<string, GameSummary> = {};
    
    // Process each result to create summaries
    results.forEach(result => {
      const { game_id, score, level_reached, time_played } = result;
      
      if (!summariesByGame[game_id]) {
        summariesByGame[game_id] = {
          game_id,
          total_played: 0,
          avg_score: 0,
          max_score: 0,
          avg_level: 0,
          max_level: 0,
          total_time_played: 0
        };
      }
      
      const summary = summariesByGame[game_id];
      summary.total_played += 1;
      summary.avg_score = ((summary.avg_score * (summary.total_played - 1)) + score) / summary.total_played;
      summary.max_score = Math.max(summary.max_score, score);
      
      if (level_reached) {
        summary.avg_level = ((summary.avg_level * (summary.total_played - 1)) + level_reached) / summary.total_played;
        summary.max_level = Math.max(summary.max_level, level_reached);
      }
      
      if (time_played) {
        summary.total_time_played += time_played;
      }
    });
    
    setGameSummaries(Object.values(summariesByGame));
    
    // Generate aggregated data for charts
    const dataByDate: Record<string, AggregatedDataPoint> = {};
    
    results.forEach(result => {
      const date = format(new Date(result.date_played), 'MMM dd');
      
      if (!dataByDate[date]) {
        dataByDate[date] = {
          date,
          score: 0,
          games_played: 0
        };
      }
      
      dataByDate[date].score += result.score;
      dataByDate[date].games_played += 1;
    });
    
    // Sort by date
    const sortedData = Object.values(dataByDate).sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
    
    setAggregatedData(sortedData);
  };
  
  // Format time in seconds to mm:ss or hh:mm:ss
  const formatTime = (seconds?: number) => {
    if (!seconds) return '0:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }
    
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  // Calculate total stats
  const getTotalStats = () => {
    const totalGamesPlayed = gameResults.length;
    const totalScore = gameResults.reduce((sum, result) => sum + result.score, 0);
    const totalTimePlayed = gameResults.reduce((sum, result) => sum + (result.time_played || 0), 0);
    
    return {
      totalGamesPlayed,
      totalScore,
      totalTimePlayed,
    };
  };
  
  // If user is not logged in, show login prompt
  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Game Statistics</CardTitle>
            <CardDescription className="text-center">
              Sign in to track your progress and see your game statistics
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <p className="text-center text-muted-foreground">
              Create an account or sign in to save your game progress and track your improvement over time.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Calculate stats
  const { totalGamesPlayed, totalScore, totalTimePlayed } = getTotalStats();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
            <div>
              <CardTitle className="text-2xl">Game Statistics</CardTitle>
              <CardDescription>
                Track your progress and performance across all focus games
              </CardDescription>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="font-medium">Time Range:</div>
              <div className="flex">
                <Button 
                  variant={timeRange === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('week')}
                  className="rounded-r-none"
                >
                  Week
                </Button>
                <Button 
                  variant={timeRange === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('month')}
                  className="rounded-none border-x-0"
                >
                  Month
                </Button>
                <Button 
                  variant={timeRange === 'year' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('year')}
                  className="rounded-l-none"
                >
                  Year
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-pulse text-center">
                <div className="h-8 w-32 bg-muted rounded mx-auto mb-4"></div>
                <div className="h-4 w-48 bg-muted rounded mx-auto"></div>
              </div>
            </div>
          ) : gameResults.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center p-4 bg-muted rounded-full mb-4">
                <ActivityIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No game data yet</h3>
              <p className="text-muted-foreground mt-2">
                Play some focus games to start tracking your progress!
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="flex items-center space-x-4 pt-6">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <ActivityIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Games Played</p>
                      <h3 className="text-2xl font-bold">{totalGamesPlayed}</h3>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="flex items-center space-x-4 pt-6">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <TrophyIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Score</p>
                      <h3 className="text-2xl font-bold">{totalScore.toLocaleString()}</h3>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="flex items-center space-x-4 pt-6">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <CalendarIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Time Played</p>
                      <h3 className="text-2xl font-bold">{formatTime(totalTimePlayed)}</h3>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Game Progress Charts */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Progress Over Time</h3>
                
                <div className="bg-card border rounded-lg p-4">
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={aggregatedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="score" name="Score" stroke="#8884d8" activeDot={{ r: 8 }} />
                        <Line yAxisId="right" type="monotone" dataKey="games_played" name="Games Played" stroke="#82ca9d" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              {/* Game Summaries */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Game Performance</h3>
                
                <div className="bg-card border rounded-lg p-4">
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={gameSummaries} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="game_id" tickFormatter={(value) => GAME_NAMES[value] || value} />
                        <YAxis />
                        <Tooltip 
                          formatter={(value, name, props) => {
                            if (name === 'avg_score') return [Math.round(value as number), 'Avg Score'];
                            if (name === 'max_score') return [value, 'Max Score'];
                            return [value, name];
                          }}
                          labelFormatter={(value) => GAME_NAMES[value] || value}
                        />
                        <Legend />
                        <Bar dataKey="avg_score" name="Avg Score" fill="#8884d8" />
                        <Bar dataKey="max_score" name="Max Score" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              {/* Recent Games */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Recent Games</h3>
                
                <div className="bg-card border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted">
                          <th className="px-4 py-3 text-left">Game</th>
                          <th className="px-4 py-3 text-left">Date</th>
                          <th className="px-4 py-3 text-right">Score</th>
                          <th className="px-4 py-3 text-right">Level</th>
                          <th className="px-4 py-3 text-right">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gameResults.slice(0, 5).map((result) => (
                          <tr key={result.id} className="border-t">
                            <td className="px-4 py-3">
                              {GAME_NAMES[result.game_id] || result.game_id}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {format(new Date(result.date_played), 'MMM dd, yyyy HH:mm')}
                            </td>
                            <td className="px-4 py-3 text-right font-medium">
                              {result.score}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {result.level_reached || '-'}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {formatTime(result.time_played)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 