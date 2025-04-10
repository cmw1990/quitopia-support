
import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Moon, 
  Battery, 
  Bell, 
  Shield, 
  Globe, 
  Clock,
  User,
  LogOut
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MobileSettings: React.FC = () => {
  const { toast } = useToast();
  
  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Profile</p>
                <p className="text-sm text-muted-foreground">Manage your account information</p>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <User className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <LogOut className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Logout</p>
                <p className="text-sm text-muted-foreground">Sign out of your account</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Moon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-muted-foreground">Toggle between light and dark theme</p>
              </div>
            </div>
            <Switch id="dark-mode" />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Notifications</p>
                <p className="text-sm text-muted-foreground">Configure app notifications</p>
              </div>
            </div>
            <Switch id="notifications" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Battery className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Battery Optimization</p>
                <p className="text-sm text-muted-foreground">Optimize for battery life</p>
              </div>
            </div>
            <Switch id="battery" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Focus Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Distraction Blocking</p>
                <p className="text-sm text-muted-foreground">Block distracting websites and apps</p>
              </div>
            </div>
            <Switch id="distraction-blocking" />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Timer Settings</p>
                <p className="text-sm text-muted-foreground">Customize your focus timer</p>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <Clock className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Globe className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Language</p>
                <p className="text-sm text-muted-foreground">Change app language</p>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <Globe className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center text-xs text-muted-foreground pt-4">
        <p>EasierFocus v1.0.0</p>
        <p>© 2024 EasierFocus. All rights reserved.</p>
      </div>
    </div>
  );
};

export default MobileSettings;
