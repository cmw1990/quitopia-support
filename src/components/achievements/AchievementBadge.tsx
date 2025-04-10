import { Award, Trophy, Star, Medal } from "lucide-react";
import { cn } from "@/lib/utils";

interface AchievementBadgeProps {
  icon: string;
  size?: "sm" | "md" | "lg";
  unlocked?: boolean;
  progress?: number;
  className?: string;
}

const iconMap = {
  award: Award,
  trophy: Trophy,
  star: Star,
  medal: Medal,
};

export const AchievementBadge = ({
  icon,
  size = "md",
  unlocked = false,
  progress = 0,
  className,
}: AchievementBadgeProps) => {
  const Icon = iconMap[icon as keyof typeof iconMap] || Trophy;
  
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };

  return (
    <div className={cn(
      "relative flex items-center justify-center",
      sizeClasses[size],
      className
    )}>
      <div className={cn(
        "absolute inset-0 rounded-full transition-all duration-300",
        unlocked ? "bg-primary/20" : "bg-muted/20"
      )} />
      <Icon 
        className={cn(
          "transition-all duration-300",
          unlocked ? "text-primary" : "text-muted-foreground",
          sizeClasses[size]
        )} 
      />
      {!unlocked && progress > 0 && progress < 100 && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs font-medium">
          {progress}%
        </div>
      )}
    </div>
  );
};