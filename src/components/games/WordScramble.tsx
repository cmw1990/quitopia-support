import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Timer, Brain, Trophy, CheckCircle, XCircle, Volume2, Volume1, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '../../lib/utils';
import { authenticatedRestCall } from '@/lib/supabase/rest-client';
import confetti from 'canvas-confetti';
import type { Session } from '@supabase/supabase-js';

// Word categories with difficulty levels
const WORD_CATEGORIES = {
  smoking: {
    easy: ['quit', 'smoke', 'lung', 'free', 'life', 'pack', 'fresh', 'air', 'gum', 'breath'],
    medium: ['nicotine', 'tobacco', 'craving', 'healthy', 'breathe', 'mission', 'freedom', 'inhaler', 'patches', 'wellness'],
    hard: ['cigarette', 'addiction', 'withdrawal', 'dependence', 'cessation', 'abstinence', 'relapsing', 'temptation', 'recovery', 'substitute']
  },
  health: {
    easy: ['diet', 'walk', 'food', 'rest', 'mind', 'gym', 'heart', 'body', 'calm', 'care'],
    medium: ['exercise', 'fitness', 'protein', 'vitamin', 'balance', 'aerobic', 'posture', 'strength', 'hydrate', 'routine'],
    hard: ['meditation', 'nutrition', 'resilience', 'metabolism', 'endurance', 'resistance', 'mindfulness', 'flexibility', 'circulation', 'antioxidant']
  },
  motivation: {
    easy: ['goal', 'plan', 'push', 'hope', 'try', 'win', 'joy', 'best', 'grow', 'move'],
    medium: ['achieve', 'inspire', 'courage', 'passion', 'progress', 'purpose', 'champion', 'overcome', 'journey', 'believe'],
    hard: ['determination', 'perseverance', 'confidence', 'discipline', 'commitment', 'motivation', 'excellence', 'enthusiasm', 'resilience', 'transformation']
  }
};

// Game session interface
interface GameSession {
  id: string;
  score: number;
  category: string;
  difficulty: string;
  timeElapsed: number;
  wordsCompleted: number;
  wordsMissed: number;
  date: string;
}

interface WordScrambleProps {
  session: Session | null;
  onBack?: () => void;
  onComplete?: (score: number) => void;
}

