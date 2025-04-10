
import { Achievement } from './types';
import { Trophy, Medal } from 'lucide-react';

interface AchievementItemProps {
  achievement: Achievement;
}

export const AchievementItem = ({ achievement }: AchievementItemProps) => {
  return (
    <div
      className={`p-4 rounded-lg ${
        achievement.unlocked ? "bg-primary/10" : "bg-muted/50"
      }`}
    >
      <div className="flex items-center gap-3">
        {achievement.icon === 'medal' ? (
          <Medal className={`h-5 w-5 ${
            achievement.unlocked ? "text-primary" : "text-muted-foreground"
          }`} />
        ) : (
          <Trophy className={`h-5 w-5 ${
            achievement.unlocked ? "text-primary" : "text-muted-foreground"
          }`} />
        )}
        <div>
          <p className="font-medium">{achievement.title}</p>
          <p className="text-sm text-muted-foreground">
            {achievement.description}
          </p>
        </div>
      </div>
    </div>
  );
};
