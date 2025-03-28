import React from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { User, Mail, Calendar, MapPin, Award } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const session = useSession();
  const { user } = useAuth();
  
  // Placeholder achievements data
  const achievements = [
    { title: "1 Week Smoke-Free", completed: true, date: "2024-03-15" },
    { title: "1 Month Milestone", completed: true, date: "2024-04-01" },
    { title: "Track 10 Cravings", completed: true, date: "2024-03-20" },
    { title: "3 Month Milestone", completed: false, date: null },
    { title: "Log 30 Days", completed: true, date: "2024-04-05" },
  ];
  
  const userEmail = user?.email || session?.user?.email || "user@example.com";
  const userName = user?.user_metadata?.full_name || session?.user?.user_metadata?.full_name || "User";
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Info */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Personal Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-6">
              <Avatar className="h-24 w-24 mb-4">
                <span className="text-2xl font-bold">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </Avatar>
              <h2 className="text-xl font-bold">{userName}</h2>
              <div className="flex items-center text-muted-foreground mt-1">
                <Mail className="h-4 w-4 mr-1" />
                {userEmail}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 mr-2 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Member Since</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Location</h3>
                  <p className="text-sm text-muted-foreground">
                    Not specified
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Achievements */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center p-3 border rounded-lg">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 
                    ${achievement.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {achievement.completed ? (
                      <Award className="h-5 w-5" />
                    ) : (
                      <Award className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{achievement.title}</h3>
                    {achievement.completed ? (
                      <p className="text-sm text-green-600">
                        Completed on {new Date(achievement.date!).toLocaleDateString()}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Not yet completed
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage; 