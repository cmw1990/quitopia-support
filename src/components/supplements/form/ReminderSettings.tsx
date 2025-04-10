import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

interface ReminderSettingsProps {
  reminderEnabled: boolean;
  setReminderEnabled: (value: boolean) => void;
  reminderTime: string;
  setReminderTime: (value: string) => void;
}

export function ReminderSettings({
  reminderEnabled,
  setReminderEnabled,
  reminderTime,
  setReminderTime,
}: ReminderSettingsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="reminderEnabled"
          checked={reminderEnabled}
          onCheckedChange={setReminderEnabled}
        />
        <Label htmlFor="reminderEnabled">Enable Daily Reminder</Label>
      </div>

      {reminderEnabled && (
        <div className="space-y-2">
          <Label htmlFor="reminderTime">Reminder Time</Label>
          <Input
            id="reminderTime"
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}