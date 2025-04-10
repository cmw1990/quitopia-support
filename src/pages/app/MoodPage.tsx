import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ui/use-toast';
import { supabaseRequest } from '@/utils/supabaseRequest';
import { MoodLog, MOOD_LABELS, ENERGY_LABELS } from '@/types/mood';
import { Smile, Zap, BarChartHorizontal, CalendarDays, Info, Loader2, MessageSquare, BrainCircuit, Lightbulb, AlertTriangle } from 'lucide-react'; // Icons for mood, energy, history etc.
import { formatDistanceToNowStrict, parseISO, format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import MoodEnergyChart from '@/components/mood/MoodEnergyChart';

const MoodPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [moodRating, setMoodRating] = useState<number>(3); // Default to Neutral
  const [energyRating, setEnergyRating] = useState<number>(5); // Default to Neutral/Medium (1-10 scale)
  const [notes, setNotes] = useState('');
  const [recentLogs, setRecentLogs] = useState<MoodLog[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Fetch recent logs
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.id) return;
      setIsLoadingHistory(true);
      try {
        const logData = await supabaseRequest<MoodLog[]>(
            'mood_logs',
            'GET',
            { 
              filters: { user_id: user.id }, 
              limit: 15,
              orderBy: { column: 'timestamp', ascending: false }
            }
        );
        setRecentLogs(logData || []);
      } catch (error: any) {
        console.error("Error fetching mood log history:", error);
        toast({ title: 'Error Loading History', description: error.message, variant: 'destructive' });
      } finally {
        setIsLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [user?.id, toast]);

  const handleSaveLog = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    const newLog: Omit<MoodLog, 'id'> = {
        user_id: user.id,
        timestamp: new Date().toISOString(),
        mood_rating: moodRating,
        energy_rating: energyRating,
        notes: notes.trim() || null,
    };

    try {
        const savedLog = await supabaseRequest<MoodLog>(
            'mood_logs', // Replace with your actual table name
            'POST',
            { data: newLog }
        );
        toast({ title: 'Log Saved', description: 'Your mood and energy have been recorded.' });
        // Add to recent logs list and reset form
        setRecentLogs(prev => [savedLog, ...prev].slice(0, 10)); // Limit displayed history
        setMoodRating(3);
        setEnergyRating(5);
        setNotes('');
    } catch (error: any) {
        console.error("Error saving mood log:", error);
        toast({ title: 'Error Saving Log', description: error.message, variant: 'destructive' });
    } finally {
        setIsSaving(false);
    }
  };

  // Function to get label from rating
  const getRatingLabel = (rating: number, type: 'mood' | 'energy'): string => {
    const labels = type === 'mood' ? MOOD_LABELS : ENERGY_LABELS;
    return labels[rating] || 'Unknown';
  };

  // Function to get color/emoji based on rating (optional enhancement)
  const getRatingIndicator = (rating: number, type: 'mood' | 'energy') => {
     // Simple color example
     const colors = [
         'text-red-500', // 1
         'text-orange-500', // 2
         'text-gray-500', // 3
         'text-blue-500', // 4
         'text-green-500' // 5
     ];
     return <span className={`font-bold ${colors[rating-1] || 'text-gray-500'}`}>{rating}</span>;
     // Or return an emoji based on rating
  };

  // Animation variants
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } };

  // Loading Skeleton for History
  const renderHistorySkeleton = () => (
     <div className="space-y-4 animate-pulse"><Skeleton className="h-16 rounded-lg"/><Skeleton className="h-20 rounded-lg"/><Skeleton className="h-16 rounded-lg"/></div>
  );

  return (
    <motion.div 
        className="space-y-6 md:space-y-8 p-4 md:p-6 lg:p-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
    >
      <motion.div variants={itemVariants} className="space-y-1"><h1 className="text-2xl md:text-3xl font-bold tracking-tight">Mood & Energy Log</h1><p className="text-muted-foreground">Track patterns to optimize your focus and well-being.</p></motion.div>

      {/* Logging Card - Enhanced */}
      <motion.div variants={itemVariants}>
          <Card className="border shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30"><CardTitle>How are you feeling right now?</CardTitle></CardHeader>
              <CardContent className="p-6 space-y-8">
                   <div className="space-y-3">
                       <Label htmlFor="moodRating" className="flex justify-between items-center text-base font-medium">
                           <span className="flex items-center gap-2"><Smile size={18}/> Mood</span>
                           <span className="text-sm font-semibold px-2 py-1 rounded-md bg-background border">{getRatingLabel(moodRating, 'mood')}</span>
                       </Label>
                       <Slider 
                          id="moodRating" 
                          min={1} max={5} step={1} 
                          value={[moodRating]} 
                          onValueChange={(v) => setMoodRating(v[0])} 
                          disabled={isSaving} 
                          className="cursor-pointer h-3 [&>span:first-child]:h-3 [&>span:first-child>span]:h-5 [&>span:first-child>span]:w-5"
                       />
                       <div className="flex justify-between text-xs text-muted-foreground px-1">
                           <span>Very Poor</span><span>Poor</span><span>Neutral</span><span>Good</span><span>Very Good</span>
                       </div>
                   </div>
                   
                   <div className="space-y-3">
                       <Label htmlFor="energyRating" className="flex justify-between items-center text-base font-medium">
                           <span className="flex items-center gap-2"><Zap size={18}/> Energy Level</span>
                           <span className="text-sm font-semibold px-2 py-1 rounded-md bg-background border">{energyRating}/10 <span className="text-xs font-normal text-muted-foreground">({getRatingLabel(energyRating, 'energy')})</span></span>
                       </Label>
                       <Slider 
                           id="energyRating" 
                           min={1} max={10} step={1} 
                           value={[energyRating]} 
                           onValueChange={(v) => setEnergyRating(v[0])} 
                           disabled={isSaving} 
                           className="cursor-pointer h-3 [&>span:first-child]:h-3 [&>span:first-child>span]:h-5 [&>span:first-child>span]:w-5"
                       />
                       <div className="flex justify-between text-xs text-muted-foreground px-1">
                           <span>Exhausted</span><span className="hidden sm:inline">Low</span><span>Medium</span><span className="hidden sm:inline">High</span><span>Energized</span>
                       </div>
                   </div>
                   
                   <div className="space-y-2 pt-2">
                       <Label htmlFor="notes" className="text-base font-medium">Notes (Optional)</Label>
                       <Textarea 
                          id="notes" 
                          placeholder="Add context (e.g., after exercise, project deadline...)" 
                          value={notes} 
                          onChange={(e) => setNotes(e.target.value)} 
                          disabled={isSaving} 
                          rows={3} 
                          className="text-sm"
                       />
                   </div>
              </CardContent>
              <CardFooter className="bg-muted/30 border-t pt-4 pb-4">
                  <Button onClick={handleSaveLog} disabled={isSaving} className="w-full sm:w-auto">
                      {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving...</> : <><MessageSquare size={16} className="mr-2"/> Log Current State</>}
                  </Button>
              </CardFooter>
          </Card>
      </motion.div>

       {/* Mood & Energy Chart - Added */}
       <motion.div variants={itemVariants}>
           <MoodEnergyChart data={recentLogs} />
       </motion.div>

       {/* Recent Logs History - Enhanced */}
       <motion.div variants={itemVariants}>
           <Card className="border shadow-sm">
               <CardHeader>
                   <CardTitle className="text-lg flex items-center gap-2">
                       <CalendarDays size={18} /> Recent Logs
                   </CardTitle>
                   <CardDescription>Your last few mood and energy entries.</CardDescription>
               </CardHeader>
               <CardContent>
                   {isLoadingHistory ? (
                       renderHistorySkeleton()
                   ) : recentLogs.length === 0 ? (
                       <p className="text-muted-foreground text-center py-10">No logs recorded yet.</p>
                   ) : (
                       <ScrollArea className="h-[350px]">
                           <TooltipProvider delayDuration={150}>
                               <ul className="space-y-3 pr-3">
                                   {recentLogs.map((log) => (
                                       <li key={log.id} className="rounded-lg border bg-background p-4 space-y-3">
                                           <div className="flex justify-between items-start text-xs">
                                               <Tooltip>
                                                   <TooltipTrigger asChild>
                                                       <span className="cursor-default text-muted-foreground">
                                                           {formatDistanceToNowStrict(parseISO(log.timestamp as string), { addSuffix: true })}
                                                       </span>
                                                   </TooltipTrigger>
                                                   <TooltipContent>
                                                       {format(parseISO(log.timestamp as string), 'PPP p')}
                                                   </TooltipContent>
                                               </Tooltip>
                                               <div className="flex flex-col sm:flex-row gap-x-4 gap-y-1 text-right text-sm">
                                                   <span className="flex items-center justify-end gap-1.5">
                                                       <Smile size={14} className="text-muted-foreground"/> 
                                                       <span className="font-medium">{getRatingLabel(log.mood_rating, 'mood')}</span>
                                                       <span className="text-muted-foreground">({log.mood_rating})</span>
                                                   </span>
                                                   <span className="flex items-center justify-end gap-1.5">
                                                       <Zap size={14} className="text-muted-foreground"/> 
                                                       <span className="font-medium">{getRatingLabel(log.energy_rating, 'energy')}</span>
                                                       <span className="text-muted-foreground">({log.energy_rating}/10)</span>
                                                   </span>
                                               </div>
                                           </div>
                                           {log.notes && (
                                               <div className="text-sm text-foreground pt-3 border-t border-dashed">
                                                   <p className="whitespace-pre-wrap break-words">{log.notes}</p> 
                                               </div>
                                           )}
                                       </li>
                                   ))}
                               </ul>
                           </TooltipProvider>
                       </ScrollArea>
                   )}
               </CardContent>
           </Card>
       </motion.div>

       {/* Analysis & Insights Placeholder Card */}
       <motion.div variants={itemVariants}>
         <Card className="border border-dashed border-blue-500/50 bg-blue-500/5 dark:bg-blue-500/10">
           <CardHeader>
             <CardTitle className="text-lg flex items-center gap-2 text-blue-700 dark:text-blue-400">
               <BrainCircuit size={18} /> Analysis & Insights
             </CardTitle>
             <CardDescription className="text-blue-600 dark:text-blue-400/80">
               Coming soon: Discover patterns and recommendations based on your logs.
             </CardDescription>
           </CardHeader>
           <CardContent className="space-y-4 text-sm">
             <div className="flex items-start gap-3 p-3 rounded-md bg-background/50">
               <Lightbulb size={16} className="mt-1 text-yellow-600 dark:text-yellow-400" />
               <div>
                 <p className="font-medium">Optimal Focus Windows</p>
                 <p className="text-muted-foreground text-xs">Identify the times of day when your mood and energy levels typically support focused work.</p>
               </div>
             </div>
             <div className="flex items-start gap-3 p-3 rounded-md bg-background/50">
               <AlertTriangle size={16} className="mt-1 text-orange-600 dark:text-orange-400" />
               <div>
                 <p className="font-medium">Intervention Suggestions</p>
                 <p className="text-muted-foreground text-xs">Get personalized suggestions (like taking a break or a specific focus strategy) based on low mood/energy patterns.</p>
               </div>
             </div>
              <div className="flex items-start gap-3 p-3 rounded-md bg-background/50">
                <Info size={16} className="mt-1 text-purple-600 dark:text-purple-400" />
                <div>
                  <p className="font-medium">Focus Correlation</p>
                  <p className="text-muted-foreground text-xs">See how your mood and energy levels correlate with your focus session ratings over time.</p>
                </div>
              </div>
           </CardContent>
           <CardFooter className="text-xs text-blue-600 dark:text-blue-400/80">
              Keep logging consistently to enable these insights!
           </CardFooter>
         </Card>
       </motion.div>

    </motion.div>
  );
};

export default MoodPage; 