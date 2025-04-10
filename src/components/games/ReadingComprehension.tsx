import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SUPABASE_URL, SUPABASE_KEY } from "@/integrations/supabase/db-client";
import { useAuth } from "@/components/AuthProvider";
import { BookOpen } from "lucide-react";

interface Question {
  text: string;
  options: string[];
  correctAnswer: number;
}

const PASSAGES = [
  {
    text: `The human brain is remarkably adaptable. This characteristic, known as neuroplasticity, allows the brain to modify its connections and rewire itself, particularly when learning new things or recovering from injuries. Research has shown that engaging in regular mental exercises can enhance this adaptability, leading to improved cognitive function and memory retention. Additionally, physical exercise has been found to promote the growth of new neural connections, demonstrating the strong link between physical and mental health.`,
    questions: [
      {
        text: "What is the brain's ability to modify and rewire itself called?",
        options: ["Neural adaptation", "Neuroplasticity", "Brain flexibility", "Cognitive rewiring"],
        correctAnswer: 1
      },
      {
        text: "According to the passage, what can enhance the brain's adaptability?",
        options: ["Sleep", "Mental exercises", "Medication", "Aging"],
        correctAnswer: 1
      }
    ]
  },
  {
    text: `Mindfulness meditation has gained significant attention in recent years for its potential benefits on mental health and cognitive function. Studies have demonstrated that regular meditation practice can reduce stress, improve attention span, and enhance emotional regulation. Brain imaging research has revealed that long-term meditators show increased gray matter density in regions associated with learning, memory, and emotional control. These findings suggest that mindfulness is not just a relaxation technique but a powerful tool for cognitive enhancement.`,
    questions: [
      {
        text: "What is one benefit of mindfulness meditation mentioned in the passage?",
        options: ["Weight loss", "Stress reduction", "Physical strength", "Social skills"],
        correctAnswer: 1
      },
      {
        text: "What change has been observed in long-term meditators' brains?",
        options: ["Decreased brain size", "Increased gray matter density", "Reduced neural activity", "Color changes"],
        correctAnswer: 1
      }
    ]
  }
];

export const ReadingComprehension = () => {
  const [currentPassage, setCurrentPassage] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showingPassage, setShowingPassage] = useState(true);
  const { toast } = useToast();
  const { session } = useAuth();

  const startGame = () => {
    setIsActive(true);
    setScore(0);
    setCurrentPassage(0);
    setCurrentQuestion(0);
    setShowingPassage(true);
  };

  const handleAnswer = (answerIndex: number) => {
    const isCorrect = answerIndex === PASSAGES[currentPassage].questions[currentQuestion].correctAnswer;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      toast({
        title: "Correct!",
        description: "Well done!",
      });
    } else {
      toast({
        title: "Incorrect",
        description: "Try the next question!",
        variant: "destructive",
      });
    }

    if (currentQuestion < PASSAGES[currentPassage].questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else if (currentPassage < PASSAGES.length - 1) {
      setCurrentPassage(prev => prev + 1);
      setCurrentQuestion(0);
      setShowingPassage(true);
    } else {
      endGame();
    }
  };

  const endGame = async () => {
    setIsActive(false);
    setIsSubmitting(true);
    
    if (session?.user) {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/energy_focus_logs`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${session.access_token}`,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              user_id: session.user.id,
              activity_type: "reading_comprehension",
              activity_name: "Reading Comprehension",
              duration_minutes: Math.ceil(score * 2),
              focus_rating: Math.round((score / 4) * 10),
              energy_rating: null,
              notes: `Completed Reading Comprehension with score: ${score}/4`
            })
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || response.statusText);
        }

        toast({
          title: "Game Complete!",
          description: `Final score: ${score}/4. Well done!`,
        });
      } catch (error) {
        console.error("Error logging Reading Comprehension:", error);
        toast({
          title: "Error Saving Results",
          description: "There was a problem saving your game results.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full animate-float">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Reading Comprehension</h2>
        </div>
        <div className="text-lg font-semibold">Score: {score}/4</div>
      </div>

      {!isActive ? (
        <Button 
          onClick={startGame} 
          className="w-full animate-pulse bg-primary/90 hover:bg-primary"
          disabled={isSubmitting}
        >
          Start Game
        </Button>
      ) : (
        <div className="space-y-6">
          {showingPassage ? (
            <>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-lg leading-relaxed">{PASSAGES[currentPassage].text}</p>
              </div>
              <Button 
                onClick={() => setShowingPassage(false)}
                className="w-full"
              >
                Continue to Questions
              </Button>
            </>
          ) : (
            <>
              <div className="text-lg font-medium mb-4">
                {PASSAGES[currentPassage].questions[currentQuestion].text}
              </div>
              <div className="grid gap-3">
                {PASSAGES[currentPassage].questions[currentQuestion].options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    variant="outline"
                    className="text-left h-auto py-3 px-4"
                    disabled={isSubmitting}
                  >
                    {option}
                  </Button>
                ))}
              </div>
              <Button
                variant="ghost"
                onClick={() => setShowingPassage(true)}
                className="w-full mt-4"
              >
                Review Passage
              </Button>
            </>
          )}
        </div>
      )}

      <div className="mt-6 text-sm text-muted-foreground">
        Read the passage carefully and answer questions to test your comprehension skills.
      </div>
    </Card>
  );
};