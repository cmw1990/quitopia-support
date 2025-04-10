import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { toast } from 'sonner';
import { Database } from '@/types/supabase';

interface CommunityMember {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  focus_time_total?: number;
  is_body_doubling?: boolean;
}

export function Community() {
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [activeBodyDoubles, setActiveBodyDoubles] = useState<CommunityMember[]>([]);
  const [isJoiningBodyDouble, setIsJoiningBodyDouble] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = useSupabaseClient<Database>();
  const user = useUser();

  useEffect(() => {
    if (user) {
      loadCommunityMembers();
      loadActiveBodyDoubles();
    }
  }, [user]);

  const loadCommunityMembers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      toast.error('Failed to load community members');
      return;
    }

    if (data) {
      // Simulate some members having different statuses and focus time totals
      const membersWithStatus = data.map((profile) => ({
        ...profile,
        status: ['online', 'offline', 'away', 'busy'][Math.floor(Math.random() * 4)] as 'online' | 'offline' | 'away' | 'busy',
        focus_time_total: Math.floor(Math.random() * 1000) * 60, // in seconds
      }));
      
      setMembers(membersWithStatus);
    }
    
    setIsLoading(false);
  };

  const loadActiveBodyDoubles = async () => {
    // Simulated body doubling data
    // In a real app, you would query a separate table for active body doubling sessions
    const activeUsers = members
      .filter((member) => member.status === 'online')
      .slice(0, 5)
      .map(member => ({
        ...member,
        is_body_doubling: true
      }));
    
    setActiveBodyDoubles(activeUsers);
  };

  const joinBodyDoublingSession = () => {
    setIsJoiningBodyDouble(true);
    
    // Simulate joining a session
    setTimeout(() => {
      toast.success('Joined body doubling session! Others can now see you working.');
      setIsJoiningBodyDouble(false);
    }, 1500);
  };

  const formatFocusTime = (seconds: number = 0) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Focus Community</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Active Body Doubling Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                {activeBodyDoubles.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      No active body doubling sessions at the moment.
                    </p>
                    <Button onClick={joinBodyDoublingSession} disabled={isJoiningBodyDouble}>
                      {isJoiningBodyDouble ? 'Joining...' : 'Start a Session'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeBodyDoubles.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between border-b border-border last:border-0 pb-4 last:pb-0"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            {member.avatar_url ? (
                              <img
                                src={member.avatar_url}
                                alt={member.full_name || 'User'}
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <span>{(member.full_name || 'U').charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{member.full_name || 'Anonymous User'}</p>
                            <p className="text-sm text-muted-foreground">
                              Currently focusing
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Join Session
                        </Button>
                      </div>
                    ))}
                    <div className="mt-4 text-center">
                      <Button onClick={joinBodyDoublingSession} disabled={isJoiningBodyDouble}>
                        {isJoiningBodyDouble ? 'Joining...' : 'Start My Own Session'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Community Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members
                    .sort((a, b) => (b.focus_time_total || 0) - (a.focus_time_total || 0))
                    .slice(0, 10)
                    .map((member, index) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between border-b border-border last:border-0 pb-4 last:pb-0"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="w-5 text-center font-medium">{index + 1}</span>
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            {member.avatar_url ? (
                              <img
                                src={member.avatar_url}
                                alt={member.full_name || 'User'}
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <span>{(member.full_name || 'U').charAt(0)}</span>
                            )}
                          </div>
                          <p className="font-medium">{member.full_name || 'Anonymous User'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatFocusTime(member.focus_time_total)}</p>
                          <p className="text-xs text-muted-foreground">Total focus time</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Body Doubling 101</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-1">What is Body Doubling?</h3>
                  <p className="text-sm text-muted-foreground">
                    Body doubling is when another person works alongside you, helping you 
                    stay focused and accountable.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Benefits</h3>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>Increased accountability</li>
                    <li>Reduced procrastination</li>
                    <li>Improved focus and attention</li>
                    <li>Decreased feelings of isolation</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">How to Use</h3>
                  <p className="text-sm text-muted-foreground">
                    Join an active session or start your own. Turn on your webcam (optional) 
                    and work alongside others in real-time.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Community Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Focus Marathon</h3>
                    <p className="text-sm text-muted-foreground mb-1">
                      Tomorrow, 2:00 PM - 5:00 PM
                    </p>
                    <p className="text-sm">
                      Join our community focus marathon with 25-minute focus sessions 
                      and 5-minute breaks.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">ADHD Support Group</h3>
                    <p className="text-sm text-muted-foreground mb-1">
                      Saturday, 11:00 AM - 12:00 PM
                    </p>
                    <p className="text-sm">
                      Weekly support group for discussing ADHD challenges and strategies.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Productivity Workshop</h3>
                    <p className="text-sm text-muted-foreground mb-1">
                      Next Monday, 7:00 PM - 8:30 PM
                    </p>
                    <p className="text-sm">
                      Learn advanced focus techniques and time management strategies.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 