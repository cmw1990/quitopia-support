import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui';
import { Session } from '@supabase/supabase-js';
import { ArrowDownIcon, ArrowUpIcon, DownloadIcon, RefreshCwIcon } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay, isAfter, isBefore, parseISO } from 'date-fns';
import useOfflineStatus from '../../hooks/useOfflineStatus';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, Area, AreaChart } from 'recharts';
import { toast } from 'sonner';
import { fetchConsumptionData, ConsumptionLog } from '../../api/analyticsClient';

interface ConsumptionAnalyticsProps {
  session: Session | null;
}

interface Product {
  id: string;
  name: string;
  type: string;
  nicotine_content: number;
  cost_per_unit: number;
}

interface ConsumptionByDayData {
  date: string;
  units: number;
  nicotine: number;
  cost: number;
}

interface ProductUsageData {
  name: string;
  value: number;
}

export const ConsumptionAnalytics: React.FC<ConsumptionAnalyticsProps> = ({ session }) => {
  const [consumptionData, setConsumptionData] = useState<ConsumptionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7days' | '30days' | '90days' | 'all'>('30days');
  const { isOnline } = useOfflineStatus();
  
  // Calculated metrics
  const [totalConsumption, setTotalConsumption] = useState(0);
  const [totalNicotine, setTotalNicotine] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [consumptionByDay, setConsumptionByDay] = useState<ConsumptionByDayData[]>([]);
  const [productUsage, setProductUsage] = useState<ProductUsageData[]>([]);
  const [consumptionTrend, setConsumptionTrend] = useState<'up' | 'down' | 'stable'>('stable');
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Fetch consumption data
  const fetchConsumptionDataForAnalytics = async () => {
    if (!session?.user?.id) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Fetch real data from Supabase using our analyticsClient
      const data = await fetchConsumptionData(session.user.id, dateRange, session);
      
      if (data.length === 0) {
        toast.info("No consumption data found for the selected period. Try a different date range.");
      }
      
      setConsumptionData(data);
      
      // Calculate metrics from the real data
      calculateMetrics(data, new Date());
    } catch (error) {
      console.error('Error fetching consumption data:', error);
      toast.error('Failed to load consumption analytics. Using cached data if available.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate metrics from consumption data
  const calculateMetrics = (data: ConsumptionLog[], startDate: Date) => {
    // Total consumption
    const totalUnits = data.reduce((sum, item) => sum + item.quantity, 0);
    setTotalConsumption(totalUnits);
    
    // Total nicotine
    const totalNicotineAmount = data.reduce((sum, item) => sum + (item.nicotine_content * item.quantity), 0);
    setTotalNicotine(Math.round(totalNicotineAmount * 10) / 10);
    
    // Total cost
    const totalCostAmount = data.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
    setTotalCost(Math.round(totalCostAmount * 100) / 100);
    
    // Calculate consumption by day
    const consumptionMap = new Map<string, { units: number, nicotine: number, cost: number }>();
    
    data.forEach(item => {
      const date = format(new Date(item.timestamp), 'yyyy-MM-dd');
      const current = consumptionMap.get(date) || { units: 0, nicotine: 0, cost: 0 };
      
      consumptionMap.set(date, {
        units: current.units + item.quantity,
        nicotine: current.nicotine + (item.nicotine_content * item.quantity),
        cost: current.cost + (item.cost * item.quantity)
      });
    });
    
    const consumptionByDayArray: ConsumptionByDayData[] = Array.from(consumptionMap.entries())
      .map(([date, { units, nicotine, cost }]) => ({
        date: format(new Date(date), 'MMM d'),
        units,
        nicotine: Math.round(nicotine * 10) / 10,
        cost: Math.round(cost * 100) / 100
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    setConsumptionByDay(consumptionByDayArray);
    
    // Calculate product usage
    const productMap = new Map<string, number>();
    
    data.forEach(item => {
      const productName = item.product_name;
      const current = productMap.get(productName) || 0;
      productMap.set(productName, current + item.quantity);
    });
    
    const productUsageArray: ProductUsageData[] = Array.from(productMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    
    setProductUsage(productUsageArray);
    
    // Calculate consumption trend
    if (consumptionByDayArray.length > 1) {
      // Split into two periods
      const midPoint = Math.floor(consumptionByDayArray.length / 2);
      const recentPeriod = consumptionByDayArray.slice(midPoint);
      const previousPeriod = consumptionByDayArray.slice(0, midPoint);
      
      // Calculate average consumption for both periods
      const recentAvgConsumption = recentPeriod.reduce((sum, day) => sum + day.units, 0) / recentPeriod.length;
      const previousAvgConsumption = previousPeriod.reduce((sum, day) => sum + day.units, 0) / previousPeriod.length;
      
      // Determine trend
      if (recentAvgConsumption < previousAvgConsumption * 0.95) {
        setConsumptionTrend('down');
      } else if (recentAvgConsumption > previousAvgConsumption * 1.05) {
        setConsumptionTrend('up');
      } else {
        setConsumptionTrend('stable');
      }
    }
  };
  
  useEffect(() => {
    fetchConsumptionDataForAnalytics();
  }, [session, dateRange]);
  
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-2 border shadow-sm rounded-md text-sm">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.name === 'Cost' && ` $`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  // Handle data export
  const handleDataExport = () => {
    if (consumptionData.length === 0) {
      toast.error("No data to export");
      return;
    }
    
    try {
      // Prepare data for CSV
      const headers = "Date,Time,Product,Type,Quantity,Nicotine Content,Cost\n";
      const csvData = consumptionData.map(item => {
        const date = format(new Date(item.timestamp), 'yyyy-MM-dd');
        const time = format(new Date(item.timestamp), 'HH:mm:ss');
        return `${date},${time},${item.product_name || ''},${item.product_type || ''},${item.quantity},${item.nicotine_content},${item.cost}`;
      }).join('\n');
      
      const blob = new Blob([headers + csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `consumption-data-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Data exported successfully");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Consumption Analytics</h2>
          <p className="text-muted-foreground">Track your nicotine consumption patterns</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" onClick={fetchConsumptionDataForAnalytics} disabled={isLoading}>
            <RefreshCwIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button variant="outline" size="icon" onClick={handleDataExport} disabled={consumptionData.length === 0}>
            <DownloadIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Units Consumed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <div className="text-3xl font-bold">{totalConsumption}</div>
              <div className="ml-2 flex items-center text-sm text-muted-foreground">
                {consumptionTrend === 'down' && (
                  <span className="text-green-500 flex items-center">
                    <ArrowDownIcon className="h-4 w-4 mr-1" />
                    Decreasing
                  </span>
                )}
                {consumptionTrend === 'up' && (
                  <span className="text-red-500 flex items-center">
                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                    Increasing
                  </span>
                )}
                {consumptionTrend === 'stable' && (
                  <span className="text-gray-500">Stable</span>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total product units in this period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Nicotine</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <div className="text-3xl font-bold">{totalNicotine} <span className="text-sm font-normal text-muted-foreground">mg</span></div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total nicotine consumed (milligrams)
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <div className="text-3xl font-bold">${totalCost}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total money spent on products
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* No Data State */}
      {consumptionData.length === 0 && !isLoading && (
        <Card className="w-full p-6 text-center">
          <div className="flex flex-col items-center justify-center py-10">
            <BarChart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Consumption Data Available</h3>
            <p className="text-muted-foreground mb-4">
              {isOnline 
                ? "No consumption data found for the selected period. Try a different date range or log some consumption."
                : "You appear to be offline. Connect to the internet to fetch your data."}
            </p>
            {isOnline && (
              <Button 
                variant="outline" 
                onClick={() => window.location.href = "/app/consumption-logger"}
              >
                Log Consumption
              </Button>
            )}
          </div>
        </Card>
      )}
      
      {/* Loading State */}
      {isLoading && (
        <Card className="w-full p-6 text-center">
          <div className="flex flex-col items-center justify-center py-10">
            <RefreshCwIcon className="h-12 w-12 text-primary mb-4 animate-spin" />
            <h3 className="text-lg font-medium">Loading Analytics</h3>
            <p className="text-muted-foreground">Please wait while we fetch your data...</p>
          </div>
        </Card>
      )}
      
      {/* Charts - Only show if we have data */}
      {consumptionData.length > 0 && !isLoading && (
        <>
          {/* Consumption Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Consumption Over Time</CardTitle>
              <CardDescription>Units, nicotine content, and cost by day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={consumptionByDay}
                    margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="units"
                      name="Units"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                      activeDot={{ r: 8 }}
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="nicotine"
                      name="Nicotine (mg)"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.3}
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="cost"
                      name="Cost"
                      stroke="#ffc658"
                      fill="#ffc658"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Product Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Product Distribution</CardTitle>
              <CardDescription>Breakdown of products consumed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productUsage}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {productUsage.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ConsumptionAnalytics; 