import React, { useState, useEffect, useMemo } from 'react';
import { apiGet } from '@/lib/apiClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart } from 'recharts';
import { format, parseISO, subDays, differenceInMinutes } from 'date-fns';
import { AlertCircle, Moon } from 'lucide-react';

interface SleepLog {
    id: string;
    user_id: string;
    created_at: string;
    start_time: string;
    end_time: string;
    quality_rating?: number | null;
    notes?: string | null;
}

interface ProcessedSleepLog {
    date: string;
    durationHours: number;
    quality?: number | null;
    sleepStart: string;
    sleepEnd: string;
    notes?: string | null;
}

interface SleepHistoryChartProps {
    userId: string | undefined;
    timeRangeDays?: number;
    updateTrigger?: string | number;
}

const qualityMap: { [key: number]: string } = {
    1: 'Very Poor',
    2: 'Poor',
    3: 'Okay',
    4: 'Good',
    5: 'Excellent'
};

export const SleepHistoryChart: React.FC<SleepHistoryChartProps> = ({ 
    userId, 
    timeRangeDays = 7, 
    updateTrigger 
}) => {
    const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSleepLogs = async () => {
            if (!userId) {
                console.warn("SleepHistoryChart: No userId provided.");
                setError("User ID not available to fetch sleep history.");
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);
            try {
                const endDate = new Date();
                const startDate = subDays(endDate, timeRangeDays);
                console.log(`SleepHistoryChart: Fetching logs via API from ${startDate.toISOString()} to ${endDate.toISOString()} for user ${userId}`);
                
                const logs = await apiGet<SleepLog[]>('/rest/v1/sleep_logs', {
                    params: {
                        select: 'id,user_id,start_time,end_time,quality_rating,notes',
                        user_id: `eq.${userId}`,
                        end_time: `gte.${startDate.toISOString()}`,
                        order: 'end_time.asc',
                        limit: '100'
                    }
                });

                setSleepLogs(Array.isArray(logs) ? logs : []);
                console.debug(`SleepHistoryChart: Fetched ${logs.length} logs via API.`);
            } catch (err: any) {
                console.error('SleepHistoryChart: Error fetching sleep logs via API:', err);
                setError(err.message || 'Failed to load sleep history.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSleepLogs();
    }, [userId, timeRangeDays, updateTrigger]);

    const processedData = useMemo((): ProcessedSleepLog[] => {
        if (!sleepLogs || sleepLogs.length === 0) return [];
        
        return sleepLogs.map(log => {
            let durationMinutes = 0;
            try {
                durationMinutes = differenceInMinutes(parseISO(log.end_time), parseISO(log.start_time));
            } catch (e) {
                console.error("Error parsing sleep log times:", e, log);
            }
            
            return {
                date: format(parseISO(log.end_time), 'MMM d'),
                durationHours: parseFloat((durationMinutes / 60).toFixed(1)),
                quality: log.quality_rating,
                sleepStart: log.start_time,
                sleepEnd: log.end_time,
                notes: log.notes
            };
        });
    }, [sleepLogs]);

    const formatQualityTooltip = (value: number | null | undefined) => {
         if (value === null || value === undefined) return 'Not rated';
         return `${qualityMap[value]} (${value}/5)`;
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Moon className="h-5 w-5" />
                         <span>Sleep History (Last {timeRangeDays} Days)</span>
                    </CardTitle>
                     <CardDescription>Loading sleep patterns...</CardDescription>
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
                <AlertTitle>Error Loading Sleep History</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    if (processedData.length === 0) {
        return (
             <Card>
                <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                         <Moon className="h-5 w-5" />
                         <span>Sleep History (Last {timeRangeDays} Days)</span>
                     </CardTitle>
                     <CardDescription>Track your sleep duration and quality.</CardDescription>
                 </CardHeader>
                 <CardContent>
                    <div className="flex items-center justify-center h-[300px]">
                        <p className="text-muted-foreground">
                            No sleep logs found for the last {timeRangeDays} days.
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
                     <Moon className="h-5 w-5" />
                     <span>Sleep History (Last {timeRangeDays} Days)</span>
                 </CardTitle>
                 <CardDescription>Visualize sleep duration (hours) and quality (1-5).</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={processedData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="date"
                            tick={{ fontSize: 10 }}
                        />
                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" domain={[0, 5]} allowDecimals={false} label={{ value: 'Quality', angle: 90, position: 'insideRight' }} />
                        <Tooltip 
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    try {
                                        const entry = payload[0].payload as ProcessedSleepLog;
                                        return (
                                            <div className="bg-background border p-2 rounded shadow-lg text-sm">
                                                <p className="font-bold">{label}</p>
                                                {payload.map((pld) => {
                                                    const qualityValue = pld.dataKey === 'quality' ? Number(pld.value) : null;
                                                    const formattedQuality = pld.dataKey === 'quality' 
                                                        ? formatQualityTooltip(isNaN(qualityValue as number) ? undefined : qualityValue)
                                                        : `${pld.value} hours`;
                                                        
                                                    return (
                                                        <p key={pld.dataKey} style={{ color: pld.color }}>
                                                            {`${pld.name}: ${formattedQuality}`}
                                                        </p>
                                                    );
                                                })}
                                                <p className="text-muted-foreground text-xs mt-1">
                                                    {`${format(parseISO(entry.sleepStart), 'HH:mm')} - ${format(parseISO(entry.sleepEnd), 'HH:mm')}`}
                                                </p>
                                                {entry.notes && <p className="text-muted-foreground text-xs mt-1">Notes: {entry.notes}</p>}
                                            </div>
                                        );
                                    } catch (error) {
                                        console.error("Error rendering sleep chart tooltip:", error);
                                        return (
                                            <div className="bg-background border p-2 rounded shadow-lg text-sm">
                                                <p className="font-bold">{label}</p>
                                                {payload.map((pld) => (
                                                    <p key={pld.dataKey} style={{ color: pld.color }}>
                                                        {`${pld.name}: ${pld.value}`}
                                                    </p>
                                                ))}
                                            </div>
                                        );
                                    }
                                }
                                return null;
                            }}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="durationHours" name="Sleep Duration" fill="#8884d8" />
                        <Line yAxisId="right" type="monotone" dataKey="quality" name="Sleep Quality" stroke="#82ca9d" />
                    </ComposedChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}; 