import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card as UICard } from '@/components/ui/card'; // Renamed to avoid conflict
import { cn } from '@/lib/utils';
import { 
    Smile, Zap, Heart, Star, Sun, Moon, Cloud, Umbrella, 
    Anchor, Bike, Bomb, Bone, Bug, Cake, Car, Ghost, Gift, 
    Plane, Rocket, Skull, Snowflake, Tent, TreePine, Trophy
} from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/useWindowSize'; // Assuming hook exists

// --- Game Configuration ---
const GRID_SIZE = 4; // 4x4 grid
const TOTAL_CARDS = GRID_SIZE * GRID_SIZE;
const ICONS = [
    Smile, Zap, Heart, Star, Sun, Moon, Cloud, Umbrella, 
    Anchor, Bike, Bomb, Bone, Bug, Cake, Car, Ghost, Gift, 
    Plane, Rocket, Skull, Snowflake, Tent, TreePine, Trophy
];
const PAIRS_NEEDED = TOTAL_CARDS / 2;
const FLIP_DELAY = 700; // ms before non-matching cards flip back

// --- Types ---
type CardState = 'hidden' | 'visible' | 'matched';

interface CardData {
    id: number;
    icon: React.ComponentType<any>;
    iconName: string; // For matching logic
    state: CardState;
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
const PatternMatchGame: React.FC = () => {
    const [cards, setCards] = useState<CardData[]>([]);
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [matchesFound, setMatchesFound] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const { width = 0, height = 0 } = useWindowSize() ?? {}; // Default values if hook returns undefined

    // --- Game Initialization Logic ---
    const initializeGame = useCallback(() => {
        const selectedIcons = shuffleArray(ICONS).slice(0, PAIRS_NEEDED);
        const gameIcons = [...selectedIcons, ...selectedIcons];
        const shuffledGameIcons = shuffleArray(gameIcons);

        setCards(
            shuffledGameIcons.map((IconComponent, index) => ({
                id: index,
                icon: IconComponent,
                iconName: IconComponent.displayName || IconComponent.name,
                state: 'hidden',
            }))
        );
        setSelectedIndices([]);
        setMoves(0);
        setMatchesFound(0);
        setIsGameOver(false);
        setIsChecking(false);
    }, []);

    useEffect(() => {
        initializeGame();
    }, [initializeGame]);

    // --- Game Logic: Check for Matches ---
    useEffect(() => {
        if (selectedIndices.length !== 2) return;

        setIsChecking(true);
        const [index1, index2] = selectedIndices;
        const card1 = cards[index1];
        const card2 = cards[index2];

        if (card1.iconName === card2.iconName) {
            // Match
            setCards(prev => prev.map(c => (c.id === card1.id || c.id === card2.id ? { ...c, state: 'matched' } : c)));
            setMatchesFound(prev => prev + 1);
            setSelectedIndices([]);
            setIsChecking(false);
        } else {
            // No Match
            setTimeout(() => {
                setCards(prev => prev.map(c => (c.id === card1.id || c.id === card2.id ? { ...c, state: 'hidden' } : c)));
                setSelectedIndices([]);
                setIsChecking(false);
            }, FLIP_DELAY);
        }
    }, [selectedIndices, cards]);

    // --- Game Logic: Check for Game Over ---
    useEffect(() => {
        if (matchesFound === PAIRS_NEEDED && PAIRS_NEEDED > 0) {
            setIsGameOver(true);
        }
    }, [matchesFound]);

    // --- Event Handler: Card Click ---
    const handleCardClick = (index: number) => {
        if (isChecking || cards[index].state !== 'hidden' || selectedIndices.length >= 2) {
            return;
        }

        setCards(prev => prev.map((card, i) => (i === index ? { ...card, state: 'visible' } : card)));

        if (selectedIndices.length === 0) {
            setSelectedIndices([index]);
        } else if (selectedIndices.length === 1) {
            setSelectedIndices(prev => [...prev, index]);
            setMoves(prev => prev + 1);
        }
    };

    // --- UI Rendering ---
    const cardVariants = {
        hidden: { rotateY: 180 },
        visible: { rotateY: 0 },
        matched: { rotateY: 0, opacity: 0.6, scale: 0.95 }, // Keep matched visible but faded
    };

    return (
        <div className="flex flex-col items-center space-y-4 relative">
            {/* Confetti Overlay */}
            <AnimatePresence>
                {isGameOver && width > 0 && height > 0 && (
                    <Confetti 
                        width={width}
                        height={height}
                        recycle={false}
                        numberOfPieces={350}
                        gravity={0.15}
                        className="absolute top-0 left-0 w-full h-full z-50"
                    />
                )}
            </AnimatePresence>

            {/* Game Stats */}
            <div className="flex justify-around w-full text-sm text-muted-foreground">
                <p>Moves: <span className="font-bold text-foreground">{moves}</span></p>
                <p>Matches: <span className="font-bold text-foreground">{matchesFound} / {PAIRS_NEEDED}</span></p>
            </div>

            {/* Game Grid */}
            <div className={cn(
                `grid gap-2 md:gap-3 place-items-center`,
                GRID_SIZE === 4 ? 'grid-cols-4' : 'grid-cols-6' // Simple grid layout
            )}>
                {cards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <div 
                            key={card.id} 
                            className="perspective-1000" // Enable 3D perspective
                            style={{ width: '60px', height: '60px' }} // Consistent card size
                        >
                            <motion.div
                                className="relative w-full h-full transform-style-preserve-3d cursor-pointer"
                                variants={cardVariants}
                                initial="hidden"
                                animate={card.state}
                                transition={{ duration: 0.4, ease: 'easeInOut' }}
                                onClick={() => handleCardClick(index)}
                            >
                                {/* Card Back */}
                                <UICard 
                                    className={cn(
                                        "absolute inset-0 w-full h-full backface-hidden flex items-center justify-center",
                                        "border-2 border-dashed border-primary/30 bg-muted/30 hover:border-primary/60 hover:bg-muted/50",
                                        card.state !== 'hidden' && 'pointer-events-none' // Prevent click on back if visible
                                    )}
                                >
                                    {/* Optional: Add a small icon or pattern to the back */}
                                    <span className="text-xl text-primary/50">?</span>
                                </UICard>

                                {/* Card Front */}
                                <UICard 
                                    className={cn(
                                        "absolute inset-0 w-full h-full backface-hidden flex items-center justify-center",
                                        "border-2 border-primary/80 bg-card",
                                        card.state === 'matched' ? "border-green-500/50 bg-green-500/10" : ""
                                    )}
                                >
                                    <Icon size={32} className={cn(card.state === 'matched' ? 'text-green-600' : 'text-primary')} />
                                </UICard>
                            </motion.div>
                        </div>
                    );
                })}
            </div>

            {/* Game Over Message & Button */}
            {isGameOver && (
                <div className="text-center space-y-3 pt-4 z-10 relative">
                    <p className="text-lg font-semibold text-green-600">Congratulations!</p>
                    <p className="text-sm text-muted-foreground">You found all pairs in {moves} moves.</p>
                    <Button onClick={initializeGame} variant="secondary">Play Again</Button>
                </div>
            )}
        </div>
    );
};

export default PatternMatchGame; 