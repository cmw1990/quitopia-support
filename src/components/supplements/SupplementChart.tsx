import { Card } from "@/components/ui/card";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  TooltipProps
} from "recharts";
import { format } from "date-fns";

interface SupplementLog {
  supplement_name: string;
  effectiveness_rating: number;
  energy_impact: number;
  stress_impact: number;
  focus_impact: number;
  mood_impact: number;
  sleep_impact: number;
  created_at: string;
}

const impactMetrics = [
  { key: "effectiveness_rating", label: "Effectiveness", color: "#0ea5e9" },
  { key: "energy_impact", label: "Energy", color: "#f59e0b" },
  { key: "stress_impact", label: "Stress", color: "#10b981" },
  { key: "focus_impact", label: "Focus", color: "#6366f1" },
  { key: "mood_impact", label: "Mood", color: "#ec4899" },
  { key: "sleep_impact", label: "Sleep", color: "#8b5cf6" },
];

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (!active || !payload) return null;
  
  return (
    <div className="rounded-lg bg-white p-4 shadow-lg border border-gray-200">
      <div className="space-y-2">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600">
                {impactMetrics.find(m => m.key === entry.dataKey)?.label}
              </span>
            </div>
            <span className="font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export function SupplementChart({ data }: { data: SupplementLog[] }) {
  // Group data by supplement name
  const supplementGroups = data.reduce((acc, log) => {
    if (!acc[log.supplement_name]) {
      acc[log.supplement_name] = [];
    }
    acc[log.supplement_name].push({
      ...log,
      date: format(new Date(log.created_at), "MMM d"),
    });
    return acc;
  }, {} as Record<string, (SupplementLog & { date: string })[]>);

  if (Object.keys(supplementGroups).length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        No supplement data available for visualization
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(supplementGroups).map(([supplementName, logs]) => (
        <Card key={supplementName} className="p-6">
          <h3 className="text-lg font-semibold mb-4">{supplementName} Impact Trends</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={logs}>
                <XAxis
                  dataKey="date"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 10]}
                  ticks={[0, 2, 4, 6, 8, 10]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {impactMetrics.map(({ key, label, color }) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={label}
                    stroke={color}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      ))}
    </div>
  );
}