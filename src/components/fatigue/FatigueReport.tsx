import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { Line, Bar } from 'recharts';
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useFatigue, FatigueEntry } from './AntiFatigueContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Activity, BarChart2, Calendar, CalendarDays, ChevronRight, Download, LineChart } from 'lucide-react';

interface AggregatedData {
  date: string;
  mentalAvg: number;
  physicalAvg: number;
  emotionalAvg: number;
  sensoryAvg: number;
  count: number;
}

export function FatigueReport() {
  const { entries } = useFatigue();
  const [dateRange, setDateRange] = useState<number>(7); // Default to 7 days
  const [chartData, setChartData] = useState<AggregatedData[]>([]);
  const [viewType, setViewType] = useState<'line' | 'bar'>('line');
  
  // Process entries whenever the entries or date range changes
  useEffect(() => {
    if (!entries.length) return;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = subDays(endDate, dateRange);
    
    // Generate array of all dates in range
    const datesInRange = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Initialize data map with all dates
    const dataMap = new Map<string, AggregatedData>();
    
    datesInRange.forEach(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      dataMap.set(dateStr, {
        date: format(date, 'MMM d'),
        mentalAvg: 0,
        physicalAvg: 0,
        emotionalAvg: 0,
        sensoryAvg: 0,
        count: 0
      });
    });
    
    // Aggregate entry data
    entries.forEach(entry => {
      const entryDate = entry.date.substring(0, 10); // Get YYYY-MM-DD part only
      
      if (dataMap.has(entryDate)) {
        const data = dataMap.get(entryDate)!;
        
        // Accumulate values for averaging later
        data.mentalAvg += entry.mental_fatigue;
        data.physicalAvg += entry.physical_fatigue;
        data.emotionalAvg += entry.emotional_fatigue;
        data.sensoryAvg += entry.sensory_fatigue;
        data.count += 1;
        
        dataMap.set(entryDate, data);
      }
    });
    
    // Calculate averages
    dataMap.forEach((data, key) => {
      if (data.count > 0) {
        data.mentalAvg = Math.round((data.mentalAvg / data.count) * 10) / 10;
        data.physicalAvg = Math.round((data.physicalAvg / data.count) * 10) / 10;
        data.emotionalAvg = Math.round((data.emotionalAvg / data.count) * 10) / 10;
        data.sensoryAvg = Math.round((data.sensoryAvg / data.count) * 10) / 10;
      }
      dataMap.set(key, data);
    });
    
    // Convert map to array and sort by date
    const sortedData = Array.from(dataMap.values()).sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    
    setChartData(sortedData);
  }, [entries, dateRange]);
  
  // Handle download of chart data as CSV
  const handleDownloadCSV = () => {
    if (!chartData.length) return;
    
    // Create CSV content
    const headers = ['Date', 'Mental Fatigue', 'Physical Fatigue', 'Emotional Fatigue', 'Sensory Fatigue'];
    const csvContent = [
      headers.join(','),
      ...chartData.map(row => {
        return [
          row.date,
          row.mentalAvg,
          row.physicalAvg,
          row.emotionalAvg,
          row.sensoryAvg
        ].join(',');
      })
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `fatigue-report-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-primary" />
          Fatigue Report
        </CardTitle>
        <CardDescription>
          Track your fatigue patterns over time to identify triggers and improvements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground mb-2">No fatigue data available yet</p>
            <p className="text-center text-sm text-muted-foreground mb-4">
              Track your fatigue daily to see patterns and insights here
            </p>
            <Button variant="outline">Start Tracking</Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-1">
                <Label htmlFor="date-range">Time Period</Label>
                <Select
                  value={dateRange.toString()}
                  onValueChange={(value) => setDateRange(parseInt(value))}
                >
                  <SelectTrigger id="date-range" className="w-[180px]">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="14">Last 14 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 3 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewType === 'line' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setViewType('line')}
                >
                  <LineChart className="h-4 w-4 mr-1" />
                  Line
                </Button>
                <Button
                  variant={viewType === 'bar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewType('bar')}
                >
                  <BarChart2 className="h-4 w-4 mr-1" />
                  Bar
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadCSV}>
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
            
            <div className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(1)}`, '']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  
                  {viewType === 'line' ? (
                    <>
                      <Line 
                        type="monotone" 
                        dataKey="mentalAvg" 
                        name="Mental" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="physicalAvg" 
                        name="Physical" 
                        stroke="#82ca9d" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="emotionalAvg" 
                        name="Emotional" 
                        stroke="#ffc658" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="sensoryAvg" 
                        name="Sensory" 
                        stroke="#ff8042" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </>
                  ) : (
                    <>
                      <Bar dataKey="mentalAvg" name="Mental" fill="#8884d8" barSize={20} />
                      <Bar dataKey="physicalAvg" name="Physical" fill="#82ca9d" barSize={20} />
                      <Bar dataKey="emotionalAvg" name="Emotional" fill="#ffc658" barSize={20} />
                      <Bar dataKey="sensoryAvg" name="Sensory" fill="#ff8042" barSize={20} />
                    </>
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            
            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries({
                  "Mental": chartData.reduce((avg, day) => avg + day.mentalAvg, 0) / chartData.length,
                  "Physical": chartData.reduce((avg, day) => avg + day.physicalAvg, 0) / chartData.length,
                  "Emotional": chartData.reduce((avg, day) => avg + day.emotionalAvg, 0) / chartData.length,
                  "Sensory": chartData.reduce((avg, day) => avg + day.sensoryAvg, 0) / chartData.length
                }).map(([type, value]) => (
                  <Card key={type} className="bg-muted/50">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                        Avg {type}
                      </span>
                      <span className={`text-2xl font-semibold ${
                        value >= 7 ? 'text-destructive' : 
                        value >= 5 ? 'text-amber-500' : 
                        'text-success'
                      }`}>
                        {value.toFixed(1)}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 