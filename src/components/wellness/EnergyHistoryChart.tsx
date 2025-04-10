import React, { useState, useEffect, useMemo } from 'react';
import { apiGet } from '@/lib/apiClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO, subDays } from 'date-fns';
import { AlertCircle, TrendingUp } from 'lucide-react';

interface EnergyLog {
    id: string;
    user_id: string;
    created_at: string;
    value: number;
    notes?: string | null;
    metric_type: 'energy';
}

interface ProcessedEnergyLog {
    date: string;
    level: number;
    timestamp: string;
    notes?: string | null;
}

interface EnergyHistoryChartProps {
    userId: string | undefined;
    timeRangeDays?: number;
    updateTrigger?: string | number;
}

export const EnergyHistoryChart: React.FC<EnergyHistoryChartProps> = ({ 
    userId, 
    timeRangeDays = 7, 
    updateTrigger 
}) => {
    const [energyLogs, setEnergyLogs] = useState<EnergyLog[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEnergyLogs = async () => {
            if (!userId) {
                console.warn("EnergyHistoryChart: No userId provided.");
                setError("User ID not available to fetch energy history.");
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);
            try {
                const endDate = new Date();
                const startDate = subDays(endDate, timeRangeDays);
                console.log(`EnergyHistoryChart: Fetching logs via API from ${startDate.toISOString()} to ${endDate.toISOString()} for user ${userId}`);

                const logs = await apiGet<EnergyLog[]>('/rest/v1/focus_moods', {
                    params: {
                        select: 'id,user_id,created_at,value,notes,metric_type',
                        user_id: `eq.${userId}`,
                        metric_type: 'eq.energy',
                        created_at: `gte.${startDate.toISOString()}`,
                        order: 'created_at.asc',
                        limit: '1000'
                    }
                });

                setEnergyLogs(Array.isArray(logs) ? logs : []);
                console.debug(`EnergyHistoryChart: Fetched ${logs.length} logs via API.`);
            } catch (err: any) {
                console.error('EnergyHistoryChart: Error fetching energy logs via API:', err);
                setError(err.message || 'Failed to load energy history.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchEnergyLogs();
    }, [userId, timeRangeDays, updateTrigger]);

    const processedData = useMemo((): ProcessedEnergyLog[] => {
        if (!energyLogs || energyLogs.length === 0) {
            return [];
        }
        return energyLogs.map(log => ({
            date: format(parseISO(log.created_at), 'MMM d, HH:mm'),
            level: log.value,
            timestamp: log.created_at,
            notes: log.notes
        }));
    }, [energyLogs]);

    const formatDateTick = (tickItem: string) => {
        try {
            return format(parseISO(tickItem.split(',')[0]), 'MMM d');
        } catch {
            return tickItem;
        }
    };
    
     const formatTooltipLabel = (label: string) => {
         try {
             return format(parseISO(label.split(',')[0]), 'MMM d, yyyy HH:mm');
         } catch {
             return label;
         }
     };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                         <span>Energy History (Last {timeRangeDays} Days)</span>
                    </CardTitle>
                    <CardDescription>Loading energy trends...</CardDescription>
                </CardHeader>
                <CardContent>
                    <Skeleton className="w-full h-[300px]" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Loading Energy History</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    if (processedData.length === 0) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        <span>Energy History (Last {timeRangeDays} Days)</span>
                    </CardTitle>
                    <CardDescription>Track your energy levels over time.</CardDescription>
                 </CardHeader>
                 <CardContent>
                    <div className="flex items-center justify-center h-[300px]">
                        <p className="text-muted-foreground">
                            No energy logs found for the last {timeRangeDays} days.
                        </p>
                    </div>
                 </CardContent>
             </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                     <TrendingUp className="h-5 w-5" />
                     <span>Energy History (Last {timeRangeDays} Days)</span>
                 </CardTitle>
                 <CardDescription>Visualize your logged energy levels (1-10).</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={processedData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="date"
                             tick={{ fontSize: 10 }}
                        />
                        <YAxis domain={[0, 10]} allowDecimals={false} />
                        <Tooltip 
                             formatter={(value: number, name: string, props: any) => {
                                 try {
                                     return [
                                         `${value}/10 ${props.payload.notes ? `(${props.payload.notes})` : ''}`,
                                         `Energy Level at ${format(parseISO(props.payload.timestamp), 'HH:mm')}`
                                     ];
                                 } catch (error) {
                                     console.error("Error formatting tooltip:", error);
                                     return [`${value}/10`, "Energy Level"];
                                 }
                             }}
                              labelFormatter={(label) => {
                                 try {
                                     return format(parseISO(label.split(',')[0]), 'MMM d, yyyy');
                                 } catch (error) {
                                     return label;
                                 }
                              }}
                        />
                        <Legend />
                        <Line 
                            type="monotone" 
                            dataKey="level"
                            name="Energy Level"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}; 