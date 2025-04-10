import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  BatteryWarning,
  Plus,
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
import { supabaseGet, supabasePost } from '@/lib/supabaseApiService'

interface EnergyLevel {
  id: string
  level: number
  notes: string
  created_at: string
  user_id: string
}

const activities = [
  'Work',
  'Study',
  'Exercise',
  'Rest',
  'Social',
  'Entertainment',
  'Chores',
  'Other',
] as const

type Activity = (typeof activities)[number]

const energyActivities = [
  {
    id: 1,
    title: 'Quick Walk',
    description: 'A 5-minute walk can boost energy and clear your mind',
    energyImpact: 'Medium',
    timeRequired: '5 mins',
  },
  {
    id: 2,
    title: 'Stretching',
    description: 'Simple stretches to release tension and increase blood flow',
    energyImpact: 'Medium',
    timeRequired: '3 mins',
  },
  {
    id: 3,
    title: 'Deep Breathing',
    description: 'Focused breathing exercises to increase oxygen and energy',
    energyImpact: 'Low',
    timeRequired: '2 mins',
  },
  {
    id: 4,
    title: 'Water Break',
    description: 'Hydration is essential for maintaining energy levels',
    energyImpact: 'Low',
    timeRequired: '1 min',
  },
  {
    id: 5,
    title: 'Power Nap',
    description: 'A short nap can restore alertness and productivity',
    energyImpact: 'High',
    timeRequired: '20 mins',
  },
  {
    id: 6,
    title: 'Light Exercise',
    description: 'Jump jacks, push-ups, or squats to get your blood pumping',
    energyImpact: 'High',
    timeRequired: '10 mins',
  },
];

const EnergySupport: React.FC = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [currentLevel, setCurrentLevel] = React.useState(5)
  const [energyLevel, setEnergyLevel] = useState(3);
  const [selectedActivities, setSelectedActivities] = useState<number[]>([]);

  const { data: energyLevels, isLoading } = useQuery({
    queryKey: ['energy-levels', user?.id],
    queryFn: async () => {
      const { data, error } = await supabaseGet<EnergyLevel>(
        'energy_levels',
        `user_id=eq.${user?.id}&order=created_at.asc`
      );

      if (error) {
        toast.error('Failed to load energy levels')
        throw error
      }

      return data || [];
    },
    enabled: !!user,
  })

  const addEnergyLevelMutation = useMutation({
    mutationFn: async (level: number) => {
      const { error } = await supabasePost<EnergyLevel>(
        'energy_levels',
        [{
          level,
          user_id: user?.id,
        }]
      );

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['energy-levels'] })
      toast.success('Energy level recorded')
    },
    onError: () => {
      toast.error('Failed to record energy level')
    },
  })

  const chartData = energyLevels?.map((entry: EnergyLevel) => ({
    time: format(new Date(entry.created_at), 'HH:mm'),
    level: entry.level,
  }))

  const toggleActivity = (id: number) => {
    if (selectedActivities.includes(id)) {
      setSelectedActivities(selectedActivities.filter((activityId) => activityId !== id));
    } else {
      setSelectedActivities([...selectedActivities, id]);
    }
  };

  const getEnergyLevelColor = () => {
    if (energyLevel <= 2) return 'text-red-500';
    if (energyLevel <= 4) return 'text-yellow-500';
    return 'text-green-500';
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-bold">Please sign in to access Energy Support</h1>
        <Button>Sign In</Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Energy Support</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Energy Level</CardTitle>
          <CardDescription>
            How are your energy levels right now? (1-10)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Slider
            value={[currentLevel]}
            onValueChange={([value]) => setCurrentLevel(value)}
            min={1}
            max={10}
            step={1}
          />
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Low Energy</span>
            <span className="text-sm text-muted-foreground">High Energy</span>
          </div>
          <Button
            className="w-full"
            onClick={() => addEnergyLevelMutation.mutate(currentLevel)}
            disabled={addEnergyLevelMutation.isPending}
          >
            Record Energy Level
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Energy Level History</CardTitle>
          <CardDescription>
            Track your energy levels throughout the day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={[1, 10]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="level"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Energy Level</CardTitle>
          <CardDescription>How are you feeling right now?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <span>Low</span>
            <div className="flex-1 flex justify-between">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => setEnergyLevel(level)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all ${
                    level === energyLevel
                      ? 'bg-primary text-primary-foreground scale-110'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <span>High</span>
          </div>
          <p className={`text-center font-medium ${getEnergyLevelColor()}`}>
            Your current energy level is {energyLevel}/5
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommended Energy Boosters</CardTitle>
          <CardDescription>
            Activities to help maintain or increase your energy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {energyActivities.map((activity) => (
              <div
                key={activity.id}
                className={`border rounded-lg p-4 transition-all ${
                  selectedActivities.includes(activity.id)
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/50'
                }`}
              >
                <div className="flex justify-between">
                  <h3 className="font-medium">{activity.title}</h3>
                  <div className="flex items-center space-x-2 text-sm">
                    <span
                      className={`px-2 py-0.5 rounded-full ${
                        activity.energyImpact === 'High'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : activity.energyImpact === 'Medium'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}
                    >
                      {activity.energyImpact}
                    </span>
                    <span className="bg-secondary px-2 py-0.5 rounded-full">
                      {activity.timeRequired}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                <Button
                  variant={selectedActivities.includes(activity.id) ? 'default' : 'outline'}
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => toggleActivity(activity.id)}
                >
                  {selectedActivities.includes(activity.id) ? 'Selected' : 'Select'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedActivities.length > 0 && (
        <div className="flex justify-end">
          <Button size="lg">
            Start Energy Routine ({selectedActivities.length} activities)
          </Button>
        </div>
      )}
    </div>
  )
}

export default EnergySupport 