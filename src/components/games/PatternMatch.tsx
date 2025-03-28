import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Timer, Brain, Trophy, CheckCircle, XCircle, Volume2, Volume1, VolumeX, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '../../lib/utils';
import { authenticatedRestCall } from '@/lib/supabase/rest-client';
import confetti from 'canvas-confetti';
import { Session } from '@supabase/supabase-js';

// Pattern types
type PatternType = 'color' | 'shape' | 'both';

// Pattern difficulty
type PatternDifficulty = 'easy' | 'medium' | 'hard';

// Game shapes
type Shape = 'circle' | 'square' | 'triangle' | 'diamond' | 'hexagon' | 'star';

// Game colors
type Color = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';

// Pattern item
interface PatternItem {
  id: string;
  shape: Shape;
  color: Color;
}

// Game session interface
interface GameSession {
  id: string;
  score: number;
  patternType: PatternType;
  difficulty: PatternDifficulty;
  timeElapsed: number;
  patternsCompleted: number;
  patternsMissed: number;
  date: string;
}

interface PatternMatchProps {
  session: Session | null;
  onBack?: () => void;
  onComplete?: (score: number) => void;
}

const PatternMatch: React.FC<PatternMatchProps> = ({ session, onBack, onComplete }) => {
  // Game state
  const [activeTab, setActiveTab] = useState<string>('play');
  const [patternType, setPatternType] = useState<PatternType>('color');
  const [difficulty, setDifficulty] = useState<PatternDifficulty>('easy');
  const [currentPattern, setCurrentPattern] = useState<PatternItem[]>([]);
  const [options, setOptions] = useState<PatternItem[]>([]);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(60); // 60 seconds to play
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [patternsCompleted, setPatternsCompleted] = useState<number>(0);
  const [patternsMissed, setPatternsMissed] = useState<number>(0);
  const [gameHistory, setGameHistory] = useState<GameSession[]>([]);
  const [volumeLevel, setVolumeLevel] = useState<string>('medium'); // 'off', 'low', 'medium'
  const [patternLength, setPatternLength] = useState<number>(3); // Number of items in pattern
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  
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

  // Fetch game history using REST API instead of direct Supabase client
  const fetchGameHistory = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const { data, error } = await authenticatedRestCall(
        `/rest/v1/game_sessions?select=*&user_id=eq.${session.user.id}&game_type=eq.pattern_match&order=created_at.desc&limit=10`,
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

  // All possible shapes
  const shapes: Shape[] = ['circle', 'square', 'triangle', 'diamond', 'hexagon', 'star'];
  
  // All possible colors
  const colors: Color[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

  // Get random shape
  const getRandomShape = useCallback((): Shape => {
    return shapes[Math.floor(Math.random() * shapes.length)];
  }, [shapes]);

  // Get random color
  const getRandomColor = useCallback((): Color => {
    return colors[Math.floor(Math.random() * colors.length)];
  }, [colors]);

  // Generate a pattern based on current settings
  const generatePattern = useCallback(() => {
    const length = patternLength;
    const pattern: PatternItem[] = [];
    
    // For easy difficulty, create a repeating pattern
    if (difficulty === 'easy') {
      // Create base pattern items that repeat
      const baseShapes = patternType === 'color' ? [getRandomShape()] : Array(3).fill(0).map(() => getRandomShape());
      const baseColors = patternType === 'shape' ? [getRandomColor()] : Array(3).fill(0).map(() => getRandomColor());
      
      for (let i = 0; i < length; i++) {
        const shapeIndex = patternType === 'color' ? 0 : i % baseShapes.length;
        const colorIndex = patternType === 'shape' ? 0 : i % baseColors.length;
        
        pattern.push({
          id: uuidv4(),
          shape: baseShapes[shapeIndex],
          color: baseColors[colorIndex]
        });
      }
    } 
    // For medium, create a pattern with some variance
    else if (difficulty === 'medium') {
      const patternBase = Math.floor(Math.random() * 3) + 2; // 2-4 items in base pattern
      const baseShapes: Shape[] = [];
      const baseColors: Color[] = [];
      
      // Generate base pattern
      for (let i = 0; i < patternBase; i++) {
        if (patternType !== 'color') baseShapes.push(getRandomShape());
        if (patternType !== 'shape') baseColors.push(getRandomColor());
      }
      
      // If only using one attribute, ensure it's defined
      if (patternType === 'color' && baseShapes.length === 0) baseShapes.push(getRandomShape());
      if (patternType === 'shape' && baseColors.length === 0) baseColors.push(getRandomColor());
      
      // Create pattern by repeating base
      for (let i = 0; i < length; i++) {
        const shapeIndex = patternType === 'color' ? 0 : i % baseShapes.length;
        const colorIndex = patternType === 'shape' ? 0 : i % baseColors.length;
        
        pattern.push({
          id: uuidv4(),
          shape: baseShapes[shapeIndex],
          color: baseColors[colorIndex]
        });
      }
    }
    // For hard, create a more complex pattern
    else {
      const isAlternating = Math.random() > 0.5;
      const isMirrored = Math.random() > 0.5;
      
      if (isAlternating) {
        // Create alternating pattern
        const baseItems: PatternItem[] = [];
        const alternationCount = Math.floor(Math.random() * 2) + 2; // 2-3 alternating items
        
        for (let i = 0; i < alternationCount; i++) {
          baseItems.push({
            id: uuidv4(),
            shape: patternType === 'color' ? getRandomShape() : getRandomShape(),
            color: patternType === 'shape' ? getRandomColor() : getRandomColor()
          });
        }
        
        // Fill pattern by repeating base items
        for (let i = 0; i < length; i++) {
          const baseItem = baseItems[i % alternationCount];
          pattern.push({
            id: uuidv4(),
            shape: baseItem.shape,
            color: baseItem.color
          });
        }
      } else if (isMirrored) {
        // Create mirrored pattern
        const halfLength = Math.ceil(length / 2);
        const firstHalf: PatternItem[] = [];
        
        // Generate first half
        for (let i = 0; i < halfLength; i++) {
          firstHalf.push({
            id: uuidv4(),
            shape: patternType === 'color' ? getRandomShape() : getRandomShape(),
            color: patternType === 'shape' ? getRandomColor() : getRandomColor()
          });
        }
        
        // Add first half to pattern
        pattern.push(...firstHalf);
        
        // Add mirrored second half if there's space
        const remainingSpace = length - firstHalf.length;
        const secondHalf = [...firstHalf].slice(0, remainingSpace).reverse();
        pattern.push(...secondHalf.map(item => ({ ...item, id: uuidv4() })));
      } else {
        // Create sequential pattern with incremental changes
        let currentShape = getRandomShape();
        let currentColor = getRandomColor();
        const shapeIncrementIndex = Math.floor(Math.random() * shapes.length);
        const colorIncrementIndex = Math.floor(Math.random() * colors.length);
        
        for (let i = 0; i < length; i++) {
          pattern.push({
            id: uuidv4(),
            shape: patternType === 'color' ? currentShape : shapes[(shapes.indexOf(currentShape) + i * shapeIncrementIndex) % shapes.length],
            color: patternType === 'shape' ? currentColor : colors[(colors.indexOf(currentColor) + i * colorIncrementIndex) % colors.length]
          });
        }
      }
    }
    
    return pattern;
  }, [patternType, difficulty, patternLength, getRandomColor, getRandomShape]);

  // Generate options for next item in pattern
  const generateOptions = useCallback((pattern: PatternItem[]) => {
    const correctNext = { ...pattern[pattern.length - 1], id: uuidv4() }; // Deep copy the correct next item
    const options: PatternItem[] = [correctNext];
    
    // Generate wrong options based on pattern type
    for (let i = 0; i < 3; i++) {
      let wrongOption: PatternItem;
      
      if (patternType === 'color') {
        // For color patterns, keep shape but change color
        const wrongColor = colors.filter(c => c !== correctNext.color)[Math.floor(Math.random() * (colors.length - 1))];
        wrongOption = {
          id: uuidv4(),
          shape: correctNext.shape,
          color: wrongColor
        };
      } else if (patternType === 'shape') {
        // For shape patterns, keep color but change shape
        const wrongShape = shapes.filter(s => s !== correctNext.shape)[Math.floor(Math.random() * (shapes.length - 1))];
        wrongOption = {
          id: uuidv4(),
          shape: wrongShape,
          color: correctNext.color
        };
      } else {
        // For both patterns, change both or either
        const changeShape = Math.random() > 0.5;
        const changeColor = !changeShape || Math.random() > 0.5;
        
        const wrongShape = changeShape 
          ? shapes.filter(s => s !== correctNext.shape)[Math.floor(Math.random() * (shapes.length - 1))]
          : correctNext.shape;
          
        const wrongColor = changeColor
          ? colors.filter(c => c !== correctNext.color)[Math.floor(Math.random() * (colors.length - 1))]
          : correctNext.color;
          
        wrongOption = {
          id: uuidv4(),
          shape: wrongShape,
          color: wrongColor
        };
      }
      
      // Ensure this wrong option is unique
      if (!options.some(o => o.shape === wrongOption.shape && o.color === wrongOption.color)) {
        options.push(wrongOption);
      } else {
        // If duplicate, try again
        i--;
      }
    }
    
    // Shuffle options
    return options.sort(() => Math.random() - 0.5);
  }, [patternType, colors, shapes]);

  // Start a new game
  const startGame = useCallback(() => {
    if (volumeLevel !== 'off' && clickAudio) clickAudio.play().catch(e => console.error(e));
    
    // Reset game state
    setScore(0);
    setTimeLeft(60);
    setPatternsCompleted(0);
    setPatternsMissed(0);
    setIsGameActive(true);
    setSelectedItem(null);
    
    // Set difficulty-based pattern length
    const length = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 5;
    setPatternLength(length);
    
    // Generate initial pattern
    const newPattern = generatePattern();
    setCurrentPattern(newPattern);
    
    // Generate options for next pattern item
    setOptions(generateOptions(newPattern));
  }, [generatePattern, generateOptions, clickAudio, volumeLevel, difficulty]);

  // Check if selected option is correct
  const checkAnswer = useCallback((selectedId: string) => {
    if (!isGameActive || !selectedId) return;
    
    setSelectedItem(selectedId);
    
    // Find selected option
    const selected = options.find(opt => opt.id === selectedId);
    if (!selected) return;
    
    // Get correct next item based on pattern
    const correctNext = { ...currentPattern[currentPattern.length - 1] };
    
    // Check if selection matches the correct next item
    const isCorrect = selected.shape === correctNext.shape && selected.color === correctNext.color;
    
    setTimeout(() => {
      if (isCorrect) {
        // Correct answer
        if (volumeLevel !== 'off' && correctAudio) correctAudio.play().catch(e => console.error(e));
        
        // Calculate score based on difficulty
        let pointsEarned = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30;
        setScore(prev => prev + pointsEarned);
        setPatternsCompleted(prev => prev + 1);
        
        toast.success(`Correct! +${pointsEarned} points`);
        
        // Add selected to pattern and generate new options
        const updatedPattern = [...currentPattern, selected];
        if (updatedPattern.length > patternLength) {
          // Keep pattern at fixed length by removing oldest item
          updatedPattern.shift();
        }
        setCurrentPattern(updatedPattern);
        setOptions(generateOptions(updatedPattern));
      } else {
        // Wrong answer
        if (volumeLevel !== 'off' && wrongAudio) wrongAudio.play().catch(e => console.error(e));
        
        setPatternsMissed(prev => prev + 1);
        
        toast.error('Incorrect pattern match');
        
        // Generate new pattern after wrong answer
        const newPattern = generatePattern();
        setCurrentPattern(newPattern);
        setOptions(generateOptions(newPattern));
      }
      
      setSelectedItem(null);
    }, 500); // Delay to show selection feedback
  }, [
    isGameActive, 
    options, 
    currentPattern, 
    patternLength, 
    difficulty, 
    generateOptions, 
    generatePattern, 
    correctAudio, 
    wrongAudio,
    volumeLevel
  ]);

  // Submit game results to the database
  const saveGameResults = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const gameSession = {
        user_id: session.user.id,
        game_type: 'pattern_match',
        score,
        pattern_type: patternType,
        difficulty,
        time_elapsed: 60 - timeLeft,
        patterns_completed: patternsCompleted,
        patterns_missed: patternsMissed
      };

      const { error } = await authenticatedRestCall(
        `/rest/v1/game_sessions`,
        { method: 'POST', body: JSON.stringify(gameSession) },
        session
      );

      if (error) throw error;
      
      // Refetch game history to include the latest session
      fetchGameHistory();
      
      // Call onComplete callback if provided
      if (onComplete) onComplete(score);
      
    } catch (error) {
      console.error('Error saving game results:', error);
    }
  }, [
    session, 
    score, 
    patternType, 
    difficulty, 
    timeLeft, 
    patternsCompleted, 
    patternsMissed, 
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
    
    toast.success(`Game over! Final score: ${score}`);
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

  // Render shape based on type
  const renderShape = (item: PatternItem, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClass = size === 'sm' ? 'w-10 h-10' : size === 'md' ? 'w-16 h-16' : 'w-20 h-20';
    const baseClasses = `${sizeClass} flex items-center justify-center`;
    
    // Set color class based on item color
    const colorClass = {
      red: 'bg-red-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500'
    }[item.color];
    
    switch (item.shape) {
      case 'circle':
        return <div className={`${baseClasses} ${colorClass} rounded-full`} />;
      case 'square':
        return <div className={`${baseClasses} ${colorClass}`} />;
      case 'triangle':
        return (
          <div className={`${sizeClass} relative`}>
            <div 
              className={`w-full h-full ${colorClass}`} 
              style={{ 
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
              }} 
            />
          </div>
        );
      case 'diamond':
        return (
          <div className={`${sizeClass} relative`}>
            <div 
              className={`w-full h-full ${colorClass}`} 
              style={{ 
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
              }} 
            />
          </div>
        );
      case 'hexagon':
        return (
          <div className={`${sizeClass} relative`}>
            <div 
              className={`w-full h-full ${colorClass}`} 
              style={{ 
                clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
              }} 
            />
          </div>
        );
      case 'star':
        return (
          <div className={`${sizeClass} relative`}>
            <div 
              className={`w-full h-full ${colorClass}`} 
              style={{ 
                clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
              }} 
            />
          </div>
        );
      default:
        return <div className={`${baseClasses} ${colorClass} rounded-full`} />;
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto overflow-hidden bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950 shadow-xl rounded-xl">
      <div className="flex justify-between items-center p-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <Brain className="w-6 h-6 text-purple-500" />
          <h2 className="text-xl font-bold">Pattern Match</h2>
        </div>
        
        <div className="flex items-center space-x-3">
          {renderVolumeControl()}
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
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
        
        <TabsContent value="play" className="px-4 pb-6">
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
                  {/* Current pattern display */}
                  <div className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-lg shadow-md w-full">
                    <h3 className="text-center text-sm font-medium mb-3 text-slate-500 dark:text-slate-400">
                      Current Pattern
                    </h3>
                    <div className="flex justify-center items-center space-x-4">
                      {currentPattern.map((item, index) => (
                        <div key={item.id} className="flex flex-col items-center">
                          {renderShape(item)}
                          {index < currentPattern.length - 1 && (
                            <div className="mx-2 text-slate-400">→</div>
                          )}
                        </div>
                      ))}
                      <div className="flex items-center justify-center w-16 h-16 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600">
                        <span className="text-2xl text-slate-400">?</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Options */}
                  <div className="w-full">
                    <h3 className="text-center text-sm font-medium mb-3 text-slate-500 dark:text-slate-400">
                      Select the next shape in the pattern
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {options.map((option) => (
                        <motion.div
                          key={option.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => checkAnswer(option.id)}
                          className={cn(
                            "flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer transition-colors",
                            selectedItem === option.id 
                              ? "bg-indigo-100 dark:bg-indigo-900/40 border-2 border-indigo-500" 
                              : "bg-white/60 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-slate-700/60 border-2 border-transparent"
                          )}
                        >
                          {renderShape(option, 'lg')}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex space-x-6 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{patternsCompleted} correct</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span>{patternsMissed} missed</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center space-y-6 py-8">
                  <h3 className="text-2xl font-semibold text-center">Match the Pattern!</h3>
                  <p className="text-center text-slate-600 dark:text-slate-400 max-w-md">
                    Observe the pattern sequence and select the shape that comes next.
                    <br />Test your pattern recognition skills in 60 seconds!
                  </p>
                  <Button onClick={startGame} size="lg" className="px-8">
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
              <h3 className="text-lg font-medium">Pattern Type</h3>
              <div className="grid grid-cols-3 gap-2">
                {['color', 'shape', 'both'].map((type) => (
                  <Button
                    key={type}
                    variant={patternType === type ? "default" : "outline"}
                    onClick={() => {
                      if (volumeLevel !== 'off' && clickAudio) clickAudio.play().catch(e => console.error(e));
                      setPatternType(type as PatternType);
                    }}
                    className="capitalize"
                  >
                    {type}
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
                      setDifficulty(diff as PatternDifficulty);
                    }}
                    className="capitalize"
                  >
                    {diff}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <h3 className="text-lg font-medium">Pattern Length</h3>
                <span className="text-sm font-medium">{patternLength}</span>
              </div>
              <Slider
                value={[patternLength]}
                min={3}
                max={7}
                step={1}
                onValueChange={(value) => setPatternLength(value[0])}
                className="py-4"
              />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Longer patterns are more challenging to recognize
              </p>
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
                          {game.patternType} patterns - {game.difficulty}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {new Date(game.date).toLocaleDateString()} • {game.patternsCompleted} patterns
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

export default PatternMatch; 