import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Moon, Sun, Clock, Activity } from "lucide-react";

interface SleepScoreProps {
  score: number;
  metrics: {
    duration: number;
    quality: number;
    timing: number;
    consistency: number;
  };
}

export function SleepScore({ score, metrics }: SleepScoreProps) {
  const scoreColor = 
    score >= 90 ? "text-green-500" :
    score >= 70 ? "text-yellow-500" :
    "text-red-500";

  const MetricCard = ({ value, label, icon: Icon, description }: any) => (
    <div className="flex items-center space-x-4 p-4">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{label}</p>
          <span className="text-sm font-bold">{value}%</span>
        </div>
        <Progress value={value} className="mt-2" />
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Sleep Score</span>
          <span className={`text-2xl font-bold ${scoreColor}`}>{score}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <MetricCard
          value={metrics.duration}
          label="Duration"
          icon={Clock}
          description="Time spent sleeping"
        />
        <MetricCard
          value={metrics.quality}
          label="Quality"
          icon={Moon}
          description="Deep and REM sleep"
        />
        <MetricCard
          value={metrics.timing}
          label="Timing"
          icon={Sun}
          description="Sleep schedule alignment"
        />
        <MetricCard
          value={metrics.consistency}
          label="Consistency"
          icon={Activity}
          description="Regular sleep pattern"
        />
      </CardContent>
    </Card>
  );
}
