import React, { useState } from 'react'

export interface SettingsProps {
  session?: any
}

interface NotificationSetting {
  id: string
  title: string
  description: string
  enabled: boolean
}

export const Settings: React.FC<SettingsProps> = ({ session }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'focus' | 'privacy' | 'account'>('general')
  
  // General settings
  const [darkMode, setDarkMode] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [autoStartBreaks, setAutoStartBreaks] = useState(true)
  const [focusMusic, setFocusMusic] = useState(false)
  
  // Focus settings
  const [pomodoroLength, setPomodoroLength] = useState(25)
  const [shortBreakLength, setShortBreakLength] = useState(5)
  const [longBreakLength, setLongBreakLength] = useState(15)
  const [longBreakInterval, setLongBreakInterval] = useState(4)
  const [strictMode, setStrictMode] = useState(false)
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([
    {
      id: 'pomodoro_end',
      title: 'Pomodoro Timer End',
      description: 'Notify when a pomodoro work session ends',
      enabled: true
    },
    {
      id: 'break_end',
      title: 'Break End',
      description: 'Notify when a break period ends',
      enabled: true
    },
    {
      id: 'task_due',
      title: 'Task Due Reminder',
      description: 'Notify when a task is approaching its due date',
      enabled: true
    },
    {
      id: 'energy_levels',
      title: 'Energy Check-in',
      description: 'Periodic reminders to log your energy levels',
      enabled: false
    },
    {
      id: 'community',
      title: 'Community Updates',
      description: 'Notify about new posts in your focus groups',
      enabled: true
    }
  ])
  
  // Toggle notification setting
  const toggleNotification = (id: string) => {
    setNotificationSettings(notificationSettings.map(setting => 
      setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
    ))
  }
  
  return (
    <div className="settings max-w-4xl mx-auto">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Customize your focus environment and preferences
          </p>
          
          <div className="flex overflow-x-auto space-x-2 pb-2">
            <button 
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${activeTab === 'general' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
              onClick={() => setActiveTab('general')}
            >
              General
            </button>
            <button 
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${activeTab === 'focus' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
              onClick={() => setActiveTab('focus')}
            >
              Focus Settings
            </button>
            <button 
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${activeTab === 'notifications' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
              onClick={() => setActiveTab('notifications')}
            >
              Notifications
            </button>
            <button 
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${activeTab === 'privacy' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
              onClick={() => setActiveTab('privacy')}
            >
              Privacy
            </button>
            <button 
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${activeTab === 'account' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
              onClick={() => setActiveTab('account')}
            >
              Account
            </button>
          </div>
        </div>
        
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">General Settings</h2>
            
            <div className="space-y-6">
              {/* Dark Mode */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Dark Mode</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Switch between dark and light themes</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={darkMode}
                    onChange={() => setDarkMode(!darkMode)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              {/* Auto-start Breaks */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Auto-start Breaks</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Automatically start breaks after focus sessions</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={autoStartBreaks}
                    onChange={() => setAutoStartBreaks(!autoStartBreaks)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              {/* Focus Music */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Focus Music</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Play ambient music during focus sessions</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={focusMusic}
                    onChange={() => setFocusMusic(!focusMusic)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              {/* Language Selection */}
              <div>
                <div className="font-medium mb-2">Language</div>
                <select className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="zh">中文</option>
                </select>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Focus Settings */}
        {activeTab === 'focus' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Focus Settings</h2>
            
            <div className="space-y-6">
              {/* Pomodoro Length */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-medium">Pomodoro Length (minutes)</label>
                  <span>{pomodoroLength} min</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="60" 
                  step="5"
                  value={pomodoroLength}
                  onChange={(e) => setPomodoroLength(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
              </div>
              
              {/* Short Break Length */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-medium">Short Break Length (minutes)</label>
                  <span>{shortBreakLength} min</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="15" 
                  step="1"
                  value={shortBreakLength}
                  onChange={(e) => setShortBreakLength(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
              </div>
              
              {/* Long Break Length */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-medium">Long Break Length (minutes)</label>
                  <span>{longBreakLength} min</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="30" 
                  step="5"
                  value={longBreakLength}
                  onChange={(e) => setLongBreakLength(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
              </div>
              
              {/* Long Break Interval */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-medium">Long Break After (sessions)</label>
                  <span>{longBreakInterval} sessions</span>
                </div>
                <input 
                  type="range" 
                  min="2" 
                  max="6" 
                  step="1"
                  value={longBreakInterval}
                  onChange={(e) => setLongBreakInterval(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
              </div>
              
              {/* Strict Mode */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Strict Mode</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Prevent skipping focus sessions once started</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={strictMode}
                    onChange={() => setStrictMode(!strictMode)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Notification Settings</h2>
            
            <div className="space-y-6">
              {notificationSettings.map(setting => (
                <div key={setting.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{setting.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{setting.description}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={setting.enabled}
                      onChange={() => toggleNotification(setting.id)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Privacy Settings */}
        {activeTab === 'privacy' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Privacy Settings</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Activity Sharing</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Share your focus activity with the community</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    defaultChecked={true}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Data Collection</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Allow anonymous usage data collection for app improvement</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    defaultChecked={true}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Profile Visibility</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Control who can see your profile information</div>
                </div>
                <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                  <option value="public">Everyone</option>
                  <option value="friends">Friends Only</option>
                  <option value="private">Private</option>
                </select>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Account Settings */}
        {activeTab === 'account' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Account Settings</h2>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <div>
                  <div className="font-bold text-lg">User Name</div>
                  <div className="text-gray-500 dark:text-gray-400">user@example.com</div>
                </div>
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Email</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  defaultValue="user@example.com"
                />
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  defaultValue="User Name"
                />
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Update Profile
                </button>
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  Change Password
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 