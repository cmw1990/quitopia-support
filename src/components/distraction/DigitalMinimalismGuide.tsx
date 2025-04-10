import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Smartphone, BellOff, Clock, Compass } from 'lucide-react'; // Example icons

const DigitalMinimalismGuide: React.FC = () => {
  const tips = [
    {
      icon: Smartphone,
      title: "Curate Your Home Screen",
      description: "Remove non-essential apps, especially social media and news, from your primary home screen. Move them to secondary screens or folders to reduce impulsive opening."
    },
    {
      icon: BellOff,
      title: "Turn Off Non-Essential Notifications",
      description: "Go through your app notification settings and disable alerts for anything that isn't time-sensitive or personally important. Batch check less critical apps manually."
    },
    {
      icon: Clock,
      title: "Schedule Digital Time",
      description: "Allocate specific times for checking email, social media, or news instead of constantly reacting to them throughout the day. Use a timer to stick to your schedule."
    },
    {
      icon: Compass,
      title: "Define Your Tech Philosophy",
      description: "Reflect on what role you want technology to play in your life. What adds value? What detracts? Use this philosophy to guide your usage habits and app choices."
    },
    // Add more tips as needed
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Digital Minimalism Guidance</CardTitle>
        <CardDescription>Tips for cultivating a healthier relationship with technology and reducing digital distractions.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {tips.map((tip, index) => (
          <div key={index} className="flex items-start gap-3 p-3 border rounded-md bg-muted/30">
            <tip.icon className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-sm">{tip.title}</h4>
              <p className="text-xs text-muted-foreground">{tip.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default DigitalMinimalismGuide;