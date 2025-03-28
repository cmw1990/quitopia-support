import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { useAuth } from '../AuthProvider';
import { format, subDays } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getConsumptionLogs } from "../../api/apiCompatibility";
import { NicotineConsumptionLog } from '../../types/dataTypes';

type ConsumptionLogData = {
  date: string;
  consumption: number;
};

export const NicotineTracker: React.FC = () => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [consumptionData, setConsumptionData] = useState<ConsumptionLogData[]>([]);
  const [totalReduction, setTotalReduction] = useState(0);
  const [reductionGoal, setReductionGoal] = useState(30); // Example goal: 30% reduction

  useEffect(() => {
    const fetchConsumptionData = async () => {
      if (!session?.user?.id) return;
      
      try {
        setLoading(true);
        const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');
        const endDate = format(new Date(), 'yyyy-MM-dd');
        
        const logs = await getConsumptionLogs(
          session.user.id,
          startDate,
          endDate,
          session
        );
        
        // Process logs into chart data
        const chartData: ConsumptionLogData[] = [];
        const consumptionByDate: { [date: string]: number } = {};
        
        // Group by date and sum quantities
        logs.forEach(log => {
          const date = log.consumption_date.split('T')[0];
          if (!consumptionByDate[date]) {
            consumptionByDate[date] = 0;
          }
          consumptionByDate[date] += log.quantity || 0;
        });
        
        // Convert to array for chart
        Object.entries(consumptionByDate).forEach(([date, consumption]) => {
          chartData.push({ date, consumption });
        });
        
        // Sort by date
        chartData.sort((a, b) => a.date.localeCompare(b.date));
        
        setConsumptionData(chartData);
        
        // Calculate reduction percentage
        if (chartData.length >= 2) {
          const firstWeekAvg = chartData.slice(0, 7).reduce((sum, item) => sum + item.consumption, 0) / 7;
          const lastWeekAvg = chartData.slice(-7).reduce((sum, item) => sum + item.consumption, 0) / 7;
          
          if (firstWeekAvg > 0) {
            const reduction = ((firstWeekAvg - lastWeekAvg) / firstWeekAvg) * 100;
            setTotalReduction(Math.max(0, reduction));
          }
        }
      } catch (error) {
        console.error('Failed to fetch consumption data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchConsumptionData();
  }, [session]);

  if (loading) {
    return (
      <div className="h-[200px] flex items-center justify-center">
        <div className="animate-spin h-6 w-6 border-b-2 border-primary rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between">
          <h4 className="text-sm font-medium">Nicotine Reduction</h4>
          <span className="text-sm font-medium">{totalReduction.toFixed(1)}%</span>
        </div>
        <Progress value={(totalReduction / reductionGoal) * 100} className="h-2" />
        <p className="text-xs text-muted-foreground text-right">
          Goal: {reductionGoal}% reduction
        </p>
      </div>
      
      <div className="h-[200px] pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={consumptionData}
            margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10 }}
              tickFormatter={(date) => format(new Date(date), 'dd MMM')}
              stroke="#888888"
            />
            <YAxis tick={{ fontSize: 10 }} stroke="#888888" />
            <Tooltip
              formatter={(value) => [`${value} units`, 'Consumption']}
              labelFormatter={(date) => format(new Date(date), 'dd MMM yyyy')}
            />
            <Line
              type="monotone"
              dataKey="consumption"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {consumptionData.length === 0 && (
        <div className="text-center text-muted-foreground text-sm py-4">
          No consumption data available. Start logging your nicotine usage.
        </div>
      )}
    </div>
  );
}; 