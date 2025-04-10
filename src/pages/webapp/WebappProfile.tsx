import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Clock, 
  Activity,
  Target,
  Award,
  Edit
} from 'lucide-react';

export const WebappProfile: React.FC = () => {
  const userStats = [
    {
      icon: Activity,
      label: "Energy Score",
      value: "85/100",
      trend: "+5 this week"
    },
    {
      icon: Target,
      label: "Goals Met",
      value: "12/15",
      trend: "80% success rate"
    },
    {
      icon: Clock,
      label: "Focus Time",
      value: "28h",
      trend: "This month"
    },
    {
      icon: Award,
      label: "Achievements",
      value: "15",
      trend: "3 new this week"
    }
  ];

  const wellnessGoals = [
    "Maintain consistent energy levels throughout the day",
    "Improve focus duration in work sessions",
    "Establish regular sleep schedule",
    "Practice daily mindfulness exercises"
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src="/avatars/user.png" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">John Doe</h1>
            <p className="text-muted-foreground">Energy Optimization Enthusiast</p>
          </div>
        </div>
        <Button className="flex items-center gap-2">
          <Edit className="h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {userStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Icon className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-medium">{stat.label}</h3>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-sm text-muted-foreground">{stat.trend}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value="John Doe" readOnly />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value="john.doe@example.com" readOnly />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>San Francisco, CA</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Time Zone</Label>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Pacific Time (PT)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wellness Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Wellness Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {wellnessGoals.map((goal, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>{goal}</span>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4">Add New Goal</Button>
          </div>
        </CardContent>
      </Card>

      {/* Bio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            About Me
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea 
            className="min-h-[100px]"
            value="Passionate about optimizing personal energy and performance. Working in tech and constantly looking for ways to improve focus and productivity while maintaining a healthy work-life balance."
            readOnly
          />
        </CardContent>
      </Card>
    </div>
  );
};
