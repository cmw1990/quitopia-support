import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useFocusStats } from '@/hooks/useFocusStats';
import { useFocusWidgets, WidgetConfig } from '@/hooks/useFocusWidgets';
import { toast } from 'sonner';
import {
  ResponsiveContainer, LineChart as RechartsLineChart, Line, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { Helmet } from 'react-helmet-async';
import {
  LayoutGrid,
  LineChart as LineChartIcon,
  Brain,
  FileText,
  X,
  RefreshCw,
  Download,
  Zap,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

interface ChartDataItem {
  name: string;
  focus?: number;
  value?: number;
  count?: number;
  [key: string]: any;
}

interface TimeSeriesDataItem {
  date: string;
  focus: number;
  energy?: number;
}

const FocusStatsPage: React.FC = () => {
  const authContext = useAuth();
  const user = authContext?.user;

  const {
    config: widgetConfig,
    isLoading: isLoadingWidgets,
    error: widgetError,
    hasChanges,
    updateLayout,
    resetToDefault,
    saveConfiguration
  } = useFocusWidgets();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [timeRange, setTimeRange] = useState('month');
  const [isEditMode, setIsEditMode] = useState(false);

  const { focusStats, isLoading: isLoadingData, error: dataError, refetch } = useFocusStats(timeRange);

  const handleExportData = async () => {
    toast.info("Export functionality is not yet implemented.");
  };

  const handleGenerateInsights = async () => {
    toast.info("Insight generation is not yet implemented.");
    refetch();
  };

  const handleSaveLayout = async () => {
    if (!widgetConfig) {
      toast.error("Cannot save layout, configuration not loaded.");
      return;
    }
    const success = await saveConfiguration();
    if (success) {
      setIsEditMode(false);
      toast.success("Dashboard layout saved!");
    } else {
      toast.error("Failed to save dashboard layout.");
    }
  };

  const renderSummaryWidget = () => {
    const totalSessions = focusStats?.totalSessions ?? 0;
    const averageFocus = focusStats?.averageFocusScore ?? 0;

    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Focus Summary</CardTitle>
          <CardDescription>Your focus performance overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold">{totalSessions}</div>
              <div className="text-sm text-muted-foreground">Sessions</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold">{averageFocus.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Avg. Focus</div>
            </div>
            <div className="opacity-50">
              <div className="text-3xl font-bold">-</div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </div>
            <div className="opacity-50">
              <div className="text-3xl font-bold">-</div>
              <div className="text-sm text-muted-foreground">Completion</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderTimeSeriesWidget = () => {
    const data = (focusStats?.timeSeriesData as TimeSeriesDataItem[] | undefined) || [];
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl">Focus Over Time</CardTitle>
            <CardDescription>Track your focus and energy trends</CardDescription>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7d</SelectItem>
              <SelectItem value="month">Last 30d</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-2">
          <div className="h-[350px] w-full">
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="focus" stroke="#0088FE" activeDot={{ r: 8 }} name="Focus Score"/>
                  {data.some((d: TimeSeriesDataItem) => d.energy !== undefined && d.energy !== null) &&
                    <Line type="monotone" dataKey="energy" stroke="#00C49F" name="Energy Level"/>
                  }
                </RechartsLineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-center text-muted-foreground">No time series data available for the selected range.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderContextWidget = () => {
    const data = (focusStats?.contextData as ChartDataItem[] | undefined) || [];
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Focus by Context</CardTitle>
          <CardDescription>Where you focus the best</CardDescription>
        </CardHeader>
        <CardContent className="p-2">
          <div className="h-[300px] w-full">
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie data={data} cx="50%" cy="50%" labelLine={true} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                    {data.map((entry: ChartDataItem, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value: number | string | Array<number | string>, name: string, entry: any) => [`${Number(entry.payload?.value).toFixed(1)}%`, name]} />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-center text-muted-foreground">No context data available.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPlaceholderWidget = (title: string, message: string) => {
    return (
      <Card className="w-full opacity-60 min-h-[200px]">
        <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
        <CardContent className="h-full flex items-center justify-center">
          <p className="text-center text-muted-foreground px-4">{message}</p>
        </CardContent>
      </Card>
    );
  };

  const renderWeekdayWidget = () => renderPlaceholderWidget("Focus by Weekday", "Weekday analytics require additional API implementation.");
  const renderTimeOfDayWidget = () => renderPlaceholderWidget("Focus by Time of Day", "Time-of-day analytics require additional API implementation.");
  const renderDistractionsWidget = () => renderPlaceholderWidget("Top Distractions", "Distraction analytics require additional API implementation.");
  const renderInsightsWidget = () => {
    return (
      <Card className="w-full min-h-[200px]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Productivity Insights</CardTitle>
          <Button variant="outline" onClick={handleGenerateInsights} disabled>
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate Insights
          </Button>
        </CardHeader>
        <CardContent className="h-full flex items-center justify-center">
          <p className="text-center text-muted-foreground">AI Insight generation is not yet implemented.</p>
        </CardContent>
      </Card>
    );
  };

  const renderWidget = (widget: WidgetConfig) => {
    if (!widget?.type) {
      console.error("Invalid widget configuration:", widget);
      return <Card><CardHeader><CardTitle>Error</CardTitle></CardHeader><CardContent>Invalid widget data.</CardContent></Card>;
    }

    switch (widget.type) {
      case 'summary': return renderSummaryWidget();
      case 'timeSeries': return renderTimeSeriesWidget();
      case 'byContext': return renderContextWidget();
      case 'byWeekday': return renderWeekdayWidget();
      case 'byTimeOfDay': return renderTimeOfDayWidget();
      case 'topDistractions': return renderDistractionsWidget();
      case 'insights': return renderInsightsWidget();
      default:
        console.warn("Unknown widget type:", widget.type);
        return (
          <Card className="w-full border-dashed border-orange-400">
            <CardHeader><CardTitle>Unknown Widget</CardTitle></CardHeader>
            <CardContent><p>Widget type '{widget.type}' not recognized or implemented.</p></CardContent>
          </Card>
        );
    }
  };

  const renderWidgets = () => {
    if (!widgetConfig?.widgets || widgetConfig.widgets.length === 0) {
      return <p className="text-muted-foreground py-10 text-center">No widgets configured for this dashboard. Use 'Customize Layout' to add widgets.</p>;
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {widgetConfig.widgets
          .filter((w): w is WidgetConfig => !!w && w.isVisible)
          .map((widget) => (
            <div key={widget.id} className={
              widget.size === 'large' ? 'md:col-span-2 lg:col-span-3' :
              ''
            }>
              {renderWidget(widget)}
            </div>
          ))
        }
      </div>
    );
  };

  const renderEditModeControls = () => {
    return (
      <Card className="mb-4 border-dashed border-blue-400 bg-blue-50/30 dark:bg-blue-900/10">
        <CardHeader><CardTitle>Dashboard Customization</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2 items-center">
          <Button size="sm" onClick={handleSaveLayout} disabled={!hasChanges}>
            <LayoutGrid className="h-4 w-4 mr-2" />Save Layout Changes
          </Button>
          <Button size="sm" variant="outline" onClick={() => { resetToDefault(); }}>
            <RefreshCw className="h-4 w-4 mr-2" />Reset to Default
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setIsEditMode(false)}>
            <X className="h-4 w-4 mr-2" />Exit Edit Mode
          </Button>
          <p className="text-sm text-muted-foreground ml-auto flex-shrink-0 pt-2">Widget add/remove/resize controls coming soon.</p>
        </CardContent>
      </Card>
    );
  };

  const pageIsLoading = isLoadingWidgets || isLoadingData;
  const pageError = widgetError || (dataError ? (dataError.message || 'Error loading statistics') : null);

  if (pageIsLoading && !focusStats && !widgetConfig) {
    return (
      <div className="container mx-auto py-8 space-y-6 animate-pulse">
        <Skeleton className="h-10 w-64 mb-4"/>
        <Skeleton className="h-9 w-48 mb-6"/>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-64 rounded-lg"/>
          <Skeleton className="h-64 rounded-lg md:col-span-2"/>
          <Skeleton className="h-64 rounded-lg md:col-span-2"/>
          <Skeleton className="h-64 rounded-lg"/>
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Dashboard</AlertTitle>
          <AlertDescription>
            {typeof pageError === 'string' ? pageError : 'An unexpected error occurred while loading dashboard data.'}
            Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Focus Stats | Easier Focus</title>
        <meta name="description" content="Track and analyze your focus patterns with customizable analytics, insights, and visualization tools." />
      </Helmet>

      <div className="container mx-auto py-8 space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Focus Statistics</h1>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={handleExportData} disabled>
              <Download className="h-4 w-4 mr-2"/> Export Data
            </Button>
            <Button variant={isEditMode ? "default" : "secondary"} onClick={() => setIsEditMode(!isEditMode)}>
              <LayoutGrid className="h-4 w-4 mr-2"/> {isEditMode ? 'Exit Edit Mode' : 'Customize Layout'}
            </Button>
          </div>
        </div>

        {isEditMode && renderEditModeControls()}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            {pageIsLoading ? <Skeleton className="h-64 w-full rounded-lg" /> : renderWidgets()}
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            {pageIsLoading ? <Skeleton className="h-96 w-full rounded-lg" /> : renderTimeSeriesWidget()}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pageIsLoading ? <Skeleton className="h-80 w-full rounded-lg" /> : renderContextWidget()}
              {renderWeekdayWidget()}
              {renderTimeOfDayWidget()}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            {pageIsLoading ? <Skeleton className="h-48 w-full rounded-lg" /> : renderInsightsWidget()}
            {renderDistractionsWidget()}
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Export Focus Data</CardTitle><CardDescription>Download your focus data for external analysis.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Select format and date range to export (functionality coming soon).</p>
                <Button onClick={handleExportData} disabled>
                  <Download className="h-4 w-4 mr-2" /> Download Data (Placeholder)
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default FocusStatsPage; 