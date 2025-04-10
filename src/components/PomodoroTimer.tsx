import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../utils/cn'

export interface PomodoroTimerProps {
  session?: any
  onSessionComplete?: (sessionData: any) => void
}

type TimerMode = 'work' | 'shortBreak' | 'longBreak' | 'paused'

interface TimerSettings {
  workMinutes: number
  shortBreakMinutes: number
  longBreakMinutes: number
  sessionsUntilLongBreak: number
  autoStartBreaks: boolean
  autoStartWork: boolean
  soundEnabled: boolean
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ 
  session,
  onSessionComplete
}) => {
  // Timer settings
  const [settings, setSettings] = useState<TimerSettings>({
    workMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    sessionsUntilLongBreak: 4,
    autoStartBreaks: true,
    autoStartWork: true,
    soundEnabled: true
  })
  
  // Timer state
  const [mode, setMode] = useState<TimerMode>('paused')
  const [secondsLeft, setSecondsLeft] = useState(settings.workMinutes * 60)
  const [isActive, setIsActive] = useState(false)
  const [completedSessions, setCompletedSessions] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [currentTask, setCurrentTask] = useState('')
  const [sessionHistory, setSessionHistory] = useState<Array<{
    mode: TimerMode,
    duration: number,
    completed: boolean,
    task?: string,
    timestamp: string
  }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [todayStats, setTodayStats] = useState({
    totalFocusMinutes: 0,
    sessionsCompleted: 0,
    streak: 0
  })
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  }
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  }
  
  // Refs
  const timerRef = useRef<number | null>(null)
  const startSoundRef = useRef<HTMLAudioElement | null>(null)
  const stopSoundRef = useRef<HTMLAudioElement | null>(null)
  const tickSoundRef = useRef<HTMLAudioElement | null>(null)
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null)
  
  // Initialize audio (will only work if user has interacted with the page)
  useEffect(() => {
    startSoundRef.current = new Audio('/sounds/start.mp3')
    stopSoundRef.current = new Audio('/sounds/complete.mp3')
    tickSoundRef.current = new Audio('/sounds/tick.mp3')
    
    // Load session history from local storage if available
    const savedHistory = localStorage.getItem('pomodoroSessionHistory')
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory)
        setSessionHistory(history)
        
        // Calculate today's stats
        calculateTodayStats(history)
      } catch (e) {
        console.error('Error loading session history:', e)
      }
    }
    
    // Load user settings if available
    const savedSettings = localStorage.getItem('pomodoroSettings')
    if (savedSettings) {
      try {
        const userSettings = JSON.parse(savedSettings)
        setSettings(prev => ({ ...prev, ...userSettings }))
      } catch (e) {
        console.error('Error loading settings:', e)
      }
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])
  
  // Save session history to local storage when it changes
  useEffect(() => {
    if (sessionHistory.length > 0) {
      localStorage.setItem('pomodoroSessionHistory', JSON.stringify(sessionHistory))
      calculateTodayStats(sessionHistory)
    }
  }, [sessionHistory])
  
  // Save settings to local storage when they change
  useEffect(() => {
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings))
  }, [settings])
  
  // Calculate today's statistics
  const calculateTodayStats = (history: typeof sessionHistory) => {
    const today = new Date().toISOString().split('T')[0]
    const todaySessions = history.filter(session => 
      session.timestamp.startsWith(today) && session.completed && session.mode === 'work'
    )
    
    const totalMinutes = todaySessions.reduce((total, session) => total + session.duration, 0) / 60
    let streak = 0
    
    // Calculate current streak (consecutive days with completed sessions)
    const uniqueDays = new Set<string>()
    history.forEach(session => {
      if (session.completed && session.mode === 'work') {
        uniqueDays.add(session.timestamp.split('T')[0])
      }
    })
    
    const sortedDays = Array.from(uniqueDays).sort().reverse()
    if (sortedDays.length > 0) {
      streak = 1
      for (let i = 0; i < sortedDays.length - 1; i++) {
        const current = new Date(sortedDays[i])
        const prev = new Date(sortedDays[i + 1])
        const diffTime = Math.abs(current.getTime() - prev.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        if (diffDays === 1) {
          streak++
        } else {
          break
        }
      }
    }
    
    setTodayStats({
      totalFocusMinutes: Math.round(totalMinutes),
      sessionsCompleted: todaySessions.length,
      streak: streak
    })
  }
  
  // Save session to database if authenticated
  const saveSessionToDatabase = async (sessionData: {
    mode: TimerMode,
    duration: number,
    task?: string
  }) => {
    if (!session?.user) return

    try {
      setIsLoading(true)
      
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase URL or Key is missing');
        return;
      }

      // Construct the correct URL
      const response = await fetch(`${supabaseUrl}/rest/v1/pomodoro_sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          user_id: session.user.id,
          mode: sessionData.mode,
          duration_minutes: Math.round(sessionData.duration / 60),
          task: sessionData.task || null,
          completed: true,
          created_at: new Date().toISOString()
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to save session')
      }
      
      // Show success animation
      if (sessionData.mode === 'work') {
        triggerConfetti()
      }
      
    } catch (error) {
      console.error('Error saving session:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Trigger confetti animation on session completion
  const triggerConfetti = () => {
    setShowConfetti(true)
    
    try {
      if (typeof window !== 'undefined') {
        // Dynamically import confetti to avoid SSR issues
        import('canvas-confetti').then(confetti => {
          const canvas = confettiCanvasRef.current
          if (canvas) {
            confetti.default({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#ff0000', '#00ff00', '#0000ff']
            })
          }
        })
      }
    } catch (e) {
      console.error('Error with confetti:', e)
    }
    
    setTimeout(() => {
      setShowConfetti(false)
    }, 3000)
  }
  
  // Update timer when settings change
  useEffect(() => {
    if (mode === 'work') {
      setSecondsLeft(settings.workMinutes * 60)
    } else if (mode === 'shortBreak') {
      setSecondsLeft(settings.shortBreakMinutes * 60)
    } else if (mode === 'longBreak') {
      setSecondsLeft(settings.longBreakMinutes * 60)
    }
  }, [settings, mode])
  
  // Timer logic
  useEffect(() => {
    if (!isActive) return
    
    if (timerRef.current) clearInterval(timerRef.current)
    
    if (settings.soundEnabled && mode !== 'paused') {
      startSoundRef.current?.play().catch(e => console.warn('Audio playback prevented:', e))
    }
    
    timerRef.current = window.setInterval(() => {
      setSecondsLeft(prev => {
        // Play tick sound at 3, 2, 1 seconds
        if (prev <= 3 && prev > 0 && settings.soundEnabled) {
          tickSoundRef.current?.play().catch(e => console.warn('Audio playback prevented:', e))
        }
        
        if (prev <= 1) {
          clearInterval(timerRef.current as number)
          
          // Timer completed
          if (settings.soundEnabled) {
            stopSoundRef.current?.play().catch(e => console.warn('Audio playback prevented:', e))
          }
          
          // Handle session completion
          if (mode === 'work') {
            const newCompletedSessions = completedSessions + 1
            setCompletedSessions(newCompletedSessions)
            
            // Record completed session
            const sessionData = {
              mode: mode,
              duration: settings.workMinutes * 60,
              completed: true,
              task: currentTask,
              timestamp: new Date().toISOString()
            }
            
            setSessionHistory(prev => [sessionData, ...prev])
            saveSessionToDatabase(sessionData)
            
            // Notify parent component
            onSessionComplete?.({
              mode: 'work',
              duration: settings.workMinutes,
              task: currentTask,
              timestamp: new Date().toISOString()
            })
            
            // Determine next break type
            const isLongBreakDue = newCompletedSessions % settings.sessionsUntilLongBreak === 0
            const nextMode = isLongBreakDue ? 'longBreak' : 'shortBreak'
            
            // Auto start break if enabled
            if (settings.autoStartBreaks) {
              setMode(nextMode)
              setIsActive(true)
            } else {
              setMode('paused')
              setIsActive(false)
            }
          } else {
            // Break completed
            const sessionData = {
              mode: mode,
              duration: mode === 'shortBreak' ? settings.shortBreakMinutes * 60 : settings.longBreakMinutes * 60,
              completed: true,
              timestamp: new Date().toISOString()
            }
            
            setSessionHistory(prev => [sessionData, ...prev])
            
            onSessionComplete?.({
              mode: mode,
              duration: mode === 'shortBreak' ? settings.shortBreakMinutes : settings.longBreakMinutes,
              timestamp: new Date().toISOString()
            })
            
            // Auto start work if enabled
            if (settings.autoStartWork) {
              setMode('work')
              setIsActive(true)
            } else {
              setMode('paused')
              setIsActive(false)
            }
          }
          
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isActive, mode, settings, completedSessions, onSessionComplete, currentTask, session])
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  // Calculate progress percentage
  const calculateProgress = (): number => {
    let totalSeconds
    
    if (mode === 'work') {
      totalSeconds = settings.workMinutes * 60
    } else if (mode === 'shortBreak') {
      totalSeconds = settings.shortBreakMinutes * 60
    } else if (mode === 'longBreak') {
      totalSeconds = settings.longBreakMinutes * 60
    } else {
      return 0
    }
    
    return ((totalSeconds - secondsLeft) / totalSeconds) * 100
  }
  
  // Start timer with specific mode
  const startTimer = (timerMode: TimerMode) => {
    setMode(timerMode)
    setIsActive(true)
    
    if (timerMode === 'work') {
      setSecondsLeft(settings.workMinutes * 60)
    } else if (timerMode === 'shortBreak') {
      setSecondsLeft(settings.shortBreakMinutes * 60)
    } else if (timerMode === 'longBreak') {
      setSecondsLeft(settings.longBreakMinutes * 60)
    }
  }
  
  // Pause timer
  const pauseTimer = () => {
    setIsActive(false)
  }
  
  // Resume timer
  const resumeTimer = () => {
    setIsActive(true)
  }
  
  // Reset timer
  const resetTimer = () => {
    setIsActive(false)
    
    if (mode === 'work') {
      setSecondsLeft(settings.workMinutes * 60)
    } else if (mode === 'shortBreak') {
      setSecondsLeft(settings.shortBreakMinutes * 60)
    } else if (mode === 'longBreak') {
      setSecondsLeft(settings.longBreakMinutes * 60)
    }
  }
  
  // Skip to next timer
  const skipTimer = () => {
    if (mode === 'work') {
      const nextMode = (completedSessions + 1) % settings.sessionsUntilLongBreak === 0 
        ? 'longBreak' 
        : 'shortBreak'
      startTimer(nextMode)
    } else {
      startTimer('work')
    }
  }
  
  // Get color based on current mode
  const getModeColor = () => {
    switch (mode) {
      case 'work':
        return 'from-red-500 to-orange-500 dark:from-red-600 dark:to-orange-600'
      case 'shortBreak':
        return 'from-green-500 to-teal-500 dark:from-green-600 dark:to-teal-600'
      case 'longBreak':
        return 'from-blue-500 to-indigo-500 dark:from-blue-600 dark:to-indigo-600'
      default:
        return 'from-gray-500 to-gray-400 dark:from-gray-600 dark:to-gray-500'
    }
  }
  
  // Handle settings update
  const updateSettings = (newSettings: Partial<TimerSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }))
  }
  
  return (
    <div className="pomodoro-timer max-w-md mx-auto">
      {showConfetti && (
        <canvas
          ref={confettiCanvasRef}
          className="fixed inset-0 w-full h-full pointer-events-none z-50"
        />
      )}
      
      <motion.div 
        className="flex flex-col space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Timer Display */}
        <motion.div 
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
          variants={itemVariants}
        >
          {/* Mode Selection */}
          <div className="flex justify-between mb-6">
            <button 
              className={cn("px-3 py-1 rounded-md text-sm font-medium", 
                mode === 'work'
                  ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              )}
              onClick={(e) => {
                e.stopPropagation();
                startTimer('work');
              }}
            >
              Focus
            </button>
            <button 
              className={cn("px-3 py-1 rounded-md text-sm font-medium", 
                mode === 'shortBreak'
                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              )}
              onClick={(e) => {
                e.stopPropagation();
                startTimer('shortBreak');
              }}
            >
              Short Break
            </button>
            <button 
              className={cn("px-3 py-1 rounded-md text-sm font-medium", 
                mode === 'longBreak'
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              )}
              onClick={(e) => {
                e.stopPropagation();
                startTimer('longBreak');
              }}
            >
              Long Break
            </button>
          </div>
          
          {/* Current Task Input */}
          {mode === 'work' && (
            <div className="mb-6">
              <input
                type="text"
                placeholder="What are you working on?"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                value={currentTask}
                onChange={(e) => setCurrentTask(e.target.value)}
                disabled={isActive}
              />
            </div>
          )}
          
          {/* Timer Circle */}
          <div className="flex justify-center mb-6">
            <div className="relative w-64 h-64">
              {/* Background Circle */}
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  className="text-gray-200 dark:text-gray-700 stroke-current"
                  strokeWidth="4"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                />
                
                {/* Progress Circle */}
                <motion.circle
                  className={cn("stroke-current", 
                    mode === 'work' 
                      ? "text-red-500 dark:text-red-400"
                      : mode === 'shortBreak'
                        ? "text-green-500 dark:text-green-400"
                        : "text-blue-500 dark:text-blue-400"
                  )}
                  strokeWidth="4"
                  strokeLinecap="round"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * calculateProgress()) / 100}
                  animate={{
                    strokeDashoffset: 251.2 - (251.2 * calculateProgress()) / 100
                  }}
                  transition={{
                    duration: 0.5
                  }}
                />
              </svg>
              
              {/* Timer Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-5xl font-bold">{formatTime(secondsLeft)}</div>
                <div className="text-sm font-medium mt-2 capitalize">
                  {mode === 'paused' ? 'Ready to Start' : mode.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </div>
              </div>
            </div>
          </div>
          
          {/* Session Indicators */}
          <div className="flex justify-center space-x-2 mb-6">
            {Array.from({ length: settings.sessionsUntilLongBreak }).map((_, index) => (
              <div 
                key={index}
                className={cn("w-3 h-3 rounded-full", 
                  index < (completedSessions % settings.sessionsUntilLongBreak)
                    ? "bg-blue-500 dark:bg-blue-400"
                    : "bg-gray-300 dark:bg-gray-600"
                )}
              />
            ))}
          </div>
          
          {/* Controls */}
          <div className="flex justify-center space-x-4">
            {isActive ? (
              <button
                className="flex items-center justify-center w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  pauseTimer();
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            ) : secondsLeft === (
              mode === 'work' 
                ? settings.workMinutes * 60 
                : mode === 'shortBreak' 
                  ? settings.shortBreakMinutes * 60 
                  : settings.longBreakMinutes * 60
            ) ? (
              <button
                className="flex items-center justify-center w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  resumeTimer();
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            ) : (
              <div className="flex space-x-4">
                <button
                  className="flex items-center justify-center w-12 h-12 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetTimer();
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                
                <button
                  className="flex items-center justify-center w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    resumeTimer();
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            )}
            
            {mode !== 'paused' && (
              <button
                className="flex items-center justify-center w-12 h-12 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  skipTimer();
                }}
                title="Skip to next"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </motion.div>
        
        {/* Settings */}
        <motion.div 
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
          variants={itemVariants}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Timer Settings</h2>
            <button
              className="text-blue-500 dark:text-blue-400 hover:underline text-sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowSettings(!showSettings);
              }}
            >
              {showSettings ? 'Hide Settings' : 'Show Settings'}
            </button>
          </div>
          
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Time Settings */}
              <div>
                <label className="block text-sm font-medium mb-1">Focus Length (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  value={settings.workMinutes}
                  onChange={(e) => updateSettings({ workMinutes: parseInt(e.target.value) || 25 })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Short Break Length (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  value={settings.shortBreakMinutes}
                  onChange={(e) => updateSettings({ shortBreakMinutes: parseInt(e.target.value) || 5 })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Long Break Length (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  value={settings.longBreakMinutes}
                  onChange={(e) => updateSettings({ longBreakMinutes: parseInt(e.target.value) || 15 })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Sessions Until Long Break</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  value={settings.sessionsUntilLongBreak}
                  onChange={(e) => updateSettings({ sessionsUntilLongBreak: parseInt(e.target.value) || 4 })}
                />
              </div>
              
              {/* Behavior Settings */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-medium">Auto-start Breaks</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Automatically start breaks after focus sessions</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.autoStartBreaks}
                      onChange={(e) => updateSettings({ autoStartBreaks: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-medium">Auto-start Work</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Automatically start focus sessions after breaks</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.autoStartWork}
                      onChange={(e) => updateSettings({ autoStartWork: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Sound Notifications</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Play sounds for timer events</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.soundEnabled}
                      onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
        
        {/* Session Stats */}
        <motion.div 
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
          variants={itemVariants}
        >
          <h2 className="text-xl font-bold mb-4">Today's Progress</h2>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <motion.div 
              className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-2xl font-bold">{todayStats.sessionsCompleted}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Sessions</div>
            </motion.div>
            
            <motion.div 
              className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-2xl font-bold">{todayStats.totalFocusMinutes}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Minutes</div>
            </motion.div>
            
            <motion.div 
              className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-2xl font-bold">{todayStats.streak}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Day Streak</div>
            </motion.div>
          </div>
          
          {/* Recent sessions */}
          {sessionHistory.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Recent Sessions</h3>
              <div className="max-h-32 overflow-y-auto pr-2">
                {sessionHistory.slice(0, 5).map((session, index) => (
                  <div 
                    key={index}
                    className="text-xs py-1 border-b border-gray-100 dark:border-gray-700 flex justify-between"
                  >
                    <span className="capitalize">
                      {session.mode === 'work' 
                        ? `Focus${session.task ? `: ${session.task.substring(0, 20)}${session.task.length > 20 ? '...' : ''}` : ''}` 
                        : `${session.mode === 'shortBreak' ? 'Short' : 'Long'} Break`
                      }
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {Math.round(session.duration / 60)} min • {new Date(session.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
} 