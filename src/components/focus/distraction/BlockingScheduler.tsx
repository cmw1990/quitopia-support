import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BlockedSite, BlockingSchedule } from '@/lib/types/distraction-types';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, Plus, AlertTriangle } from 'lucide-react';

interface Props {
  site: BlockedSite;
  onUpdateSchedule: (schedules: BlockingSchedule[]) => void;
  onCancel: () => void;
}

const daysOfWeek = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
] as const;

export const BlockingScheduler: React.FC<Props> = ({
  site,
  onUpdateSchedule,
  onCancel
}) => {
  const [schedules, setSchedules] = useState<BlockingSchedule[]>(
    site.blockingSchedule || []
  );
  const [currentSchedule, setCurrentSchedule] = useState<BlockingSchedule>({
    start: '09:00',
    end: '17:00',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    active: true,
    priority: 1
  });

  const addSchedule = () => {
    setSchedules(prev => [...prev, currentSchedule]);
    setCurrentSchedule({
      start: '09:00',
      end: '17:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      active: true,
      priority: schedules.length + 1
    });
  };

  const removeSchedule = (index: number) => {
    setSchedules(prev => prev.filter((_, i) => i !== index));
  };

  const toggleDay = (day: string) => {
    setCurrentSchedule(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const saveSchedules = () => {
    onUpdateSchedule(schedules);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Blocking Schedule</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          ×
        </Button>
      </div>

      <div className="space-y-6">
        {/* Current schedules */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Active Schedules</h4>
          <div className="grid gap-3">
            <AnimatePresence>
              {schedules.map((schedule, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">
                          {schedule.start} - {schedule.end}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {schedule.days.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={schedule.active}
                        onCheckedChange={(checked) => {
                          const newSchedules = [...schedules];
                          newSchedules[index].active = checked;
                          setSchedules(newSchedules);
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSchedule(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Add new schedule */}
        <div className="border-t pt-6">
          <h4 className="text-sm font-medium mb-4">Add New Schedule</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={currentSchedule.start}
                  onChange={(e) => setCurrentSchedule(prev => ({
                    ...prev,
                    start: e.target.value
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={currentSchedule.end}
                  onChange={(e) => setCurrentSchedule(prev => ({
                    ...prev,
                    end: e.target.value
                  }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Active Days</Label>
              <div className="grid grid-cols-7 gap-1">
                {daysOfWeek.map((day) => (
                  <Button
                    key={day}
                    variant="outline"
                    size="sm"
                    className={currentSchedule.days.includes(day) ? 'bg-blue-100 border-blue-500' : ''}
                    onClick={() => toggleDay(day)}
                  >
                    {day.charAt(0).toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Priority Level</Label>
              <Select
                value={currentSchedule.priority.toString()}
                onValueChange={(value) => setCurrentSchedule(prev => ({
                  ...prev,
                  priority: parseInt(value)
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">High</SelectItem>
                  <SelectItem value="2">Medium</SelectItem>
                  <SelectItem value="3">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {currentSchedule.start >= currentSchedule.end && (
              <div className="flex items-center gap-2 text-sm text-yellow-500">
                <AlertTriangle className="h-4 w-4" />
                <span>End time should be after start time</span>
              </div>
            )}

            <Button
              onClick={addSchedule}
              disabled={currentSchedule.start >= currentSchedule.end}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Schedule
            </Button>
          </div>
        </div>

        {/* Save actions */}
        <div className="flex justify-end gap-2 border-t pt-6">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button onClick={saveSchedules} disabled={schedules.length === 0}>
            Save Changes
          </Button>
        </div>
      </div>
    </Card>
  );
};
