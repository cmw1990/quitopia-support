import React, { useState, useEffect, useRef } from 'react';
import { Session } from '@supabase/supabase-js';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Button,
  Label,
  Textarea,
  Slider,
  Progress,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui';
import { Smile, Frown, Meh, Calendar, PlusCircle, Save, HelpCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  MoodLog, 
  getMoodLogs, 
  addMoodLog, 
  supabaseRestCall 
} from '../../api/apiCompatibility';
import { format, startOfDay, endOfDay, subDays, addDays, isToday } from 'date-fns';
import { toast } from 'sonner';
import { hapticFeedback } from '@/utils/hapticFeedback';
import { useSwipeable } from 'react-swipeable';

// Define mood options with standard values
const moodOptions = [
  { value: 1, label: 'Very Negative', icon: Frown, color: 'text-red-500' },
  { value: 2, label: 'Negative', icon: Frown, color: 'text-orange-500' },
  { value: 3, label: 'Neutral', icon: Meh, color: 'text-yellow-500' },
  { value: 4, label: 'Positive', icon: Smile, color: 'text-lime-500' },
  { value: 5, label: 'Very Positive', icon: Smile, color: 'text-green-500' }
];

// Define mood triggers for categorization
const commonTriggers = [
  'Stress', 'Work/School', 'Family', 'Friends', 'Relationships',
  'Physical Health', 'Sleep', 'Exercise', 'Weather', 'Food/Diet',
  'Medications', 'Substance Use', 'Finances', 'News/Media', 'Accomplishment',
  'Cravings', 'Smoking/Vaping', 'Social Event', 'Alone Time', 'Other'
];

interface MoodTrackerProps {
  session: Session | null;
  className?: string;
  userId?: string;
  onMoodUpdate?: (moodData: MoodLog) => void;
  onLogsLoaded?: (logs: MoodLog[]) => void;
  compact?: boolean;
}

