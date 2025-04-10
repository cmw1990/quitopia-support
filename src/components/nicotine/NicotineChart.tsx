import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface NicotineChartProps {
  data: any[];
  isLoading?: boolean;
}

export function NicotineChart({ data = [], isLoading = false }: NicotineChartProps) {
  if (isLoading) {
    return (
      <div className="text-center text-muted-foreground">
        Loading data...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        No data available for visualization
      </div>
    );
  }

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Line yAxisId="left" type="monotone" dataKey="amount" stroke="#8884d8" name="Amount (mg)" />
          <Line yAxisId="right" type="monotone" dataKey="energy" stroke="#82ca9d" name="Energy Level" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}