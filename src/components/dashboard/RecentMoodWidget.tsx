import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Smile, Zap, CalendarDays, Info } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { supabaseRequest } from '@/utils/supabaseRequest';
import { MoodLog, MOOD_LABELS, ENERGY_LABELS } from '@/types/mood'; // Import shared type
import { formatDistanceToNowStrict, parseISO } from 'date-fns';

export const RecentMoodWidget: React.FC = () => {
    const { user } = useAuth();
    const [latestLog, setLatestLog] = useState<MoodLog | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLatestMoodLog = async () => {
            if (!user?.id) return;
            setIsLoading(true);
            setError(null);
            try {
                const data = await supabaseRequest<MoodLog[]>(
                    'mood_logs',
                    'GET',
                    {
                        filters: { user_id: user.id },
                        orderBy: { column: 'timestamp', ascending: false }, // Fetch latest first
                        limit: 1
                    }
                );
                setLatestLog(data?.[0] || null);
            } catch (err: any) {
                console.error("Error fetching latest mood log:", err);
                setError(err.message || 'Failed to load mood data.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchLatestMoodLog();
    }, [user?.id]);

    const getRatingLabel = (rating: number, type: 'mood' | 'energy'): string => {
        const labels = type === 'mood' ? MOOD_LABELS : ENERGY_LABELS;
        return labels[rating] || rating.toString();
    };

    return (
        <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base font-medium flex items-center gap-2"><Smile size={18} className="text-yellow-500"/> Recent Mood</CardTitle></CardHeader>
            <CardContent className="pt-4">{isLoading ? (<div className="space-y-3"><Skeleton className="h-6 w-3/4"/><Skeleton className="h-4 w-1/2"/></div>) : error ? (<p className="text-xs text-destructive"><Info size={14} className="inline mr-1"/>{error}</p>) : latestLog ? (<div className="space-y-2"><div className="flex justify-between items-center"><span className="flex items-center gap-1.5 text-sm font-medium"><Smile size={15}/> Mood: {latestLog.mood_rating} ({getRatingLabel(latestLog.mood_rating, 'mood')})</span><span className="flex items-center gap-1.5 text-sm font-medium"><Zap size={15}/> Energy: {latestLog.energy_rating} ({getRatingLabel(latestLog.energy_rating, 'energy')})</span></div><p className="text-xs text-muted-foreground flex items-center gap-1"><CalendarDays size={12}/>{formatDistanceToNowStrict(parseISO(latestLog.timestamp as string), { addSuffix: true })}</p>{latestLog.notes && <p className="text-xs text-muted-foreground border-t pt-2 mt-2 italic">&ldquo;{latestLog.notes}&rdquo;</p>}</div>) : (<p className="text-sm text-muted-foreground">(No mood logs found)</p>)}</CardContent>
        </Card>
    );
}; 