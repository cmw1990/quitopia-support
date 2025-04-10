import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Game Configuration ---
const GAME_DURATION = 30; // seconds
const ITEMS_PER_CATEGORY = 15; // Number of items to pre-load

// Define Categories and Items
const categories = {
    fruit: {
        label: 'Fruit',
        items: ['Apple', 'Banana', 'Orange', 'Grape', 'Strawberry', 'Watermelon', 'Pineapple', 'Mango', 'Kiwi', 'Peach', 'Plum', 'Cherry', 'Pear', 'Blueberry', 'Raspberry'],
        color: 'bg-red-500 hover:bg-red-600',
    },
    vegetable: {
        label: 'Vegetable',
        items: ['Carrot', 'Broccoli', 'Spinach', 'Potato', 'Tomato', 'Cucumber', 'Onion', 'Pepper', 'Lettuce', 'Celery', 'Garlic', 'Zucchini', 'Eggplant', 'Asparagus', 'Cabbage'],
        color: 'bg-green-500 hover:bg-green-600',
    },
    // Add more categories as needed
};

type CategoryId = keyof typeof categories;

interface GameItem {
    name: string;
    category: CategoryId;
}

// --- Helper Functions ---
const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

// --- Game Component ---
const QuickSortGame: React.FC = () => {
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
    const [allItems, setAllItems] = useState<GameItem[]>([]);
    const [currentItem, setCurrentItem] = useState<GameItem | null>(null);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // --- Game Initialization & Management ---
    const generateItems = useCallback(() => {
        let items: GameItem[] = [];
        Object.entries(categories).forEach(([catId, data]) => {
            const categoryItems = shuffleArray(data.items).slice(0, ITEMS_PER_CATEGORY);
            items = [...items, ...categoryItems.map(name => ({ name, category: catId as CategoryId }))];
        });
        return shuffleArray(items);
    }, []);

    const startGame = useCallback(() => {
        const generated = generateItems();
        setAllItems(generated);
        setCurrentItem(generated[0] || null); // Start with the first item
        setScore(0);
        setTimeLeft(GAME_DURATION);
        setFeedback(null);
        setGameState('playing');
    }, [generateItems]);

    const nextItem = useCallback(() => {
        setFeedback(null);
        setAllItems(prev => {
            const remaining = prev.slice(1);
            if (remaining.length === 0) {
                // If no items left, could either end game or regenerate
                // For now, let's end (timer will handle it mainly)
                setCurrentItem(null);
                return []; 
            }
            setCurrentItem(remaining[0]);
            return remaining;
        });
    }, []);

    // --- Timer Logic ---
    useEffect(() => {
        if (gameState === 'playing') {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current!); // Clear interval before state change
                        setGameState('finished');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [gameState]);

    // --- Event Handler: Category Button Click ---
    const handleCategorySelect = useCallback((selectedCategory: CategoryId) => {
        if (gameState !== 'playing' || !currentItem || feedback) return;

        if (currentItem.category === selectedCategory) {
            setScore(prev => prev + 1);
            setFeedback('correct');
        } else {
            setFeedback('incorrect');
            // Optional: Decrease time on incorrect answer?
            // setTimeLeft(prev => Math.max(0, prev - 1)); 
        }

        // Move to next item after a short delay to show feedback
        setTimeout(nextItem, 300);

    }, [gameState, currentItem, nextItem, feedback]);

    // --- UI Rendering ---
    const progressPercent = (timeLeft / GAME_DURATION) * 100;
    const categoryKeys = useMemo(() => Object.keys(categories) as CategoryId[], []);

    return (
        <div className="flex flex-col items-center space-y-6 p-4 min-h-[350px]">
            {gameState === 'idle' && (
                <div className="text-center space-y-4">
                    <p>Quickly sort the items into the correct categories!</p>
                    <Button onClick={startGame} size="lg">Start Game</Button>
                </div>
            )}

            {gameState === 'playing' && currentItem && (
                <>
                    <div className="w-full space-y-2">
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                            <span>Score: <span className="font-bold text-foreground">{score}</span></span>
                            <span className="flex items-center gap-1"><Timer size={14}/> {timeLeft}s</span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                    </div>

                    <Card className="relative w-full p-8 mt-4 text-center border-2 bg-card shadow-sm">
                        {/* Feedback Overlay */} 
                        <AnimatePresence>
                            {feedback && (
                                <motion.div 
                                    key={feedback} // Change key to re-animate
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className={cn(
                                        "absolute inset-0 flex items-center justify-center rounded-lg z-10",
                                        feedback === 'correct' ? 'bg-green-500/80' : 'bg-red-500/80'
                                    )}
                                >
                                    {feedback === 'correct' ? <CheckCircle size={48} className="text-white" /> : <XCircle size={48} className="text-white" />}
                                </motion.div>
                            )}
                        </AnimatePresence>
                        
                        <p className="text-2xl md:text-3xl font-semibold">{currentItem.name}</p>
                    </Card>

                    <div className="grid grid-cols-2 gap-4 w-full pt-4">
                        {categoryKeys.map((catId) => {
                            const category = categories[catId];
                            return (
                                <Button
                                    key={catId}
                                    variant="default"
                                    size="lg"
                                    className={cn("text-base h-14 shadow-md text-white transition-transform duration-100 active:scale-95", category.color)}
                                    onClick={() => handleCategorySelect(catId)}
                                    disabled={!!feedback} // Disable buttons during feedback
                                >
                                    {category.label}
                                </Button>
                            );
                        })}
                    </div>
                </>
            )}

            {gameState === 'finished' && (
                <div className="text-center space-y-4">
                    <h3 className="text-xl font-semibold">Game Over!</h3>
                    <p className="text-4xl font-bold text-primary">{score}</p>
                    <p className="text-muted-foreground">Items sorted correctly in {GAME_DURATION} seconds.</p>
                    <Button onClick={startGame} variant="secondary">Play Again</Button>
                </div>
            )}
        </div>
    );
};

export default QuickSortGame; 