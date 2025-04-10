import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import confetti from 'canvas-confetti';

interface AchievementCelebrationProps {
  title: string;
  description: string;
  points: number;
  icon: string;
  onComplete?: () => void;
}

export const AchievementCelebration = ({
  title,
  description,
  points,
  icon,
  onComplete
}: AchievementCelebrationProps) => {
  const { toast } = useToast();

  useEffect(() => {
    // Show toast notification
    toast({
      title: "Achievement Unlocked!",
      description: title,
      duration: 5000,
    });

    // Create a more elaborate confetti effect
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const colors = ['#ff0000', '#00ff00', '#0000ff'];

    (function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());

    // Call onComplete after animation
    const timer = setTimeout(() => {
      onComplete?.();
    }, 5000);

    return () => clearTimeout(timer);
  }, [title, onComplete, toast]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="fixed inset-0 flex items-center justify-center z-50 bg-background/80"
      >
        <Card className="p-6 max-w-sm w-full bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div 
              className="relative"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Trophy className="w-16 h-16 text-primary" />
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity
                }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="w-6 h-6 text-yellow-500" />
              </motion.div>
            </motion.div>

            <div className="text-center space-y-2">
              <motion.h3 
                className="text-xl font-bold"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {title}
              </motion.h3>
              <p className="text-sm text-muted-foreground">{description}</p>
              <motion.div 
                className="flex items-center justify-center gap-2 text-yellow-500"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Star className="w-5 h-5" />
                <span className="font-bold">+{points} points</span>
              </motion.div>
            </div>
          </motion.div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};