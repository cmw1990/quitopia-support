import React, { useState, useEffect } from 'react';
import { PomodoroSettings } from './PomodoroTimer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

interface PomodoroSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialSettings: PomodoroSettings;
  onSave: (newSettings: PomodoroSettings) => void;
  isSaving: boolean;
}

export const PomodoroSettingsDialog: React.FC<PomodoroSettingsDialogProps> = ({
  isOpen,
  onClose,
  initialSettings,
  onSave,
  isSaving,
}) => {
  const [settings, setSettings] = useState<PomodoroSettings>(initialSettings);

  useEffect(() => {
    // Update local state if initialSettings change (e.g., fetched after dialog opened)
    setSettings(initialSettings);
  }, [initialSettings]);

  const handleChange = (key: keyof PomodoroSettings, value: number | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSliderChange = (key: keyof PomodoroSettings, value: number[]) => {
      setSettings(prev => ({ ...prev, [key]: value[0] }));
  };

  const handleSaveClick = () => {
    onSave(settings);
    // onClose(); // Parent should handle closing on successful save
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}> 
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Pomodoro Settings</DialogTitle>
          <DialogDescription>
            Customize your focus and break intervals.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
            {/* Focus Duration */}
            <div className="space-y-2">
                <Label htmlFor="focusDuration">Focus Duration (minutes)</Label>
                <div className="flex items-center gap-4">
                    <Slider
                        id="focusDuration"
                        min={5}
                        max={60}
                        step={5}
                        value={[settings.focusDuration]}
                        onValueChange={(value) => handleSliderChange('focusDuration', value)}
                        disabled={isSaving}
                    />
                    <span className="w-12 text-center font-medium">{settings.focusDuration}</span>
                </div>
            </div>
             {/* Short Break Duration */}
            <div className="space-y-2">
                <Label htmlFor="shortBreakDuration">Short Break (minutes)</Label>
                <div className="flex items-center gap-4">
                    <Slider
                        id="shortBreakDuration"
                        min={1}
                        max={15}
                        step={1}
                        value={[settings.shortBreakDuration]}
                        onValueChange={(value) => handleSliderChange('shortBreakDuration', value)}
                        disabled={isSaving}
                    />
                    <span className="w-12 text-center font-medium">{settings.shortBreakDuration}</span>
                </div>
            </div>
             {/* Long Break Duration */}
             <div className="space-y-2">
                 <Label htmlFor="longBreakDuration">Long Break (minutes)</Label>
                 <div className="flex items-center gap-4">
                     <Slider
                         id="longBreakDuration"
                         min={10}
                         max={30}
                         step={5}
                         value={[settings.longBreakDuration]}
                         onValueChange={(value) => handleSliderChange('longBreakDuration', value)}
                         disabled={isSaving}
                     />
                     <span className="w-12 text-center font-medium">{settings.longBreakDuration}</span>
                 </div>
             </div>
             {/* Long Break Interval */}
             <div className="space-y-2">
                 <Label htmlFor="longBreakInterval">Long Break Interval (cycles)</Label>
                 <div className="flex items-center gap-4">
                     <Slider
                         id="longBreakInterval"
                         min={2}
                         max={6}
                         step={1}
                         value={[settings.longBreakInterval]}
                         onValueChange={(value) => handleSliderChange('longBreakInterval', value)}
                         disabled={isSaving}
                     />
                     <span className="w-12 text-center font-medium">{settings.longBreakInterval}</span>
                 </div>
             </div>

             {/* Toggles */}
             <div className="flex items-center justify-between pt-4 border-t">
                 <Label htmlFor="autoStartBreaks" className="flex flex-col space-y-1">
                     <span>Auto-start Breaks</span>
                     <span className="font-normal leading-snug text-muted-foreground text-xs">
                         Automatically start breaks after focus ends.
                     </span>
                 </Label>
                 <Switch
                     id="autoStartBreaks"
                     checked={settings.autoStartBreaks}
                     onCheckedChange={(checked) => handleChange('autoStartBreaks', checked)}
                     disabled={isSaving}
                 />
             </div>
              <div className="flex items-center justify-between">
                  <Label htmlFor="autoStartFocus" className="flex flex-col space-y-1">
                      <span>Auto-start Focus</span>
                      <span className="font-normal leading-snug text-muted-foreground text-xs">
                          Automatically start focus after break ends.
                      </span>
                  </Label>
                  <Switch
                      id="autoStartFocus"
                      checked={settings.autoStartFocus}
                      onCheckedChange={(checked) => handleChange('autoStartFocus', checked)}
                      disabled={isSaving}
                  />
              </div>
              <div className="flex items-center justify-between">
                  <Label htmlFor="notifications" className="flex flex-col space-y-1">
                      <span>Browser Notifications</span>
                      <span className="font-normal leading-snug text-muted-foreground text-xs">
                          Show alerts when sessions end.
                      </span>
                  </Label>
                  <Switch
                      id="notifications"
                      checked={settings.notifications}
                      onCheckedChange={(checked) => handleChange('notifications', checked)}
                      disabled={isSaving}
                  />
              </div>
              <div className="flex items-center justify-between">
                   <Label htmlFor="sounds" className="flex flex-col space-y-1">
                       <span>Sound Alerts</span>
                       <span className="font-normal leading-snug text-muted-foreground text-xs">
                           Play a sound when sessions end.
                       </span>
                   </Label>
                   <Switch
                       id="sounds"
                       checked={settings.sounds}
                       onCheckedChange={(checked) => handleChange('sounds', checked)}
                       disabled={isSaving}
                   />
               </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button type="button" onClick={handleSaveClick} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 