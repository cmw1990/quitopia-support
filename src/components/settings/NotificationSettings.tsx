import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export const NotificationSettings = () => {
  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="email-notifications">Email Notifications</Label>
          <Switch id="email-notifications" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="push-notifications">Push Notifications</Label>
          <Switch id="push-notifications" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="wellness-reminders">Wellness Reminders</Label>
          <Switch id="wellness-reminders" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="progress-updates">Progress Updates</Label>
          <Switch id="progress-updates" defaultChecked />
        </div>
      </CardContent>
    </Card>
  );
};
