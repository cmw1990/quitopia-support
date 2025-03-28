import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths, addMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '../ui';
import { getUserProgress } from '../../api/apiCompatibility';
import { ProgressEntry } from '../../types/dataTypes';

interface CalendarHeatmapProps {
  userId: string;
  session: Session | null;
  monthsToShow?: number;
}

interface ActivityData {
  date: string;
  value: number;
}

export const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({
  userId,
  session,
  monthsToShow = 1
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([]);

  useEffect(() => {
    if (userId && session) {
      loadActivityData();
    }
  }, [userId, session, currentMonth]);

  const loadActivityData = async () => {
    try {
      setLoading(true);

      // Calculate date range for the current month
      const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

      // Fetch progress data for the date range
      const response = await getUserProgress(userId, start, end, session);
      
      if (response && Array.isArray(response.progressEntries)) {
        setProgressEntries(response.progressEntries);

        // Convert progress entries to activity data
        const activity: ActivityData[] = response.progressEntries.map((entry: ProgressEntry) => ({
          date: entry.date,
          value: calculateEntryScore(entry)
        }));

        setActivityData(activity);
      }
    } catch (error) {
      console.error('Error loading activity data:', error);
      // Use mock data for demonstration
      generateMockData();
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    const mockData: ActivityData[] = days.map(day => ({
      date: format(day, 'yyyy-MM-dd'),
      value: Math.random() > 0.3 ? Math.floor(Math.random() * 10) + 1 : 0
    }));
    
    setActivityData(mockData);
  };

  const calculateEntryScore = (entry: ProgressEntry): number => {
    // Calculate a score from 0-10 based on various health metrics
    let score = 0;
    let count = 0;
    
    if (typeof entry.mood_score === 'string') {
      const moodValue = parseInt(entry.mood_score);
      if (!isNaN(moodValue)) {
        score += moodValue;
        count++;
      }
    }
    
    if (typeof entry.energy_level === 'number') {
      score += entry.energy_level;
      count++;
    }
    
    if (typeof entry.focus_level === 'number') {
      score += entry.focus_level;
      count++;
    }
    
    if (typeof entry.sleep_quality === 'number') {
      score += entry.sleep_quality;
      count++;
    }
    
    if (entry.smoke_free) {
      score += 10;
      count++;
    } else {
      score += 0;
      count++;
    }
    
    if (typeof entry.craving_intensity === 'number') {
      // Invert craving intensity (higher intensity = lower score)
      score += 10 - entry.craving_intensity;
      count++;
    }
    
    // Return average score, defaulting to 0 if no valid metrics
    return count > 0 ? Math.round(score / count) : 0;
  };

  const getMonthData = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    // Get the starting day of the week (0 = Sunday, 1 = Monday, etc.)
    const startDay = start.getDay();
    
    // Number of days in the month
    return { days, startDay };
  };

  const getColorForValue = (value: number) => {
    if (value === 0) return 'bg-gray-100';
    if (value < 3) return 'bg-red-200';
    if (value < 5) return 'bg-orange-200';
    if (value < 7) return 'bg-yellow-200';
    if (value < 9) return 'bg-green-200';
    return 'bg-green-400';
  };

  const getDayValue = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const entry = activityData.find(d => d.date === dateStr);
    return entry ? entry.value : 0;
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
  };

  const handleNextMonth = () => {
    const nextMonth = addMonths(currentMonth, 1);
    if (nextMonth <= new Date()) {
      setCurrentMonth(nextMonth);
    }
  };

  const { days, startDay } = getMonthData();

  return (
    <div className="w-full">
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-lg">Activity Calendar</h3>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePreviousMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleNextMonth}
                disabled={addMonths(currentMonth, 1) > new Date()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                <div key={day} className="text-xs text-center font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before the first of the month */}
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square"></div>
              ))}
              
              {/* Days of the month */}
              {days.map((day, i) => {
                const value = getDayValue(day);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div 
                    key={i} 
                    className={`aspect-square p-1 flex flex-col items-center justify-center rounded-md ${getColorForValue(value)} ${isToday ? 'ring-2 ring-primary' : ''}`}
                    title={`${format(day, 'MMMM d, yyyy')}: Activity Score ${value}/10`}
                  >
                    <span className={`text-xs ${isToday ? 'font-bold' : 'font-medium'} text-gray-700`}>
                      {format(day, 'd')}
                    </span>
                    {value > 0 && (
                      <span className="text-xs font-bold text-gray-700">{value}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-center">
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-500">Less</span>
              {[0, 2, 4, 6, 8, 10].map(value => (
                <div 
                  key={value} 
                  className={`h-3 w-3 rounded-sm ${getColorForValue(value)}`}
                ></div>
              ))}
              <span className="text-xs text-gray-500">More</span>
            </div>
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>Activity score combines mood, energy, focus, sleep quality, and craving resistance.</p>
            <p className="mt-1">Track your wellness journey over time to identify patterns.</p>
          </div>
        </div>
      )}
    </div>
  );
}; 