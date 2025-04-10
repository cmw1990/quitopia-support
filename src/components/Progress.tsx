import React, { useState } from 'react'
import { FocusSessions } from './FocusSessions'

export interface ProgressProps {
  session?: any
}

export const Progress: React.FC<ProgressProps> = ({ session }) => {
  // Mock progress data - in a real app, this would come from an API or database
  const [weeklyData] = useState([
    { day: 'Monday', focusHours: 3.5, tasks: 7, score: 82 },
    { day: 'Tuesday', focusHours: 4.2, tasks: 9, score: 88 },
    { day: 'Wednesday', focusHours: 2.1, tasks: 4, score: 65 },
    { day: 'Thursday', focusHours: 5.0, tasks: 11, score: 92 },
    { day: 'Friday', focusHours: 3.8, tasks: 8, score: 85 },
    { day: 'Saturday', focusHours: 1.5, tasks: 3, score: 70 },
    { day: 'Sunday', focusHours: 2.0, tasks: 4, score: 75 }
  ])

  const [monthlyGoals] = useState([
    { name: 'Focus Hours', current: 22.1, target: 30, unit: 'hours' },
    { name: 'Tasks Completed', current: 46, target: 60, unit: 'tasks' },
    { name: 'Average Focus Score', current: 79.6, target: 85, unit: 'points' },
    { name: 'Distraction-Free Sessions', current: 18, target: 25, unit: 'sessions' }
  ])

  // Calculate totals and averages
  const totalFocusHours = weeklyData.reduce((sum, day) => sum + day.focusHours, 0)
  const totalTasks = weeklyData.reduce((sum, day) => sum + day.tasks, 0)
  const averageScore = weeklyData.reduce((sum, day) => sum + day.score, 0) / weeklyData.length

  const getProgressColor = (percentage: number) => {
    if (percentage < 50) return 'bg-red-500'
    if (percentage < 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="progress max-w-6xl mx-auto">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-2">Your Focus Progress</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Track your focus metrics and see how you're improving over time
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Focus Hours */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">This Week's Focus Time</div>
              <div className="text-3xl font-bold">{totalFocusHours.toFixed(1)} hours</div>
              <div className="text-xs text-green-500">↑ 2.3 hours from last week</div>
            </div>
            
            {/* Tasks Completed */}
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Tasks Completed</div>
              <div className="text-3xl font-bold">{totalTasks}</div>
              <div className="text-xs text-green-500">↑ 8 from last week</div>
            </div>
            
            {/* Average Focus Score */}
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Average Focus Score</div>
              <div className="text-3xl font-bold">{averageScore.toFixed(1)}/100</div>
              <div className="text-xs text-green-500">↑ 5.2 points from last week</div>
            </div>
          </div>
        </div>
        
        {/* Weekly Progress */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Weekly Progress</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Focus Hours Chart */}
            <div>
              <h3 className="text-lg font-medium mb-3">Focus Hours</h3>
              <div className="h-64 flex items-end space-x-2">
                {weeklyData.map((day) => (
                  <div key={day.day} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-blue-500 rounded-t-sm" 
                      style={{ height: `${(day.focusHours / 5) * 100}%` }}
                    ></div>
                    <div className="mt-2 text-xs">
                      {day.day.substring(0, 3)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Focus Score Chart */}
            <div>
              <h3 className="text-lg font-medium mb-3">Focus Score</h3>
              <div className="h-64 flex items-end space-x-2">
                {weeklyData.map((day) => (
                  <div key={day.day} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-purple-500 rounded-t-sm" 
                      style={{ height: `${day.score}%` }}
                    ></div>
                    <div className="mt-2 text-xs">
                      {day.day.substring(0, 3)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Monthly Goals */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Monthly Goals</h2>
          
          <div className="space-y-6">
            {monthlyGoals.map((goal) => {
              const percentage = Math.min(100, (goal.current / goal.target) * 100)
              
              return (
                <div key={goal.name} className="goal-item">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700 dark:text-gray-300">{goal.name}</span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {goal.current} / {goal.target} {goal.unit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${getProgressColor(percentage)}`} 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Recent Focus Sessions */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Your Focus Sessions</h2>
          <FocusSessions />
        </div>
        
        {/* Focus Insights */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Focus Insights</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-medium text-lg mb-2">Your Focus Patterns</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your most productive time is between <span className="font-semibold">9:00 AM - 11:00 AM</span>. 
                Consider scheduling your most important tasks during these hours.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-medium text-lg mb-2">Distraction Analysis</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Social media sites account for <span className="font-semibold">68%</span> of your distractions. 
                Consider using the distraction blocker more consistently.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-medium text-lg mb-2">Energy Correlation</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your focus score tends to drop when you report low energy levels. 
                Try incorporating short active breaks to maintain energy.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-medium text-lg mb-2">Task Completion</h3>
              <p className="text-gray-600 dark:text-gray-300">
                You complete <span className="font-semibold">43% more tasks</span> when using the Pomodoro technique. 
                Consider using it for complex tasks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 