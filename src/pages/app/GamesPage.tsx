import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { toast } from '../../components/ui/toast';
import { useAuth } from '../../contexts/AuthContext';
import { GameService } from '../../services/game-service';

const GAME_DETAILS = {
  pattern_match: {
    name: 'Pattern Matching',
    description: 'Test and improve your cognitive pattern recognition skills.',
    icon: '🧩',
    route: '/app/games/pattern-match'
  },
  memory_cards: {
    name: 'Memory Cards',
    description: 'Challenge your memory and concentration.',
    icon: '🃏',
    route: '/app/games/memory-cards'
  },
  zen_drift: {
    name: 'Zen Drift',
    description: 'A meditative game to enhance focus and mindfulness.',
    icon: '🌊',
    route: '/app/games/zen-drift'
  }
};

const GamesPage: React.FC = () => {
  const { user } = useAuth();
  const [gameStats, setGameStats] = useState<{
    [key in keyof typeof GAME_DETAILS]: {
      totalSessions: number;
      highestScore: number;
      averageScore: number;
      completedSessions: number;
    }
  }>({
    pattern_match: {
      totalSessions: 0,
      highestScore: 0,
      averageScore: 0,
      completedSessions: 0
    },
    memory_cards: {
      totalSessions: 0,
      highestScore: 0,
      averageScore: 0,
      completedSessions: 0
    },
    zen_drift: {
      totalSessions: 0,
      highestScore: 0,
      averageScore: 0,
      completedSessions: 0
    }
  });
  const [leaderboards, setLeaderboards] = useState<{
    [key in keyof typeof GAME_DETAILS]: Array<{
      userId: string;
      username: string;
      highestScore: number;
    }>
  }>({
    pattern_match: [],
    memory_cards: [],
    zen_drift: []
  });
  const [gameRecommendations, setGameRecommendations] = useState<Array<{
    recommended_game: keyof typeof GAME_DETAILS;
    reason: string;
  }>>([]);

  // Fetch game data
  useEffect(() => {
    const fetchGameData = async () => {
      if (!user) return;

      try {
        // Fetch stats for each game type
        const gameTypes = Object.keys(GAME_DETAILS) as Array<keyof typeof GAME_DETAILS>;
        const statsPromises = gameTypes.map(async (gameType) => {
          const stats = await GameService.getUserGameStats(user.id, gameType);
          return { gameType, stats };
        });

        const leaderboardPromises = gameTypes.map(async (gameType) => {
          const leaderboard = await GameService.getLeaderboard(gameType);
          return { gameType, leaderboard };
        });

        // Fetch game recommendations
        const recommendations = await GameService.generateGameRecommendations(user.id);

        // Resolve all promises
        const statsResults = await Promise.all(statsPromises);
        const leaderboardResults = await Promise.all(leaderboardPromises);

        // Update state
        const newGameStats = { ...gameStats };
        statsResults.forEach(({ gameType, stats }) => {
          newGameStats[gameType] = stats;
        });
        setGameStats(newGameStats);

        const newLeaderboards = { ...leaderboards };
        leaderboardResults.forEach(({ gameType, leaderboard }) => {
          newLeaderboards[gameType] = leaderboard;
        });
        setLeaderboards(newLeaderboards);

        setGameRecommendations(recommendations);
      } catch (error) {
        toast({
          title: 'Games Data Error',
          description: 'Could not load game data.',
          variant: 'destructive'
        });
      }
    };

    fetchGameData();
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Game Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Game Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {gameRecommendations.map((recommendation) => {
                const gameInfo = GAME_DETAILS[recommendation.recommended_game];
                return (
                  <div 
                    key={recommendation.recommended_game} 
                    className="flex items-center justify-between border-b pb-2 last:border-b-0"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-3xl">{gameInfo.icon}</span>
                      <div>
                        <p className="font-medium">{gameInfo.name}</p>
                        <p className="text-sm text-gray-500">{recommendation.reason}</p>
                      </div>
                    </div>
                    <Link to={gameInfo.route}>
                      <Button variant="outline" size="sm">
                        Play
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Game Grid */}
        <Card className="md:col-span-2 grid md:grid-cols-3 gap-4">
          {Object.entries(GAME_DETAILS).map(([gameType, gameInfo]) => {
            const stats = gameStats[gameType as keyof typeof GAME_DETAILS];
            const leaderboard = leaderboards[gameType as keyof typeof GAME_DETAILS];

            return (
              <div 
                key={gameType} 
                className="border rounded-lg p-4 flex flex-col"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-4xl">{gameInfo.icon}</span>
                  <Link to={gameInfo.route}>
                    <Button variant="outline" size="sm">
                      Play
                    </Button>
                  </Link>
                </div>
                <h3 className="text-lg font-semibold mb-2">{gameInfo.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{gameInfo.description}</p>
                <div className="grid grid-cols-2 gap-2 mt-auto">
                  <div>
                    <p className="text-xs text-gray-500">Highest Score</p>
                    <p className="font-bold">{stats.highestScore}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Avg Score</p>
                    <p className="font-bold">{stats.averageScore.toFixed(1)}</p>
                  </div>
                </div>
                {leaderboard.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-2">Top Players</p>
                    <div className="space-y-1">
                      {leaderboard.slice(0, 3).map((player, index) => (
                        <div 
                          key={player.userId} 
                          className="flex justify-between text-xs"
                        >
                          <span>
                            {index + 1}. {player.username}
                          </span>
                          <span className="font-bold">{player.highestScore}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
};

export default GamesPage;