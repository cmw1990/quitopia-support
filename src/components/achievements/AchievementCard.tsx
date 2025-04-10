import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Target, Medal } from "lucide-react";
import { motion } from "framer-motion";

interface AchievementCardProps {
  title: string;
  description: string;
  icon: string;
  progress: number;
  points: number;
  unlocked: boolean;
}

export const AchievementCard = ({
  title,
  description,
  icon,
  progress,
  points,
  unlocked,
}: AchievementCardProps) => {
  const getIcon = () => {
    switch (icon) {
      case 'star':
        return <Star className="h-5 w-5" />;
      case 'target':
        return <Target className="h-5 w-5" />;
      case 'medal':
        return <Medal className="h-5 w-5" />;
      default:
        return <Trophy className="h-5 w-5" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`relative overflow-hidden ${unlocked ? 'bg-primary/5' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-full ${unlocked ? 'bg-primary/20' : 'bg-muted'}`}>
              {getIcon()}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
              <div className="mt-3">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {progress}% Complete • {points} Points
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};