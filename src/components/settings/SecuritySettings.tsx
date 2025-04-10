import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export const SecuritySettings = () => {
  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input id="confirm-password" type="password" />
          </div>
        </div>

        <div className="space-y-4">
          <Button className="w-full">Update Password</Button>
          <Button variant="outline" className="w-full">Enable Two-Factor Authentication</Button>
        </div>
      </CardContent>
    </Card>
  );
};
