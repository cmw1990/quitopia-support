
import { Challenge } from './types';
import { Button } from '@/components/ui/button';
import { Target } from 'lucide-react';

interface ChallengeItemProps {
  challenge: Challenge;
  onComplete: (challengeId: string) => void;
}

export const ChallengeItem = ({ challenge, onComplete }: ChallengeItemProps) => {
  return (
    <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-white/5 rounded-lg">
      <div className="flex items-center gap-3">
        <Target className="h-5 w-5 text-primary" />
        <div>
          <p className="font-medium">{challenge.title}</p>
          <p className="text-sm text-muted-foreground">{challenge.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">+{challenge.points} pts</span>
        <Button
          variant={challenge.completed ? "ghost" : "outline"}
          size="sm"
          disabled={challenge.completed}
          onClick={() => onComplete(challenge.id)}
        >
          {challenge.completed ? "Completed" : "Complete"}
        </Button>
      </div>
    </div>
  );
};
