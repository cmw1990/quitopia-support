import React from 'react';
import { Route, Routes, useParams, useNavigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import GameHub from '../components/GameHub';
import GameDetails from '../components/GameDetails';
import GameAchievements from '../components/GameAchievements';
import { useAuth } from '../components/AuthProvider';
import BreathingGame from '../components/games/BreathingGame';
import MemoryCards from '../components/games/MemoryCards';
import ZenGarden from '../components/games/ZenGarden';
import WordScramble from '../components/games/WordScramble';
import PatternMatch from '../components/games/PatternMatch';
import BalloonJourney from '../components/games/BalloonJourney';

// Create wrapper components that get session from useAuth hook
const GameHubWithSession = () => {
  const auth = useAuth();
  return <GameHub session={auth.session} />;
};

const GameAchievementsWithSession = () => {
  const auth = useAuth();
  return <GameAchievements session={auth.session} />;
};

// Higher-order component to wrap game components with session props
const withSession = (Component: React.ComponentType<any>) => {
  const WrappedComponent = (props: any) => {
    const auth = useAuth();
    return <Component {...props} session={auth.session} />;
  };
  return WrappedComponent;
};

// Wrap game components with session
const SessionBreathingGame = withSession(BreathingGame);
const SessionMemoryCards = withSession(MemoryCards);
const SessionZenGarden = withSession(ZenGarden);
const SessionWordScramble = withSession(WordScramble);
const SessionPatternMatch = withSession(PatternMatch);
const SessionBalloonJourney = withSession(BalloonJourney);

// Interface for game route props
interface GameRoutesProps {
  session: Session | null;
  onBack?: () => void | Promise<void>;
}

const GameRoutes: React.FC<GameRoutesProps> = ({ session, onBack }) => {
  return (
    <Routes>
      <Route 
        path="/breathing-exercise" 
        element={<SessionBreathingGame />} 
      />
      <Route 
        path="/memory-cards" 
        element={<SessionMemoryCards />} 
      />
      <Route 
        path="/zen-garden" 
        element={<SessionZenGarden />} 
      />
      <Route 
        path="/word-scramble" 
        element={<SessionWordScramble />} 
      />
      <Route 
        path="/pattern-match" 
        element={<SessionPatternMatch />} 
      />
      <Route 
        path="/balloon-journey" 
        element={<SessionBalloonJourney />} 
      />
      <Route 
        path="/:gameId" 
        element={<GameDetailsWrapper />} 
      />
    </Routes>
  );
};

// Game details wrapper component
const GameDetailsWrapper = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();

  const handlePlayGame = (selectedGameId: string) => {
    navigate(`/app/games/${selectedGameId}`);
  };

  if (!gameId) {
    return <div>Game not found</div>;
  }

  return (
    <GameDetails 
      gameId={gameId}
      onPlayGame={handlePlayGame}
      onBack={() => navigate(-1)}
    />
  );
};

// Export array of routes for router
const gameRoutes = [
  {
    path: "games/breathing-exercise",
    element: <SessionBreathingGame />
  },
  {
    path: "games/memory-cards",
    element: <SessionMemoryCards />
  },
  {
    path: "games/zen-garden",
    element: <SessionZenGarden />
  },
  {
    path: "games/word-scramble",
    element: <SessionWordScramble />
  },
  {
    path: "games/pattern-match",
    element: <SessionPatternMatch />
  },
  {
    path: "games/balloon-journey",
    element: <SessionBalloonJourney />
  },
  {
    path: "games/:gameId",
    element: <GameDetailsWrapper />
  }
];

export default gameRoutes; 