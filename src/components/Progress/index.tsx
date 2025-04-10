import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { toast } from 'sonner';
import { Database } from '@/types/supabase';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface FocusSession {
  id: string;
  user_id: string;
  duration: number;
  completed: boolean;
  created_at: string;
  task_description: string | null;
  focus_score: number | null;
  energy_level: number | null;
}

interface DailyStats {
  date: string;
  totalMinutes: number;
  completedSessions: number;
  averageFocusScore: number;
  averageEnergyLevel: number;
}

export function Progress() {
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [averageFocusScore, setAverageFocusScore] = useState(0);
  const [streakDays, setStreakDays] = useState(0);

  const supabase = useSupabaseClient<Database>();
  const user = useUser();

  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  const loadSessions = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('focus_sessions8')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load focus sessions');
      return;
    }

    if (data) {
      setSessions(data);
      calculateStats(data);
    }
  };

  const calculateStats = (sessions: FocusSession[]) => {
    // Calculate total minutes
    const total = sessions.reduce((acc, session) => acc + session.duration / 60, 0);
    setTotalMinutes(Math.round(total));

    // Calculate completed sessions
    const completed = sessions.filter((s) => s.completed).length;
    setCompletedSessions(completed);

    // Calculate average focus score
    const focusScores = sessions
      .filter((s) => s.focus_score !== null)
      .map((s) => s.focus_score as number);
    const avgFocus =
      focusScores.length > 0
        ? focusScores.reduce((a, b) => a + b, 0) / focusScores.length
        : 0;
    setAverageFocusScore(Math.round(avgFocus * 10) / 10);

    // Calculate streak
    const dates = new Set(
      sessions
        .filter((s) => s.completed)
        .map((s) => new Date(s.created_at).toLocaleDateString())
    );
    let streak = 0;
    const today = new Date();
    let currentDate = today;

    while (dates.has(currentDate.toLocaleDateString())) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
    setStreakDays(streak);

    // Calculate daily stats for chart
    const dailyData: { [key: string]: DailyStats } = {};
    sessions.forEach((session) => {
      const date = new Date(session.created_at).toLocaleDateString();
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          totalMinutes: 0,
          completedSessions: 0,
          averageFocusScore: 0,
          averageEnergyLevel: 0,
        };
      }
      dailyData[date].totalMinutes += session.duration / 60;
      if (session.completed) dailyData[date].completedSessions++;
      if (session.focus_score) {
        dailyData[date].averageFocusScore =
          (dailyData[date].averageFocusScore + session.focus_score) / 2;
      }
      if (session.energy_level) {
        dailyData[date].averageEnergyLevel =
          (dailyData[date].averageEnergyLevel + session.energy_level) / 2;
      }
    });

    setDailyStats(Object.values(dailyData).slice(-30)); // Last 30 days
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Focus Progress</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Focus Time</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalMinutes} mins</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Completed Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{completedSessions}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Average Focus Score</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{averageFocusScore}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{streakDays} days</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Focus Time Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => new Date(date).toLocaleDateString()}
                  />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="totalMinutes"
                    stroke="#3b82f6"
                    name="Minutes"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Focus Score Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => new Date(date).toLocaleDateString()}
                    />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="averageFocusScore"
                      stroke="#10b981"
                      name="Focus Score"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Energy Level Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => new Date(date).toLocaleDateString()}
                    />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="averageEnergyLevel"
                      stroke="#f59e0b"
                      name="Energy Level"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 