const WordScramble: React.FC<WordScrambleProps> = ({ session, onBack, onComplete }) => {
  // Game state
  const [activeTab, setActiveTab] = useState<string>('play');
  const [category, setCategory] = useState<string>('smoking');
  const [difficulty, setDifficulty] = useState<string>('easy');
  const [currentWord, setCurrentWord] = useState<string>('');
  const [scrambledWord, setScrambledWord] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(60); // 60 seconds to play
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [hint, setHint] = useState<string>('');
  const [hintUsed, setHintUsed] = useState<boolean>(false);
  const [wordsCompleted, setWordsCompleted] = useState<number>(0);
  const [wordsMissed, setWordsMissed] = useState<number>(0);
  const [gameHistory, setGameHistory] = useState<GameSession[]>([]);
  const [hintCost, setHintCost] = useState<number>(5); // Score penalty for using hints
  const [volumeLevel, setVolumeLevel] = useState<string>('medium'); // 'off', 'low', 'medium'
  
  // Audio elements
  const correctAudio = useMemo(() => typeof window !== 'undefined' ? new Audio('/sounds/correct.mp3') : null, []);
  const wrongAudio = useMemo(() => typeof window !== 'undefined' ? new Audio('/sounds/wrong.mp3') : null, []);
  const successAudio = useMemo(() => typeof window !== 'undefined' ? new Audio('/sounds/success.mp3') : null, []);
  const clickAudio = useMemo(() => typeof window !== 'undefined' ? new Audio('/sounds/click.mp3') : null, []);

  // Set volume based on level
  useEffect(() => {
    if (!correctAudio || !wrongAudio || !successAudio || !clickAudio) return;
    
    const volume = volumeLevel === 'off' ? 0 : volumeLevel === 'low' ? 0.3 : 0.7;
    correctAudio.volume = volume;
    wrongAudio.volume = volume;
    successAudio.volume = volume;
    clickAudio.volume = volume;
  }, [volumeLevel, correctAudio, wrongAudio, successAudio, clickAudio]);

  // Fetch game history using REST API
  const fetchGameHistory = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const { data, error } = await authenticatedRestCall(
        `/rest/v1/game_sessions?select=*&user_id=eq.${session.user.id}&game_type=eq.word_scramble&order=created_at.desc&limit=10`,
        { method: 'GET' },
        session
      );

      if (error) throw error;
      if (data) setGameHistory(data);
    } catch (error) {
      console.error('Error fetching game history:', error);
    }
  }, [session]);

  // Load game history on component mount
  useEffect(() => {
    fetchGameHistory();
  }, [fetchGameHistory]);

  // Scramble a word
  const scrambleWord = useCallback((word: string): string => {
    let scrambled = word.split('');
    for (let i = scrambled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
    }
    // Make sure the scrambled word is different from the original
    return scrambled.join('') === word ? scrambleWord(word) : scrambled.join('');
  }, []);

  // Get a new word based on category and difficulty
  const getNewWord = useCallback(() => {
    if (!WORD_CATEGORIES[category as keyof typeof WORD_CATEGORIES]) return;
    
    const words = WORD_CATEGORIES[category as keyof typeof WORD_CATEGORIES][difficulty as keyof typeof WORD_CATEGORIES['smoking']];
    if (!words || words.length === 0) return;
    
    const newWord = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(newWord);
    setScrambledWord(scrambleWord(newWord));
    setUserInput('');
    setHint('');
    setHintUsed(false);
  }, [category, difficulty, scrambleWord]);

  // Start a new game
  const startGame = useCallback(() => {
    if (volumeLevel !== 'off' && clickAudio) clickAudio.play().catch(e => console.error(e));
    setScore(0);
    setTimeLeft(60);
    setWordsCompleted(0);
    setWordsMissed(0);
    setIsGameActive(true);
    getNewWord();
  }, [getNewWord, clickAudio, volumeLevel]);

  // Show hint (first letter)
  const showHint = useCallback(() => {
    if (volumeLevel !== 'off' && clickAudio) clickAudio.play().catch(e => console.error(e));
    if (hintUsed) return;
    
    // Set hint based on difficulty
    let hintText = '';
    if (difficulty === 'easy') {
      hintText = `First letter: ${currentWord[0]}`;
    } else if (difficulty === 'medium') {
      hintText = `First letter: ${currentWord[0]}, Length: ${currentWord.length}`;
    } else {
      hintText = `First letter: ${currentWord[0]}`;
    }
    
    setHint(hintText);
    setHintUsed(true);
    
    // Apply score penalty for using hint
    setScore(prev => Math.max(0, prev - hintCost));
  }, [hintUsed, currentWord, difficulty, hintCost, clickAudio, volumeLevel]);

  // Check user's answer
  const checkAnswer = useCallback(() => {
    if (!isGameActive) return;
    
    if (userInput.toLowerCase() === currentWord.toLowerCase()) {
      // Correct answer
      if (volumeLevel !== 'off' && correctAudio) correctAudio.play().catch(e => console.error(e));
      
      // Calculate score based on difficulty and whether hint was used
      let pointsEarned = 0;
      if (difficulty === 'easy') {
        pointsEarned = 10;
      } else if (difficulty === 'medium') {
        pointsEarned = 20;
      } else {
        pointsEarned = 30;
      }
      
      // Reduce points if hint was used
      if (hintUsed) {
        pointsEarned = Math.floor(pointsEarned / 2);
      }
      
      setScore(prev => prev + pointsEarned);
      setWordsCompleted(prev => prev + 1);
      
      toast.success(`Correct! +${pointsEarned} points`, {
        position: 'bottom-center',
        icon: '🎯'
      });
      
      // Get a new word
      getNewWord();
    } else {
      // Wrong answer
      if (volumeLevel !== 'off' && wrongAudio) wrongAudio.play().catch(e => console.error(e));
      
      setWordsMissed(prev => prev + 1);
      
      toast.error('Try again!', {
        position: 'bottom-center',
        icon: '❌'
      });
    }
    
    setUserInput('');
  }, [userInput, currentWord, isGameActive, difficulty, hintUsed, getNewWord, correctAudio, wrongAudio, volumeLevel]);

  // Submit game results to the database
  const saveGameResults = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const gameSession = {
        user_id: session.user.id,
        game_type: 'word_scramble',
        score,
        category,
        difficulty,
        time_elapsed: 60 - timeLeft,
        words_completed: wordsCompleted,
        words_missed: wordsMissed
      };

      const { error } = await authenticatedRestCall(
        `/rest/v1/game_sessions`,
        { method: 'POST', body: JSON.stringify(gameSession) },
        session
      );

      if (error) throw error;
      
      // Refresh game history
      fetchGameHistory();
      
      if (onComplete) {
        onComplete(score);
      }
    } catch (error) {
      console.error('Error saving game results:', error);
    }
  }, [
    session, 
    score, 
    category, 
    difficulty, 
    timeLeft, 
    wordsCompleted, 
    wordsMissed, 
    fetchGameHistory,
    onComplete
  ]);

  // End the game
  const endGame = useCallback(() => {
    setIsGameActive(false);
    
    if (volumeLevel !== 'off' && successAudio) successAudio.play().catch(e => console.error(e));
    
    // Show confetti for good scores
    if (score > 100) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    
    // Save game results
    saveGameResults();
    
    toast.success(`Game over! Final score: ${score}`, {
      position: 'bottom-center',
      icon: '🏆'
    });
  }, [score, saveGameResults, successAudio, volumeLevel]);

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isGameActive && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isGameActive && timeLeft === 0) {
      endGame();
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isGameActive, timeLeft, endGame]);

  // Handle key press for submission
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        checkAnswer();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [checkAnswer]);

  // Calculate game progress percentage
  const progressPercentage = useMemo(() => {
    return isGameActive ? Math.floor((timeLeft / 60) * 100) : 0;
  }, [isGameActive, timeLeft]);

  // Render volume control
  const renderVolumeControl = () => {
    return (
      <div className="flex items-center space-x-2">
        {volumeLevel === 'off' ? (
          <VolumeX className="w-5 h-5 cursor-pointer" onClick={() => setVolumeLevel('low')} />
        ) : volumeLevel === 'low' ? (
          <Volume1 className="w-5 h-5 cursor-pointer" onClick={() => setVolumeLevel('medium')} />
        ) : (
          <Volume2 className="w-5 h-5 cursor-pointer" onClick={() => setVolumeLevel('off')} />
        )}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-3xl mx-auto overflow-hidden bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950 shadow-xl rounded-xl">
      <div className="flex justify-between items-center p-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <Brain className="w-6 h-6 text-indigo-500" />
          <h2 className="text-xl font-bold">Word Scramble</h2>
        </div>
        
        <div className="flex items-center space-x-3">
          {renderVolumeControl()}
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              Back
            </Button>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="play" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mx-4 mt-2">
          <TabsTrigger value="play">Play</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>
        
        <TabsContent value="play" className="px-4 pb-4">
          <div className="space-y-4">
            {/* Game progress */}
            <div className="flex justify-between items-center mb-2 mt-2">
              <div className="flex items-center space-x-2">
                <Timer className="w-5 h-5 text-amber-500" />
                <span>{timeLeft}s</span>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span>{score} pts</span>
              </div>
            </div>
            
            <Progress value={progressPercentage} className="h-2" />
            
            {/* Game area */}
            <div className="flex flex-col items-center justify-center space-y-6 py-4">
              {isGameActive ? (
                <>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={scrambledWord}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3 }}
                      className="text-3xl md:text-4xl font-bold tracking-wide text-center"
                    >
                      {scrambledWord.split('').map((letter, index) => (
                        <span 
                          key={index} 
                          className="inline-block mx-1 p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm"
                        >
                          {letter.toUpperCase()}
                        </span>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                  
                  {hint && (
                    <div className="text-sm text-amber-600 dark:text-amber-400">
                      {hint}
                    </div>
                  )}
                  
                  <div className="w-full max-w-md">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Type your answer..."
                      className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      autoFocus
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button onClick={checkAnswer}>
                      Submit
                    </Button>
                    <Button variant="outline" onClick={showHint} disabled={hintUsed}>
                      Hint (-{hintCost} pts)
                    </Button>
                  </div>
                  
                  <div className="flex space-x-6 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{wordsCompleted} correct</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span>{wordsMissed} missed</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center space-y-6 py-8">
                  <h3 className="text-2xl font-semibold text-center">Unscramble words as fast as you can!</h3>
                  <p className="text-center text-slate-600 dark:text-slate-400">
                    Rearrange the letters to form the correct word. 
                    <br />You have 60 seconds to score as many points as possible.
                  </p>
                  <Button onClick={startGame} size="lg">
                    Start Game
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="px-4 pb-6">
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Category</h3>
              <div className="grid grid-cols-3 gap-2">
                {Object.keys(WORD_CATEGORIES).map((cat) => (
                  <Button
                    key={cat}
                    variant={category === cat ? "default" : "outline"}
                    onClick={() => {
                      if (volumeLevel !== 'off' && clickAudio) clickAudio.play().catch(e => console.error(e));
                      setCategory(cat);
                    }}
                    className="capitalize"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Difficulty</h3>
              <div className="grid grid-cols-3 gap-2">
                {['easy', 'medium', 'hard'].map((diff) => (
                  <Button
                    key={diff}
                    variant={difficulty === diff ? "default" : "outline"}
                    onClick={() => {
                      if (volumeLevel !== 'off' && clickAudio) clickAudio.play().catch(e => console.error(e));
                      setDifficulty(diff);
                      // Adjust hint cost based on difficulty
                      setHintCost(diff === 'easy' ? 5 : diff === 'medium' ? 10 : 15);
                    }}
                    className="capitalize"
                  >
                    {diff}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Sound Effects</h3>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={(checked) => {
                    setSoundEnabled(checked);
                    setVolumeLevel(checked ? 'medium' : 'off');
                  }}
                />
                <span>Enabled</span>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="stats" className="px-4 pb-6">
          <div className="space-y-4 py-4">
            <h3 className="text-lg font-medium">Game History</h3>
            
            {gameHistory.length > 0 ? (
              <div className="space-y-3">
                {gameHistory.map((game) => (
                  <Card key={game.id} className="p-3 bg-white/70 dark:bg-slate-800/70">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium capitalize">
                          {game.category} - {game.difficulty}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {new Date(game.date).toLocaleDateString()} • {game.wordsCompleted} words
                        </div>
                      </div>
                      <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                        {game.score} pts
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                No game history yet. Play a game to see your stats!
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default WordScramble; 