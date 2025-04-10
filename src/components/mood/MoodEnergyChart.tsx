import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MoodLog } from '@/types/mood';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from 'next-themes'; // To get theme colors
import { Scale } from 'lucide-react'; // Import Scale icon

interface MoodEnergyChartProps {
  data: MoodLog[];
}

// Helper to format date for XAxis
const formatDateTick = (tickItem: string) => {
    try {
      return format(parseISO(tickItem), 'MMM d'); // e.g., Aug 15
    } catch (e) {
      return ''; // Handle potential invalid dates
    }
};

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const date = formatDateTick(label);
    return (
      <div className="bg-background border border-border shadow-lg rounded-md p-3 text-xs">
        <p className="font-semibold mb-1">{date}</p>
        {payload.map((pld: any, index: number) => (
          <p key={index} style={{ color: pld.color }} className="capitalize">
            {`${pld.name.replace('_rating', '')}: ${pld.value}`}
          </p>
        ))}
        <p className="text-muted-foreground text-xs mt-1">{format(parseISO(label), 'p')}</p>
      </div>
    );
  }
  return null;
};

const MoodEnergyChart: React.FC<MoodEnergyChartProps> = ({ data }) => {
    const { resolvedTheme } = useTheme();

    // Prepare data for chart, sorting by timestamp ascending
    const chartData = data
        .map(log => ({
            timestamp: log.timestamp as string, // Assuming string format
            mood_rating: log.mood_rating,
            energy_rating: log.energy_rating,
        }))
        .sort((a, b) => parseISO(a.timestamp).getTime() - parseISO(b.timestamp).getTime());

    if (!chartData || chartData.length < 2) {
        return (
            <Card className="border-dashed border-2">
                <CardHeader><CardTitle className="text-lg">Mood & Energy Trend</CardTitle></CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-56 text-center">
                    <Scale size={32} className="text-muted-foreground mb-3"/>
                    <p className="text-muted-foreground text-sm font-medium">Not enough data yet</p>
                    <p className="text-muted-foreground text-xs">Log your mood and energy at least twice to see the trend chart.</p>
                </CardContent>
            </Card>
        );
    }

    // Get theme-aware colors
    const colors = resolvedTheme === 'dark'
        ? { grid: 'hsl(var(--border) / 0.5)', text: 'hsl(var(--muted-foreground))', mood: 'hsl(var(--primary))', energy: 'hsl(var(--yellow-500))' }
        : { grid: 'hsl(var(--border))', text: 'hsl(var(--muted-foreground))', mood: 'hsl(var(--primary))', energy: 'hsl(var(--yellow-600))' }; 

    return (
        <Card className="border shadow-sm">
            <CardHeader><CardTitle className="text-lg">Mood & Energy Trend (Last 15)</CardTitle></CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 5, left: -25, bottom: 5 }} // Adjust margins for two axes
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                        <XAxis
                            dataKey="timestamp"
                            tickFormatter={formatDateTick}
                            stroke={colors.text}
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            interval="preserveStartEnd"
                            minTickGap={40}
                        />
                        {/* Left Y-Axis for Mood */}
                        <YAxis
                            yAxisId="left"
                            orientation="left"
                            stroke={colors.mood} // Use mood color for axis
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            domain={[1, 5]} // Mood scale
                            allowDecimals={false}
                            tickCount={5} // Ticks for 1, 2, 3, 4, 5
                        />
                        {/* Right Y-Axis for Energy */}
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke={colors.energy} // Use energy color for axis
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 10]} // Energy scale
                            allowDecimals={false}
                            tickCount={6} // Ticks for 0, 2, 4, 6, 8, 10
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: colors.text, strokeDasharray: '3 3' }} />
                        <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                        <Line
                            yAxisId="left" // Assign to left axis
                            type="monotone"
                            dataKey="mood_rating"
                            name="Mood"
                            stroke={colors.mood}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6, strokeWidth: 0, fill: colors.mood }}
                        />
                        <Line
                            yAxisId="right" // Assign to right axis
                            type="monotone"
                            dataKey="energy_rating"
                            name="Energy"
                            stroke={colors.energy}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6, strokeWidth: 0, fill: colors.energy }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default MoodEnergyChart; 