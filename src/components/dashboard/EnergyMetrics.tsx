import { Battery, Brain, Heart, Moon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { getUserMetrics } from "@/lib/api/metrics";

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  description: string;
}

const MetricCard = ({ title, value, icon: Icon, color, description }: MetricCardProps) => (
  <Card className="relative overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className={`h-4 w-4 ${color}`} />
    </CardHeader>
    <CardContent>
      <div className="flex flex-col space-y-2">
        <Progress value={value} className="h-2" />
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </CardContent>
  </Card>
);

export function EnergyMetrics() {
  const { data: metrics } = useQuery({
    queryKey: ["userMetrics"],
    queryFn: getUserMetrics,
  });

  const defaultMetrics = {
    physical: 75,
    mental: 80,
    emotional: 65,
    sleep: 70,
  };

  const currentMetrics = metrics || defaultMetrics;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Physical Energy"
        value={currentMetrics.physical}
        icon={Battery}
        color="text-green-500"
        description="Based on activity and recovery"
      />
      <MetricCard
        title="Mental Energy"
        value={currentMetrics.mental}
        icon={Brain}
        color="text-blue-500"
        description="Focus and cognitive performance"
      />
      <MetricCard
        title="Emotional Energy"
        value={currentMetrics.emotional}
        icon={Heart}
        color="text-red-500"
        description="Mood and emotional balance"
      />
      <MetricCard
        title="Sleep Quality"
        value={currentMetrics.sleep}
        icon={Moon}
        color="text-indigo-500"
        description="Last night's sleep score"
      />
    </div>
  );
}
