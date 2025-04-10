import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { addEnergyMetric, getEnergyMetrics } from '@/lib/api';
import { useUser } from '@/hooks/useUser';
import { Timer } from 'lucide-react';

const SESSION_TYPES = [
  { value: 'meditation', label: 'Meditation' },
  { value: 'breathing', label: 'Breathing Exercise' },
  { value: 'yoga', label: 'Yoga' },
  { value: 'journaling', label: 'Journaling' },
  { value: 'gratitude', label: 'Gratitude Practice' }
] as const;

const MOODS = [
  'Anxious',
  'Stressed',
  'Neutral',
  'Calm',
  'Peaceful',
  'Energized',
  'Focused'
] as const;

export function MindfulnessTracker() {
  const { user } = useUser();
  const [sessions, setSessions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeSession, setActiveSession] = React.useState(false);
  const [sessionType, setSessionType] = React.useState<string>(SESSION_TYPES[0].value);
  const [duration, setDuration] = React.useState(0);
  const [focusLevel, setFocusLevel] = React.useState(80);
  const [moodBefore, setMoodBefore] = React.useState<string>(MOODS[2]);
  const [timer, setTimer] = React.useState(0);
  const timerRef = React.useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const loadSessions = async () => {
    try {
      const data = await getEnergyMetrics(user!.id);
      setSessions(data.filter(metric => metric.type === 'focus'));
    } catch (error) {
      console.error('Error loading mindfulness sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const startSession = () => {
    setActiveSession(true);
    setTimer(0);
    timerRef.current = setInterval(() => {
      setTimer(prev => prev + 1);
      setDuration(prev => prev + 1);
    }, 1000);
  };

  const endSession = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setActiveSession(false);

    try {
      await addEnergyMetric({
        user_id: user!.id,
        type: 'focus',
        value: focusLevel,
        notes: `${sessionType} session - Duration: ${Math.floor(duration / 60)}m ${duration % 60}s, Mood: ${moodBefore}`,
        timestamp: new Date().toISOString()
      });
      loadSessions();
    } catch (error) {
      console.error('Error saving mindfulness session:', error);
    }

    setDuration(0);
    setTimer(0);
  };

  if (loading) {
    return <div>Loading mindfulness data...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mindfulness Session</CardTitle>
          <CardDescription>Track your mindfulness practice</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Session Type</Label>
              <Select
                value={sessionType}
                onValueChange={setSessionType}
                disabled={activeSession}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SESSION_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Current Mood</Label>
              <Select
                value={moodBefore}
                onValueChange={setMoodBefore}
                disabled={activeSession}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOODS.map(mood => (
                    <SelectItem key={mood} value={mood}>
                      {mood}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {activeSession ? (
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <Timer className="w-8 h-8 mx-auto" />
                  <div className="text-2xl font-semibold">
                    {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Focus Level</Label>
                  <Slider
                    value={[focusLevel]}
                    onValueChange={([value]) => setFocusLevel(value)}
                    min={0}
                    max={100}
                    step={1}
                  />
                  <div className="text-sm text-gray-500">
                    {focusLevel} / 100
                  </div>
                </div>

                <Button onClick={endSession} variant="destructive" className="w-full">
                  End Session
                </Button>
              </div>
            ) : (
              <Button onClick={startSession} className="w-full">
                Start Session
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session History</CardTitle>
          <CardDescription>Your mindfulness journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.map((session, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="font-medium">{session.notes}</div>
                <div className="text-sm text-gray-500">
                  Focus Level: {session.value}/100
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(session.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
