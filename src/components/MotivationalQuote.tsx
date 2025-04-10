import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

// Define the structure for a quote
interface Quote {
  quote: string;
  author: string;
}

// Predefined list of motivational quotes
const quotes: Quote[] = [
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { quote: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { quote: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill" },
  { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { quote: "Act as if what you do makes a difference. It does.", author: "William James" },
  { quote: "The best way to predict the future is to create it.", author: "Peter Drucker" },
  { quote: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { quote: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
  { quote: "The harder I work, the luckier I get.", author: "Gary Player" }
];

// Define props for the component (if any needed in future)
interface MotivationalQuoteProps {}

export const MotivationalQuote: React.FC<MotivationalQuoteProps> = () => {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);

  useEffect(() => {
    // Select a random quote when the component mounts
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setCurrentQuote(quotes[randomIndex]);
  }, []); // Empty dependency array ensures this runs only once on mount

  if (!currentQuote) {
    return null; // Don't render anything if no quote is selected yet
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <Card className="bg-gradient-to-r from-primary/5 via-background to-secondary/5 border-border/50 backdrop-blur-sm">
        <CardContent className="pt-6 flex items-start gap-4">
          <Sparkles className="h-6 w-6 text-primary flex-shrink-0 mt-1 opacity-80" />
          <div>
            <p className="text-lg font-medium italic mb-2">
              "{currentQuote.quote}"
            </p>
            <p className="text-sm text-muted-foreground text-right">
              - {currentQuote.author}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Add the default export
export default MotivationalQuote; 