import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Bell,
  Moon,
  Sun,
  Globe,
  Lock,
  User,
  Shield,
  Clock,
  Battery,
  Brain,
  Coffee,
  Dumbbell
} from 'lucide-react';

// Define interfaces for our settings types
interface FieldType {
  name: string;
  label: string;
  type: string;
}

interface SettingBase {
  label: string;
  type: string;
}

interface FormSetting extends SettingBase {
  type: 'form';
  fields: FieldType[];
}

interface InfoSetting extends SettingBase {
  type: 'info';
  value: string;
  action: string;
}

interface ButtonSetting extends SettingBase {
  type: 'button';
  action: string;
}

interface ToggleSetting extends SettingBase {
  type: 'toggle';
  enabled: boolean;
}

interface SelectSetting extends SettingBase {
  type: 'select';
  options: string[];
}

interface LinkSetting extends SettingBase {
  type: 'link';
}

type Setting = FormSetting | InfoSetting | ButtonSetting | ToggleSetting | SelectSetting | LinkSetting;

export const WebappSettings: React.FC = () => {
  const settingSections = [
    {
      title: "Account",
      icon: User,
      settings: [
        { 
          label: "Profile Information",
          type: "form",
          fields: [
            { name: "name", label: "Name", type: "text" },
            { name: "email", label: "Email", type: "email" },
            { name: "timezone", label: "Timezone", type: "select" }
          ]
        } as FormSetting,
        { 
          label: "Subscription",
          type: "info",
          value: "Premium Plan",
          action: "Manage"
        } as InfoSetting,
        { 
          label: "Data Export",
          type: "button",
          action: "Export"
        } as ButtonSetting
      ]
    },
    {
      title: "Notifications",
      icon: Bell,
      settings: [
        { label: "Energy Reminders", type: "toggle", enabled: true } as ToggleSetting,
        { label: "Focus Timer Alerts", type: "toggle", enabled: true } as ToggleSetting,
        { label: "Sleep Schedule", type: "toggle", enabled: true } as ToggleSetting,
        { label: "Exercise Reminders", type: "toggle", enabled: false } as ToggleSetting
      ]
    },
    {
      title: "Energy Tracking",
      icon: Battery,
      settings: [
        { label: "Auto-track Energy Levels", type: "toggle", enabled: true } as ToggleSetting,
        { label: "Daily Energy Reports", type: "toggle", enabled: true } as ToggleSetting,
        { label: "Energy Optimization Tips", type: "toggle", enabled: true } as ToggleSetting
      ]
    },
    {
      title: "Focus & Productivity",
      icon: Brain,
      settings: [
        { label: "Focus Session Duration", type: "select", options: ["25min", "45min", "60min"] } as SelectSetting,
        { label: "Break Reminders", type: "toggle", enabled: true } as ToggleSetting,
        { label: "Focus Mode Settings", type: "link" } as LinkSetting
      ]
    },
    {
      title: "Wellness",
      icon: Dumbbell,
      settings: [
        { label: "Exercise Tracking", type: "toggle", enabled: true } as ToggleSetting,
        { label: "Nutrition Logging", type: "toggle", enabled: true } as ToggleSetting,
        { label: "Sleep Analysis", type: "toggle", enabled: true } as ToggleSetting,
        { label: "Mental Health Check-ins", type: "toggle", enabled: true } as ToggleSetting
      ]
    },
    {
      title: "Privacy & Security",
      icon: Shield,
      settings: [
        { label: "Two-Factor Authentication", type: "toggle", enabled: false } as ToggleSetting,
        { label: "Data Sharing", type: "toggle", enabled: true } as ToggleSetting,
        { label: "Privacy Settings", type: "link" } as LinkSetting
      ]
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <div className="grid gap-6">
        {settingSections.map((section, index) => {
          const Icon = section.icon;
          return (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {section.settings.map((setting, settingIndex) => (
                    <div key={settingIndex} className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>{setting.label}</Label>
                        {setting.type === 'form' && (
                          <div className="space-y-2 mt-2">
                            {(setting as FormSetting).fields.map((field, fieldIndex) => (
                              <div key={fieldIndex} className="space-y-1">
                                <Label>{field.label}</Label>
                                {field.type === 'select' ? (
                                  <Select>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select timezone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="utc">UTC</SelectItem>
                                      <SelectItem value="est">EST</SelectItem>
                                      <SelectItem value="pst">PST</SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <Input type={field.type} placeholder={field.label} />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {setting.type === 'toggle' && (
                        <Switch checked={(setting as ToggleSetting).enabled} />
                      )}
                      {setting.type === 'button' && (
                        <Button>{(setting as ButtonSetting).action}</Button>
                      )}
                      {setting.type === 'select' && (
                        <Select>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {(setting as SelectSetting).options.map((option, optionIndex) => (
                              <SelectItem key={optionIndex} value={option.toLowerCase()}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {setting.type === 'info' && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{(setting as InfoSetting).value}</span>
                          <Button variant="outline" size="sm">{(setting as InfoSetting).action}</Button>
                        </div>
                      )}
                      {setting.type === 'link' && (
                        <Button variant="ghost">Configure →</Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
