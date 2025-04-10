import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Users, Video, Mic, MicOff, VideoOff, Clock } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { focusDb } from '@/lib/focus-db';

interface SessionParticipant {
  id: string;
  name: string;
  isHost: boolean;
  videoEnabled: boolean;
  audioEnabled: boolean;
}

interface SessionSettings {
  duration: number;
  taskDescription: string;
  allowChat: boolean;
  showTimer: boolean;
  breakReminders: boolean;
}

export const BodyDoublingSession: React.FC = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isInSession, setIsInSession] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [settings, setSettings] = useState<SessionSettings>({
    duration: 25,
    taskDescription: '',
    allowChat: true,
    showTimer: true,
    breakReminders: true,
  });

  // Load session participants
  const { data: participants = [] } = useQuery({
    queryKey: ['body-doubling-participants'],
    queryFn: () => focusDb.getSessionParticipants(),
    enabled: isInSession,
  });

  // Load session settings
  const { data: savedSettings } = useQuery({
    queryKey: ['body-doubling-settings'],
    queryFn: () => focusDb.getBodyDoublingSettings(),
    onSuccess: (data) => {
      if (data) {
        setSettings(data);
      }
    },
  });

  // Join session
  const joinSession = useMutation({
    mutationFn: async () => {
      await focusDb.joinBodyDoublingSession({
        taskDescription: settings.taskDescription,
        videoEnabled,
        audioEnabled,
      });
    },
    onSuccess: () => {
      setIsInSession(true);
      toast({
        title: 'Joined Session',
        description: 'You have joined the body doubling session.',
      });
      queryClient.invalidateQueries({ queryKey: ['body-doubling-participants'] });
    },
  });

  // Leave session
  const leaveSession = useMutation({
    mutationFn: async () => {
      await focusDb.leaveBodyDoublingSession();
    },
    onSuccess: () => {
      setIsInSession(false);
      setElapsedTime(0);
      toast({
        title: 'Left Session',
        description: 'You have left the body doubling session.',
      });
      queryClient.invalidateQueries({ queryKey: ['body-doubling-participants'] });
    },
  });

  // Update settings
  const updateSettings = useMutation({
    mutationFn: async (newSettings: SessionSettings) => {
      await focusDb.updateBodyDoublingSettings(newSettings);
    },
    onSuccess: () => {
      toast({
        title: 'Settings Updated',
        description: 'Your session settings have been saved.',
      });
      queryClient.invalidateQueries({ queryKey: ['body-doubling-settings'] });
    },
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInSession) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInSession]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSettingChange = (key: keyof SessionSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    updateSettings.mutate(newSettings);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Body Doubling Session
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isInSession ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Task Description</Label>
              <Input
                value={settings.taskDescription}
                onChange={(e) => handleSettingChange('taskDescription', e.target.value)}
                placeholder="What are you working on?"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Session Duration (minutes)</Label>
                <Input
                  type="number"
                  value={settings.duration}
                  onChange={(e) => handleSettingChange('duration', parseInt(e.target.value))}
                  className="w-20"
                  min={5}
                  max={120}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Allow Chat</Label>
                <Switch
                  checked={settings.allowChat}
                  onCheckedChange={(checked) => handleSettingChange('allowChat', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Show Timer</Label>
                <Switch
                  checked={settings.showTimer}
                  onCheckedChange={(checked) => handleSettingChange('showTimer', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Break Reminders</Label>
                <Switch
                  checked={settings.breakReminders}
                  onCheckedChange={(checked) => handleSettingChange('breakReminders', checked)}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setVideoEnabled(!videoEnabled)}
              >
                {videoEnabled ? (
                  <Video className="h-4 w-4" />
                ) : (
                  <VideoOff className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setAudioEnabled(!audioEnabled)}
              >
                {audioEnabled ? (
                  <Mic className="h-4 w-4" />
                ) : (
                  <MicOff className="h-4 w-4" />
                )}
              </Button>
              <Button
                className="flex-1"
                onClick={() => joinSession.mutate()}
                disabled={!settings.taskDescription}
              >
                Join Session
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-mono">{formatTime(elapsedTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setVideoEnabled(!videoEnabled)}
                >
                  {videoEnabled ? (
                    <Video className="h-4 w-4" />
                  ) : (
                    <VideoOff className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setAudioEnabled(!audioEnabled)}
                >
                  {audioEnabled ? (
                    <Mic className="h-4 w-4" />
                  ) : (
                    <MicOff className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => leaveSession.mutate()}
                >
                  Leave Session
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {participants.map((participant: SessionParticipant) => (
                <Card key={participant.id} className="bg-primary/5">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {participant.name}
                        {participant.isHost && (
                          <span className="ml-2 text-xs text-primary">(Host)</span>
                        )}
                      </span>
                      <div className="flex items-center gap-2">
                        {participant.videoEnabled ? (
                          <Video className="h-4 w-4" />
                        ) : (
                          <VideoOff className="h-4 w-4" />
                        )}
                        {participant.audioEnabled ? (
                          <Mic className="h-4 w-4" />
                        ) : (
                          <MicOff className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