export function MoodTracker({ 
  session, 
  className = '', 
  userId,
  onMoodUpdate,
  onLogsLoaded,
  compact = false
}: MoodTrackerProps) {
  // State
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [currentMood, setCurrentMood] = useState<number>(3); // Default to neutral
  const [notes, setNotes] = useState<string>('');
  const [triggers, setTriggers] = useState<string[]>([]);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);
  const [triggerInput, setTriggerInput] = useState<string>('');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'day' | 'week' | 'month'>('day');
  
  // Refs
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Effect to load mood logs
  useEffect(() => {
    if (session?.user?.id || userId) {
      loadMoodLogs();
    } else {
      setLoading(false);
    }
  }, [session, userId, currentDate, selectedTimeframe]);
  
  // Swipe handlers for mobile gesture support
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      handleNextDay();
      hapticFeedback.light();
    },
    onSwipedRight: () => {
      handlePreviousDay();
      hapticFeedback.light();
    },
    preventScrollOnSwipe: true,
    trackMouse: false
  });
  
  // Load mood logs from the API
  const loadMoodLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userIdToUse = userId || session?.user?.id;
      if (!userIdToUse) {
        setError('No user ID available');
        return;
      }
      
      // Calculate date range based on selected timeframe
      let startDate: Date;
      let endDate: Date = endOfDay(currentDate);
      
      if (selectedTimeframe === 'day') {
        startDate = startOfDay(currentDate);
      } else if (selectedTimeframe === 'week') {
        startDate = startOfDay(subDays(currentDate, 7));
      } else {
        startDate = startOfDay(subDays(currentDate, 30));
      }
      
      // Format dates for API call
      const startDateString = startDate.toISOString();
      const endDateString = endDate.toISOString();
      
      // Fetch mood logs from API
      const logs = await getMoodLogs(
        userIdToUse,
        startDateString,
        endDateString,
        session
      );
      
      if (logs && Array.isArray(logs)) {
        // Sort logs by timestamp (newest first)
        const sortedLogs = [...logs].sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        setMoodLogs(sortedLogs);
        
        // If callback provided, call it with the loaded logs
        if (onLogsLoaded) {
          onLogsLoaded(sortedLogs);
        }
        
        // If today, check if a mood has already been logged
        if (isToday(currentDate) && sortedLogs.length > 0) {
          const todayLog = sortedLogs.find(log => isToday(new Date(log.timestamp)));
          if (todayLog) {
            setCurrentMood(todayLog.mood_score || 3);
            setNotes(todayLog.notes || '');
            setTriggers(todayLog.triggers || []);
          }
        }
      } else {
        setMoodLogs([]);
      }
    } catch (error) {
      console.error('Error loading mood logs:', error);
      setError('Failed to load mood data');
      toast.error('Failed to load mood data');
    } finally {
      setLoading(false);
    }
  };
  
  // Submit mood log to the API
  const handleSubmitMood = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      const userIdToUse = userId || session?.user?.id;
      if (!userIdToUse) {
        setError('No user ID available');
        toast.error('You must be logged in to log your mood');
        return;
      }
      
      const timestamp = new Date().toISOString();
      
      const moodData: Omit<MoodLog, 'id' | 'created_at'> = {
        user_id: userIdToUse,
        timestamp,
        mood_score: currentMood,
        notes: notes,
        triggers: triggers
      };
      
      // Use the REST API to add the mood log
      const endpoint = `/rest/v1/mood_logs`;
      const result = await supabaseRestCall(
        endpoint,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(moodData)
        },
        session
      );
      
      if (result) {
        // Add the new log to state
        const newLog: MoodLog = {
          ...moodData,
          id: result.id || crypto.randomUUID(),
          created_at: timestamp
        };
        
        setMoodLogs(prev => [newLog, ...prev]);
        
        // Provide haptic feedback on success
        hapticFeedback.success();
        toast.success('Mood logged successfully!');
        
        // Reset form
        setShowAddForm(false);
        setNotes('');
        setTriggers([]);
        
        // Call the callback if provided
        if (onMoodUpdate) {
          onMoodUpdate(newLog);
        }
      } else {
        throw new Error('Failed to add mood log');
      }
    } catch (error) {
      console.error('Error submitting mood log:', error);
      setError('Failed to submit mood log');
      toast.error('Failed to submit mood log');
      hapticFeedback.error();
    } finally {
      setSubmitting(false);
    }
  };
  
  // Helper function to get mood icon and color
  const getMoodIcon = (moodScore: number) => {
    const option = moodOptions.find(opt => opt.value === moodScore) || moodOptions[2]; // Default to neutral
    const IconComponent = option.icon;
    return <IconComponent className={`h-6 w-6 ${option.color}`} />;
  };
  
  // Helper function to get mood label
  const getMoodLabel = (moodScore: number) => {
    return moodOptions.find(opt => opt.value === moodScore)?.label || 'Neutral';
  };
  
  // Navigation functions
  const handlePreviousDay = () => {
    setCurrentDate(prev => subDays(prev, 1));
  };
  
  const handleNextDay = () => {
    const tomorrow = addDays(currentDate, 1);
    if (tomorrow <= new Date()) {
      setCurrentDate(tomorrow);
    }
  };
  
  // Handle trigger selection
  const handleTriggerSelect = (trigger: string) => {
    if (triggers.includes(trigger)) {
      setTriggers(prev => prev.filter(t => t !== trigger));
    } else {
      setTriggers(prev => [...prev, trigger]);
    }
    
    // Provide haptic feedback
    hapticFeedback.light();
  };
  
  // Handle custom trigger input
  const handleAddCustomTrigger = () => {
    if (triggerInput && !triggers.includes(triggerInput)) {
      setTriggers(prev => [...prev, triggerInput]);
      setTriggerInput('');
      hapticFeedback.light();
    }
  };
  
  // Calculate average mood for selected timeframe
  const averageMood = React.useMemo(() => {
    if (moodLogs.length === 0) return 0;
    
    const sum = moodLogs.reduce((acc, log) => acc + (log.mood_score || 0), 0);
    return Math.round((sum / moodLogs.length) * 10) / 10; // Round to 1 decimal place
  }, [moodLogs]);
  
  // Get most common triggers
  const commonMoodTriggers = React.useMemo(() => {
    if (moodLogs.length === 0) return [];
    
    const triggerCounts: Record<string, number> = {};
    
    moodLogs.forEach(log => {
      (log.triggers || []).forEach(trigger => {
        triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
      });
    });
    
    // Sort by count and take top 3
    return Object.entries(triggerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([trigger]) => trigger);
  }, [moodLogs]);
  
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="space-y-0 pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Mood Tracker</CardTitle>
          {!compact && (
            <div className="flex items-center space-x-2">
              <Select
                value={selectedTimeframe}
                onValueChange={(value) => setSelectedTimeframe(value as 'day' | 'week' | 'month')}
              >
                <SelectTrigger className="w-[120px] h-8">
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        {!compact && (
          <CardDescription>
            Track your mood changes over time
          </CardDescription>
        )}
      </CardHeader>
      
      <div 
        ref={contentRef}
        {...swipeHandlers}
        className="relative"
      >
        <CardContent className="pt-2">
          {loading ? (
            <div className="flex flex-col items-center py-8">
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-sm text-muted-foreground mt-2">Loading mood data...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-8 text-center">
              <HelpCircle className="h-8 w-8 text-red-500 mb-2" />
              <p className="text-sm text-red-500">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={loadMoodLogs}
              >
                Try Again
              </Button>
            </div>
          ) : showAddForm ? (
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="mood-slider">How are you feeling?</Label>
                    <div className="flex justify-between items-center mb-2">
                      <Frown className="h-6 w-6 text-red-500" />
                      <Slider
                        id="mood-slider"
                        min={1}
                        max={5}
                        step={1}
                        value={[currentMood]}
                        onValueChange={(value) => {
                          setCurrentMood(value[0]);
                          hapticFeedback.selection();
                        }}
                        className="mx-4"
                      />
                      <Smile className="h-6 w-6 text-green-500" />
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-medium">{getMoodLabel(currentMood)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="triggers">What factors influenced your mood?</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {commonTriggers.slice(0, compact ? 10 : 15).map(trigger => (
                        <Button
                          key={trigger}
                          type="button"
                          size="sm"
                          variant={triggers.includes(trigger) ? "default" : "outline"}
                          className="text-xs h-7 rounded-full"
                          onClick={() => handleTriggerSelect(trigger)}
                        >
                          {trigger}
                        </Button>
                      ))}
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-2">
                      <input
                        type="text"
                        value={triggerInput}
                        onChange={(e) => setTriggerInput(e.target.value)}
                        placeholder="Add custom trigger..."
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomTrigger();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleAddCustomTrigger}
                        disabled={!triggerInput}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any additional thoughts..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddForm(false);
                        hapticFeedback.light();
                      }}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmitMood}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <div className="h-4 w-4 mr-2 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Mood
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePreviousDay}
                  className="h-8 w-8 p-0"
                >
                  <span className="sr-only">Previous day</span>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {format(currentDate, selectedTimeframe === 'day' ? 'EEEE, MMMM d' : 'MMM d') +
                     (selectedTimeframe !== 'day' 
                      ? ` - ${format(
                          selectedTimeframe === 'week' 
                            ? addDays(currentDate, 6)
                            : addDays(currentDate, 29),
                          'MMM d'
                        )}`
                      : ''
                     )}
                  </span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNextDay}
                  disabled={addDays(currentDate, 1) > new Date()}
                  className="h-8 w-8 p-0"
                >
                  <span className="sr-only">Next day</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              
              {!moodLogs.length ? (
                <div className="text-center py-6">
                  <Meh className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-medium">No mood entries yet</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    {selectedTimeframe === 'day'
                      ? "Track your mood for this day"
                      : selectedTimeframe === 'week'
                      ? "Track your mood for the past week"
                      : "Track your mood for the past month"}
                  </p>
                  {isToday(currentDate) && (
                    <Button
                      onClick={() => {
                        setShowAddForm(true);
                        hapticFeedback.light();
                      }}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Entry
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedTimeframe !== 'day' && (
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Average Mood</span>
                        <span className="text-sm">{averageMood}</span>
                      </div>
                      <Progress value={averageMood * 20} className="h-2" />
                      
                      {commonMoodTriggers.length > 0 && (
                        <div className="mt-4">
                          <span className="text-sm font-medium">Common Triggers</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {commonMoodTriggers.map(trigger => (
                              <span 
                                key={trigger}
                                className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                              >
                                {trigger}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {selectedTimeframe === 'day' && moodLogs.length > 0 ? (
                      <div className="border rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            {getMoodIcon(moodLogs[0].mood_score || 3)}
                            <span className="ml-2 font-medium">
                              {getMoodLabel(moodLogs[0].mood_score || 3)}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(moodLogs[0].timestamp), 'h:mm a')}
                          </span>
                        </div>
                        
                        {moodLogs[0].triggers && moodLogs[0].triggers.length > 0 && (
                          <div className="flex flex-wrap gap-1 my-2">
                            {moodLogs[0].triggers.map(trigger => (
                              <span 
                                key={trigger}
                                className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                              >
                                {trigger}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {moodLogs[0].notes && (
                          <p className="text-sm mt-2">{moodLogs[0].notes}</p>
                        )}
                      </div>
                    ) : (
                      moodLogs.slice(0, 3).map(log => (
                        <div key={log.id} className="border rounded-lg p-3">
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center">
                              {getMoodIcon(log.mood_score || 3)}
                              <span className="ml-2 font-medium">
                                {getMoodLabel(log.mood_score || 3)}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(log.timestamp), selectedTimeframe === 'month' ? 'MMM d' : 'EEE, h:mm a')}
                            </span>
                          </div>
                          
                          {log.triggers && log.triggers.length > 0 && (
                            <div className="flex flex-wrap gap-1 my-1">
                              {log.triggers.slice(0, 3).map(trigger => (
                                <span 
                                  key={trigger}
                                  className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                >
                                  {trigger}
                                </span>
                              ))}
                              {log.triggers.length > 3 && (
                                <span className="text-xs text-muted-foreground">
                                  +{log.triggers.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                          
                          {log.notes && (
                            <p className="text-sm mt-1 line-clamp-2">{log.notes}</p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  
                  {isToday(currentDate) && selectedTimeframe === 'day' && (
                    <div className="mt-4 flex justify-center">
                      {moodLogs.some(log => isToday(new Date(log.timestamp))) ? (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowAddForm(true);
                            hapticFeedback.light();
                          }}
                        >
                          Update Today's Mood
                        </Button>
                      ) : (
                        <Button
                          onClick={() => {
                            setShowAddForm(true);
                            hapticFeedback.light();
                          }}
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add Entry
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
} 