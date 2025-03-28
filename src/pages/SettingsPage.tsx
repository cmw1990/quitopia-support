import React, { useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Settings, Bell, Moon, Database, Zap, DollarSign, Shield } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { hapticFeedback } from '@/utils/hapticFeedback';

const SettingItem: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, description, icon, children }) => (
  <div className="flex items-start justify-between py-4 border-b last:border-b-0">
    <div className="flex items-start space-x-3">
      <div className="mt-0.5">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-base">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
    <div>
      {children}
    </div>
  </div>
);

const SettingsPage: React.FC = () => {
  const session = useSession();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [offlineEnabled, setOfflineEnabled] = useState(true);
  const [powerSavingEnabled, setPowerSavingEnabled] = useState(false);
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  // Handle toggle changes
  const handleToggle = (setting: string, value: boolean) => {
    // Provide haptic feedback on toggle change
    hapticFeedback.selectionChanged();
    
    switch(setting) {
      case 'notifications':
        setNotificationsEnabled(value);
        showToast(`Notifications ${value ? 'enabled' : 'disabled'}`);
        break;
      case 'darkMode':
        setDarkModeEnabled(value);
        showToast(`Dark mode ${value ? 'enabled' : 'disabled'}`);
        break;
      case 'offline':
        setOfflineEnabled(value);
        showToast(`Offline mode ${value ? 'enabled' : 'disabled'}`);
        break;
      case 'powerSaving':
        setPowerSavingEnabled(value);
        showToast(`Power saving ${value ? 'enabled' : 'disabled'}`);
        break;
      case 'twoFactor':
        setTwoFactorEnabled(value);
        showToast(`Two-factor authentication ${value ? 'enabled' : 'disabled'}`);
        break;
    }
  };
  
  const showToast = (message: string) => {
    toast({
      title: "Settings Updated",
      description: message
    });
  };
  
  const handleClearData = () => {
    hapticFeedback.heavy();
    
    // Show confirmation toast
    toast({
      title: "Confirm Action",
      description: "This is a demo - no data will actually be cleared",
      variant: "destructive",
    });
  };
  
  const handleManageSubscription = () => {
    hapticFeedback.medium();
    setSubscriptionActive(!subscriptionActive);
    showToast(`Subscription ${subscriptionActive ? 'cancelled' : 'activated'} (demo)`);
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure how and when you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-0">
            <SettingItem
              title="Enable Notifications"
              description="Receive alerts about cravings and achievements"
              icon={<Bell className="h-4 w-4 text-muted-foreground" />}
            >
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={(value) => handleToggle('notifications', value)}
              />
            </SettingItem>
          </CardContent>
        </Card>
        
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize how the application looks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-0">
            <SettingItem
              title="Dark Mode"
              description="Use a darker color scheme"
              icon={<Moon className="h-4 w-4 text-muted-foreground" />}
            >
              <Switch
                checked={darkModeEnabled}
                onCheckedChange={(value) => handleToggle('darkMode', value)}
              />
            </SettingItem>
          </CardContent>
        </Card>
        
        {/* Data Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Data & Storage
            </CardTitle>
            <CardDescription>
              Manage how the app stores and uses your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-0">
            <SettingItem
              title="Offline Mode"
              description="Allow the app to work without an internet connection"
              icon={<Database className="h-4 w-4 text-muted-foreground" />}
            >
              <Switch
                checked={offlineEnabled}
                onCheckedChange={(value) => handleToggle('offline', value)}
              />
            </SettingItem>
            
            <SettingItem
              title="Power Saving Mode"
              description="Reduce animations and background activity"
              icon={<Zap className="h-4 w-4 text-muted-foreground" />}
            >
              <Switch
                checked={powerSavingEnabled}
                onCheckedChange={(value) => handleToggle('powerSaving', value)}
              />
            </SettingItem>
            
            <div className="pt-4">
              <Button variant="outline" onClick={handleClearData} className="w-full text-red-500">
                Clear Local Data
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Account
            </CardTitle>
            <CardDescription>
              Manage account settings and security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-0">
            <SettingItem
              title="Two-Factor Authentication"
              description="Add an extra layer of security to your account"
              icon={<Shield className="h-4 w-4 text-muted-foreground" />}
            >
              <Switch
                checked={twoFactorEnabled}
                onCheckedChange={(value) => handleToggle('twoFactor', value)}
              />
            </SettingItem>
            
            <SettingItem
              title="Subscription"
              description={subscriptionActive ? "Currently subscribed to Premium" : "Upgrade to access premium features"}
              icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
            >
              <Button 
                variant={subscriptionActive ? "outline" : "default"}
                size="sm"
                onClick={handleManageSubscription}
              >
                {subscriptionActive ? "Manage" : "Upgrade"}
              </Button>
            </SettingItem>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Logged in as: {user?.email || session?.user?.email || 'user@example.com'}</p>
        <p className="mt-1">App Version: 1.0.0</p>
      </div>
    </div>
  );
};

export default SettingsPage; 