import React, { useState } from 'react'
import { 
  LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts'

export interface AnalyticsProps {
  session?: any
}

// Sample data - this would come from the user's actual focus data in production
const weeklyFocusData = [
  { day: 'Mon', hours: 3.5, sessionsCompleted: 7 },
  { day: 'Tue', hours: 5.2, sessionsCompleted: 11 },
  { day: 'Wed', hours: 4.1, sessionsCompleted: 8 },
  { day: 'Thu', hours: 6.3, sessionsCompleted: 12 },
  { day: 'Fri', hours: 4.8, sessionsCompleted: 10 },
  { day: 'Sat', hours: 2.5, sessionsCompleted: 5 },
  { day: 'Sun', hours: 1.2, sessionsCompleted: 3 }
]

const monthlyFocusData = [
  { week: 'Week 1', hours: 22.4, sessionsCompleted: 45 },
  { week: 'Week 2', hours: 25.7, sessionsCompleted: 51 },
  { week: 'Week 3', hours: 18.9, sessionsCompleted: 38 },
  { week: 'Week 4', hours: 27.1, sessionsCompleted: 55 }
]

const taskCategoryData = [
  { name: 'Work', value: 42 },
  { name: 'Study', value: 28 },
  { name: 'Personal', value: 15 },
  { name: 'Health', value: 10 },
  { name: 'Other', value: 5 }
]

const timeOfDayData = [
  { time: '6AM-9AM', hours: 5.2 },
  { time: '9AM-12PM', hours: 10.7 },
  { time: '12PM-3PM', hours: 7.3 },
  { time: '3PM-6PM', hours: 12.9 },
  { time: '6PM-9PM', hours: 8.5 },
  { time: '9PM-12AM', hours: 3.9 }
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD']

export const Analytics: React.FC<AnalyticsProps> = ({ session }) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week')
  const [viewType, setViewType] = useState<'overview' | 'detailed'>('overview')
  
  // Calculated metrics
  const totalFocusHours = weeklyFocusData.reduce((acc, day) => acc + day.hours, 0)
  const totalSessions = weeklyFocusData.reduce((acc, day) => acc + day.sessionsCompleted, 0)
  const averageSessionLength = totalFocusHours / totalSessions
  const mostProductiveDay = [...weeklyFocusData].sort((a, b) => b.hours - a.hours)[0]
  
  return (
    <div className="analytics max-w-6xl mx-auto">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-2">Focus Analytics</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Track your focus habits and productivity over time
          </p>
          
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex space-x-2">
              <button 
                className={`px-4 py-2 rounded-lg ${timeRange === 'week' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                onClick={() => setTimeRange('week')}
              >
                Week
              </button>
              <button 
                className={`px-4 py-2 rounded-lg ${timeRange === 'month' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                onClick={() => setTimeRange('month')}
              >
                Month
              </button>
              <button 
                className={`px-4 py-2 rounded-lg ${timeRange === 'year' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                onClick={() => setTimeRange('year')}
              >
                Year
              </button>
            </div>
            
            <div className="flex space-x-2">
              <button 
                className={`px-4 py-2 rounded-lg ${viewType === 'overview' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                onClick={() => setViewType('overview')}
              >
                Overview
              </button>
              <button 
                className={`px-4 py-2 rounded-lg ${viewType === 'detailed' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                onClick={() => setViewType('detailed')}
              >
                Detailed
              </button>
            </div>
          </div>
        </div>
        
        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-blue-600 dark:text-blue-400 text-sm font-semibold uppercase mb-2">
              Focus Time
            </div>
            <div className="flex items-end">
              <div className="text-3xl font-bold">{totalFocusHours.toFixed(1)}</div>
              <div className="text-lg ml-1 mb-0.5">hours</div>
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              Last {timeRange}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-green-600 dark:text-green-400 text-sm font-semibold uppercase mb-2">
              Sessions Completed
            </div>
            <div className="flex items-end">
              <div className="text-3xl font-bold">{totalSessions}</div>
              <div className="text-lg ml-1 mb-0.5">sessions</div>
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              Last {timeRange}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-purple-600 dark:text-purple-400 text-sm font-semibold uppercase mb-2">
              Avg. Session Length
            </div>
            <div className="flex items-end">
              <div className="text-3xl font-bold">{averageSessionLength.toFixed(1)}</div>
              <div className="text-lg ml-1 mb-0.5">minutes</div>
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              {((averageSessionLength - 20) / 20 * 100).toFixed(1)}% above target
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-orange-600 dark:text-orange-400 text-sm font-semibold uppercase mb-2">
              Most Productive
            </div>
            <div className="flex items-end">
              <div className="text-3xl font-bold">{mostProductiveDay.day}</div>
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              {mostProductiveDay.hours.toFixed(1)} hours, {mostProductiveDay.sessionsCompleted} sessions
            </div>
          </div>
        </div>
        
        {/* Main Charts */}
        {viewType === 'overview' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Focus Hours Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Focus Hours</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={timeRange === 'week' ? weeklyFocusData : monthlyFocusData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={timeRange === 'week' ? 'day' : 'week'} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="hours" 
                      stroke="#0088FE" 
                      strokeWidth={2} 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Sessions Completed Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Sessions Completed</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={timeRange === 'week' ? weeklyFocusData : monthlyFocusData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={timeRange === 'week' ? 'day' : 'week'} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sessionsCompleted" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Categories */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Task Categories</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={taskCategoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {taskCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Time of Day Productivity */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Time of Day Productivity</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={timeOfDayData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="hours" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
        
        {/* Focus Insights */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Focus Insights</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 rounded">
              <h3 className="font-bold text-blue-700 dark:text-blue-300">Peak Productivity Time</h3>
              <p className="text-blue-800 dark:text-blue-200">Your most productive hours are between 9AM-12PM. Consider scheduling your most demanding tasks during this time.</p>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 rounded">
              <h3 className="font-bold text-green-700 dark:text-green-300">Focus Habit Streak</h3>
              <p className="text-green-800 dark:text-green-200">You've maintained a 12-day streak of completing at least 3 focus sessions per day. Great work!</p>
            </div>
            
            <div className="p-4 bg-purple-50 dark:bg-purple-900/30 border-l-4 border-purple-500 rounded">
              <h3 className="font-bold text-purple-700 dark:text-purple-300">Weekly Progress</h3>
              <p className="text-purple-800 dark:text-purple-200">You've increased your focus time by 15% compared to last week. Keep up the momentum!</p>
            </div>
          </div>
        </div>
        
        {/* Focus Goals */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Focus Goals</h2>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Set New Goal
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Daily Focus Time: 4 hours</span>
                <span className="text-green-600 dark:text-green-400">78% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Weekly Sessions: 35 sessions</span>
                <span className="text-yellow-600 dark:text-yellow-400">54% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-yellow-600 h-2.5 rounded-full" style={{ width: '54%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Monthly Deep Work: 80 hours</span>
                <span className="text-blue-600 dark:text-blue-400">62% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '62%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 