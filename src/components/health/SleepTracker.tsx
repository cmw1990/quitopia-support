import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { format, addDays, subDays, parseISO } from 'date-fns';
import { 
  Moon, 
  Calendar, 
  Clock, 
  PlusCircle, 
  AlarmClock,
  BellRing,
  Bed,
  Moon as MoonIcon
} from 'lucide-react';
import { Button, Progress } from '../ui';

interface SleepTrackerProps {
  userId?: string;
  session: Session | null;
  compact?: boolean;
}

interface SleepEntry {
  date: string;
  quality: number; // 1-10
  duration: number; // in hours
  bedtime?: string; // e.g. "22:30"
  wakeTime?: string; // e.g. "07:15"
  disturbances?: number;
  notes?: string;
}

export const SleepTracker: React.FC<SleepTrackerProps> = ({ userId, session, compact }) => {
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  
  // Form state for adding new sleep entry
  const [sleepQuality, setSleepQuality] = useState<number>(7);
  const [sleepDuration, setSleepDuration] = useState<number>(7.5);
  const [bedtime, setBedtime] = useState<string>("22:30");
  const [wakeTime, setWakeTime] = useState<string>("07:00");
  const [disturbances, setDisturbances] = useState<number>(0);
  const [sleepNotes, setSleepNotes] = useState<string>('');

  useEffect(() => {
    if (userId && session) {
      loadSleepData();
    }
  }, [userId, session, viewMode, selectedDate]);

  const loadSleepData = async () => {
    try {
      setLoading(true);
      
      // Calculate date range based on view mode
      let startDate: Date, endDate: Date;
      
      if (viewMode === 'day') {
        startDate = selectedDate;
        endDate = selectedDate;
      } else if (viewMode === 'week') {
        startDate = subDays(selectedDate, 6);
        endDate = selectedDate;
      } else {
        startDate = subDays(selectedDate, 29);
        endDate = selectedDate;
      }
      
      // In a real implementation, we would call an API here
      // For demo purposes, we'll generate mock data
      const mockEntries: SleepEntry[] = [];
      
      // Generate entries for the date range
      let currentDate = startDate;
      while (currentDate <= endDate) {
        // 80% chance of having an entry for this day
        if (Math.random() < 0.8) {
          // Generate random bedtime between 21:00 and 00:00
          const bedHour = Math.floor(Math.random() * 4) + 21;
          const bedMinute = Math.floor(Math.random() * 12) * 5;
          const formattedBedHour = bedHour >= 24 ? bedHour - 24 : bedHour;
          const bedtimeStr = `${formattedBedHour.toString().padStart(2, '0')}:${bedMinute.toString().padStart(2, '0')}`;
          
          // Generate random wake time between 05:30 and 09:00
          const wakeHour = Math.floor(Math.random() * 7) + 5;
          const wakeMinute = Math.floor(Math.random() * 12) * 5;
          const waketimeStr = `${wakeHour.toString().padStart(2, '0')}:${wakeMinute.toString().padStart(2, '0')}`;
          
          mockEntries.push({
            date: format(currentDate, 'yyyy-MM-dd'),
            quality: Math.floor(Math.random() * 10) + 1, // 1-10
            duration: Number((Math.random() * 4 + 5).toFixed(1)), // 5-9 hours
            bedtime: bedtimeStr,
            wakeTime: waketimeStr,
            disturbances: Math.random() > 0.7 ? Math.floor(Math.random() * 5) : 0,
            notes: Math.random() > 0.8 ? 'Had trouble falling asleep...' : undefined
          });
        }
        
        currentDate = addDays(currentDate, 1);
      }
      
      setSleepEntries(mockEntries);
    } catch (error) {
      console.error('Error loading sleep data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSleep = () => {
    try {
      // Create new sleep entry
      const newEntry: SleepEntry = {
        date: format(new Date(), 'yyyy-MM-dd'),
        quality: sleepQuality,
        duration: sleepDuration,
        bedtime: bedtime,
        wakeTime: wakeTime,
        disturbances: disturbances,
        notes: sleepNotes || undefined
      };
      
      // Add to entries
      setSleepEntries([...sleepEntries, newEntry]);
      
      // Reset form and close
      resetForm();
      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving sleep entry:', error);
    }
  };

  const resetForm = () => {
    setSleepQuality(7);
    setSleepDuration(7.5);
    setBedtime("22:30");
    setWakeTime("07:00");
    setDisturbances(0);
    setSleepNotes('');
  };

  const getAverageSleepQuality = () => {
    if (sleepEntries.length === 0) return 0;
    
    const totalQuality = sleepEntries.reduce((sum, entry) => sum + entry.quality, 0);
    return totalQuality / sleepEntries.length;
  };

  const getAverageSleepDuration = () => {
    if (sleepEntries.length === 0) return 0;
    
    const totalDuration = sleepEntries.reduce((sum, entry) => sum + entry.duration, 0);
    return totalDuration / sleepEntries.length;
  };

  const getSleepTrend = () => {
    if (sleepEntries.length < 2) return 'stable';
    
    // Sort entries by date
    const sortedEntries = [...sleepEntries].sort((a, b) => {
      return parseISO(a.date).getTime() - parseISO(b.date).getTime();
    });
    
    // Split into two halves and compare averages
    const halfLength = Math.floor(sortedEntries.length / 2);
    const firstHalf = sortedEntries.slice(0, halfLength);
    const secondHalf = sortedEntries.slice(halfLength);
    
    const firstAvg = firstHalf.reduce((sum, entry) => sum + entry.quality, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, entry) => sum + entry.quality, 0) / secondHalf.length;
    
    const difference = secondAvg - firstAvg;
    
    if (difference > 0.5) return 'improving';
    if (difference < -0.5) return 'declining';
    return 'stable';
  };

  const getAverageBedtime = () => {
    const entriesWithBedtime = sleepEntries.filter(entry => entry.bedtime);
    if (entriesWithBedtime.length === 0) return "N/A";
    
    // Convert all bedtimes to minutes since midnight
    const bedtimeMinutes = entriesWithBedtime.map(entry => {
      const [hours, minutes] = entry.bedtime!.split(':').map(Number);
      return hours * 60 + minutes;
    });
    
    // Calculate average minutes
    const totalMinutes = bedtimeMinutes.reduce((sum, mins) => sum + mins, 0);
    const avgMinutes = Math.round(totalMinutes / bedtimeMinutes.length);
    
    // Convert back to HH:MM format
    const avgHours = Math.floor(avgMinutes / 60);
    const avgMins = avgMinutes % 60;
    
    return `${avgHours.toString().padStart(2, '0')}:${avgMins.toString().padStart(2, '0')}`;
  };

  const renderSleepCalendar = () => {
    // Generate dates for the view
    let dates: Date[] = [];
    
    if (viewMode === 'day') {
      dates = [selectedDate];
    } else if (viewMode === 'week') {
      dates = Array.from({ length: 7 }, (_, i) => subDays(selectedDate, 6 - i));
    } else {
      dates = Array.from({ length: 30 }, (_, i) => subDays(selectedDate, 29 - i));
    }
    
    return (
      <div className="mt-4">
        {viewMode === 'day' ? (
          // Single day view
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h3>
            
            {sleepEntries.find(entry => entry.date === format(selectedDate, 'yyyy-MM-dd')) ? (
              <div className="flex flex-col mt-2">
                <div className="flex items-center">
                  <Moon className="h-5 w-5 text-indigo-500 mr-2" />
                  <span className="font-medium">
                    Sleep Quality: {sleepEntries.find(entry => entry.date === format(selectedDate, 'yyyy-MM-dd'))!.quality}/10
                  </span>
                </div>
                
                <div className="mt-2 flex items-center">
                  <Clock className="h-4 w-4 text-indigo-500 mr-2" />
                  <span>
                    Duration: {sleepEntries.find(entry => entry.date === format(selectedDate, 'yyyy-MM-dd'))!.duration} hours
                  </span>
                </div>
                
                <div className="mt-1 flex items-center">
                  <Bed className="h-4 w-4 text-indigo-500 mr-2" />
                  <span>
                    Bedtime: {sleepEntries.find(entry => entry.date === format(selectedDate, 'yyyy-MM-dd'))!.bedtime}
                  </span>
                </div>
                
                <div className="mt-1 flex items-center">
                  <AlarmClock className="h-4 w-4 text-indigo-500 mr-2" />
                  <span>
                    Wake time: {sleepEntries.find(entry => entry.date === format(selectedDate, 'yyyy-MM-dd'))!.wakeTime}
                  </span>
                </div>
                
                {sleepEntries.find(entry => entry.date === format(selectedDate, 'yyyy-MM-dd'))!.disturbances! > 0 && (
                  <div className="mt-1 flex items-center">
                    <BellRing className="h-4 w-4 text-indigo-500 mr-2" />
                    <span>
                      Disturbances: {sleepEntries.find(entry => entry.date === format(selectedDate, 'yyyy-MM-dd'))!.disturbances}
                    </span>
                  </div>
                )}
                
                {sleepEntries.find(entry => entry.date === format(selectedDate, 'yyyy-MM-dd'))!.notes && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p className="italic">
                      "{sleepEntries.find(entry => entry.date === format(selectedDate, 'yyyy-MM-dd'))!.notes}"
                    </p>
                  </div>
                )}
                
                <div className="mt-3">
                  <Progress 
                    value={sleepEntries.find(entry => entry.date === format(selectedDate, 'yyyy-MM-dd'))!.quality * 10} 
                    className="h-2" 
                  />
                </div>
              </div>
            ) : (
              <div className="text-gray-500">No sleep data for this day</div>
            )}
          </div>
        ) : (
          // Week or month view
          <div className="grid grid-cols-7 gap-1 mt-2">
            {/* Day headers for week/month view */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
              <div key={`header-${i}`} className="text-xs text-center font-medium text-gray-500">
                {day}
              </div>
            ))}
            
            {/* Fill in any empty days at the start to align with weekdays */}
            {viewMode === 'month' && Array.from({ length: dates[0].getDay() }, (_, i) => (
              <div key={`empty-start-${i}`} className="aspect-square"></div>
            ))}
            
            {/* Render calendar days */}
            {dates.map((date, i) => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const entry = sleepEntries.find(entry => entry.date === dateStr);
              const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');
              
              return (
                <div 
                  key={`day-${i}`}
                  className={`aspect-square p-1 border rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 ${isToday ? 'border-primary' : 'border-gray-200'}`}
                  onClick={() => setSelectedDate(date)}
                >
                  <div className={`text-xs ${isToday ? 'font-bold text-primary' : 'text-gray-700'}`}>
                    {format(date, 'd')}
                  </div>
                  {entry && (
                    <>
                      <div className="mt-1">
                        <div 
                          className={`h-3 w-3 rounded-full mx-auto ${
                            entry.quality >= 8 ? 'bg-green-500' :
                            entry.quality >= 5 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          title={`Sleep Quality: ${entry.quality}/10`}
                        />
                      </div>
                      <div className="text-xs mt-0.5 text-indigo-600">
                        {entry.duration}h
                      </div>
                    </>
                  )}
                </div>
              );
            })}
            
            {/* Fill in any empty days at the end to complete the grid */}
            {viewMode === 'month' && Array.from({ length: 6 - dates[dates.length - 1].getDay() }, (_, i) => (
              <div key={`empty-end-${i}`} className="aspect-square"></div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderSleepForm = () => {
    return (
      <div className="mt-4 bg-white p-4 rounded-lg border">
        <h3 className="font-medium mb-3">Record Your Sleep</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sleep Quality (1-10)
            </label>
            <div className="flex items-center space-x-2">
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={sleepQuality} 
                onChange={(e) => setSleepQuality(parseInt(e.target.value))}
                className="flex-1" 
              />
              <span className="font-bold text-indigo-500">{sleepQuality}</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sleep Duration (hours)
            </label>
            <input 
              type="number" 
              min="0" 
              max="24" 
              step="0.1"
              value={sleepDuration} 
              onChange={(e) => setSleepDuration(parseFloat(e.target.value))}
              className="w-full p-2 border rounded-md" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bedtime
              </label>
              <input 
                type="time" 
                value={bedtime} 
                onChange={(e) => setBedtime(e.target.value)}
                className="w-full p-2 border rounded-md" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wake Time
              </label>
              <input 
                type="time" 
                value={wakeTime} 
                onChange={(e) => setWakeTime(e.target.value)}
                className="w-full p-2 border rounded-md" 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Disturbances
            </label>
            <input 
              type="number" 
              min="0" 
              value={disturbances} 
              onChange={(e) => setDisturbances(parseInt(e.target.value))}
              className="w-full p-2 border rounded-md" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea 
              value={sleepNotes} 
              onChange={(e) => setSleepNotes(e.target.value)}
              className="w-full p-2 border rounded-md"
              rows={2}
              placeholder="Any dreams, trouble falling asleep, or other observations?"
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline"
              onClick={() => {
                resetForm();
                setShowAddForm(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveSleep}>
              Save
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderSleepSummary = () => {
    const averageQuality = getAverageSleepQuality();
    const averageDuration = getAverageSleepDuration();
    const trend = getSleepTrend();
    const averageBedtime = getAverageBedtime();
    
    return (
      <div className="bg-indigo-50 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <h3 className="text-indigo-800 font-medium">Average Quality</h3>
            <div className="flex items-center mt-1">
              <Moon className="h-5 w-5 text-indigo-500 mr-1" />
              <span className="text-xl font-bold text-indigo-900">
                {averageQuality.toFixed(1)}
              </span>
              <span className="text-sm text-indigo-700 ml-1">/10</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-indigo-800 font-medium">Average Duration</h3>
            <div className="flex items-center mt-1">
              <MoonIcon className="h-5 w-5 text-indigo-500 mr-1" />
              <span className="text-xl font-bold text-indigo-900">
                {averageDuration.toFixed(1)}
              </span>
              <span className="text-sm text-indigo-700 ml-1">hrs</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-indigo-800 font-medium">Avg. Bedtime</h3>
            <div className="flex items-center mt-1">
              <Bed className="h-5 w-5 text-indigo-500 mr-1" />
              <span className="text-xl font-bold text-indigo-900">
                {averageBedtime}
              </span>
            </div>
          </div>
          
          <div>
            <h3 className="text-indigo-800 font-medium">Trend</h3>
            <p className={`text-sm font-medium mt-1 ${
              trend === 'improving' ? 'text-green-600' :
              trend === 'declining' ? 'text-red-600' :
              'text-yellow-600'
            }`}>
              {trend === 'improving' ? '↗ Improving' :
               trend === 'declining' ? '↘ Declining' :
               '→ Stable'}
            </p>
          </div>
        </div>
        
        <div className="mt-3">
          <div className="text-xs text-indigo-700 mb-1">Sleep quality distribution</div>
          <div className="flex h-4 overflow-hidden rounded-full bg-gray-200">
            <div className="bg-red-500" style={{ width: `${sleepEntries.filter(e => e.quality <= 3).length / sleepEntries.length * 100}%` }}></div>
            <div className="bg-orange-500" style={{ width: `${sleepEntries.filter(e => e.quality > 3 && e.quality <= 5).length / sleepEntries.length * 100}%` }}></div>
            <div className="bg-yellow-500" style={{ width: `${sleepEntries.filter(e => e.quality > 5 && e.quality <= 7).length / sleepEntries.length * 100}%` }}></div>
            <div className="bg-green-500" style={{ width: `${sleepEntries.filter(e => e.quality > 7).length / sleepEntries.length * 100}%` }}></div>
          </div>
        </div>
      </div>
    );
  };

  const renderSleepTips = () => {
    return (
      <div className="bg-white rounded-lg border p-4 mt-4">
        <h3 className="font-medium text-lg mb-3">Better Sleep During Quit Journey</h3>
        <div className="space-y-3">
          <div className="flex">
            <div className="mr-3 flex-shrink-0">
              <Clock className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <p className="font-medium">Consistent Schedule</p>
              <p className="text-sm text-gray-600">Go to bed and wake up at the same time each day, even on weekends, to regulate your body's clock.</p>
            </div>
          </div>
          
          <div className="flex">
            <div className="mr-3 flex-shrink-0">
              <BellRing className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <p className="font-medium">Avoid Nicotine Replacements at Night</p>
              <p className="text-sm text-gray-600">If using nicotine patches, consider removing them before bed or using a lower dose overnight.</p>
            </div>
          </div>
          
          <div className="flex">
            <div className="mr-3 flex-shrink-0">
              <Bed className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <p className="font-medium">Relaxation Techniques</p>
              <p className="text-sm text-gray-600">Try deep breathing, progressive muscle relaxation, or guided imagery to help manage nighttime cravings.</p>
            </div>
          </div>
          
          <div className="flex">
            <div className="mr-3 flex-shrink-0">
              <AlarmClock className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <p className="font-medium">Temporary Changes Normal</p>
              <p className="text-sm text-gray-600">Sleep disturbances are common in the first 1-2 weeks of quitting, but typically improve afterward.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div>
          {/* Sleep Summary */}
          {sleepEntries.length > 0 && renderSleepSummary()}
          
          {/* View Controls */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
              <Button 
                variant={viewMode === 'day' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('day')}
              >
                Day
              </Button>
              <Button 
                variant={viewMode === 'week' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('week')}
              >
                Week
              </Button>
              <Button 
                variant={viewMode === 'month' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('month')}
              >
                Month
              </Button>
            </div>
            
            <Button 
              size="sm"
              variant="outline"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Log Sleep
            </Button>
          </div>
          
          {/* Sleep Form */}
          {showAddForm && renderSleepForm()}
          
          {/* Calendar */}
          {!showAddForm && renderSleepCalendar()}
          
          {/* Sleep Tips */}
          {!showAddForm && renderSleepTips()}
        </div>
      )}
    </div>
  );
}; 