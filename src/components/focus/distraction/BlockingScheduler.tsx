
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { BlockedSite, BlockingSchedule } from '@/lib/types/distraction-types';

interface BlockingSchedulerProps {
  site: BlockedSite;
  onUpdateSchedule: (schedules: BlockingSchedule[]) => void;
  onCancel: () => void;
}

export const BlockingScheduler: React.FC<BlockingSchedulerProps> = ({ 
  site, 
  onUpdateSchedule, 
  onCancel 
}) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const [schedules, setSchedules] = useState<BlockingSchedule[]>(
    site.blockingSchedule || []
  );
  
  const [newSchedule, setNewSchedule] = useState<BlockingSchedule>({
    day: 'Monday',
    start_time: '09:00',
    end_time: '17:00'
  });

  const addSchedule = () => {
    setSchedules([...schedules, newSchedule]);
    setNewSchedule({
      day: 'Monday',
      start_time: '09:00',
      end_time: '17:00'
    });
  };

  const removeSchedule = (index: number) => {
    const newSchedules = [...schedules];
    newSchedules.splice(index, 1);
    setSchedules(newSchedules);
  };

  const handleInputChange = (field: keyof BlockingSchedule, value: string) => {
    setNewSchedule({
      ...newSchedule,
      [field]: value
    });
  };

  const saveSchedules = () => {
    onUpdateSchedule(schedules);
  };

  const [blockAllDay, setBlockAllDay] = useState(site.blockingSchedule ? false : true);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">Blocking Schedule for {site.domain}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="block-all-day"
            checked={blockAllDay}
            onCheckedChange={(checked) => setBlockAllDay(!!checked)}
          />
          <Label htmlFor="block-all-day">Block this site all day</Label>
        </div>

        {!blockAllDay && (
          <>
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Current Schedules</h3>
              
              {schedules.length === 0 ? (
                <p className="text-sm text-muted-foreground">No schedules set. Add a schedule below.</p>
              ) : (
                <div className="space-y-2">
                  {schedules.map((schedule, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                      <div className="text-sm">
                        <span className="font-medium">{schedule.day}: </span>
                        {schedule.start_time} to {schedule.end_time}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeSchedule(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-medium">Add Schedule</h3>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="day">Day</Label>
                  <select
                    id="day"
                    className="w-full border rounded-md p-2"
                    value={newSchedule.day}
                    onChange={(e) => handleInputChange('day', e.target.value)}
                  >
                    {days.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input 
                    id="start-time"
                    type="time"
                    value={newSchedule.start_time}
                    onChange={(e) => handleInputChange('start_time', e.target.value)}
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="end-time">End Time</Label>
                  <Input 
                    id="end-time"
                    type="time"
                    value={newSchedule.end_time}
                    onChange={(e) => handleInputChange('end_time', e.target.value)}
                  />
                </div>
              </div>
              
              <Button onClick={addSchedule}>Add Schedule</Button>
            </div>
          </>
        )}

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={saveSchedules}>Save Blocking Schedule</Button>
        </div>
      </CardContent>
    </Card>
  );
};
