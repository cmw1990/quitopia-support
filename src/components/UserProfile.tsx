import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../utils/cn'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Camera, Mail, Bell, Clock, Lock, Save, Shield, User, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { useAuth } from './AuthProvider'
import { toast } from 'sonner'
import { userProfileApi, notificationsApi, timerSettingsApi } from '../api/supabase-rest'
import { handleImageError, getSecureImageUrl } from '@/utils/image-utils'

export interface UserProfileProps {
  session?: any
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  date: string
  level: 'bronze' | 'silver' | 'gold' | 'platinum'
}

interface FocusStat {
  label: string
  value: string | number
  change: number
  unit?: string
}

interface MockUserData {
  id: string
  name: string
  email: string
  avatar?: string
  joinDate: string
  bio: string
  location: string
  occupation: string
  focusLevel: string
  socialLinks: {
    twitter: string
    linkedin: string
    github: string
  }
}

export const UserProfile: React.FC<UserProfileProps> = ({ session }) => {
  const { user, session: authSession } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [profileTab, setProfileTab] = useState('overview')
  const [name, setName] = useState(user?.user_metadata?.full_name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [occupation, setOccupation] = useState('')
  const [notifications, setNotifications] = useState({
    email: true,
    browser: true,
    session: true,
    achievement: true
  })
  const [pomoSettings, setPomoSettings] = useState({
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    autoStartBreaks: false,
    autoStartFocus: false,
    sound: true
  })
  
  const [isUpdating, setIsUpdating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Load user profile data
  useEffect(() => {
    if (!user) return
    
    const loadUserData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Load profile data
        const profileData = await userProfileApi.getProfile(user.id, authSession)
        if (profileData) {
          setBio(profileData.bio || '')
          setLocation(profileData.location || '')
          setOccupation(profileData.occupation || '')
        }
        
        // Load notification settings
        const notificationData = await notificationsApi.getNotificationSettings(user.id, authSession)
        if (notificationData) {
          setNotifications({
            email: notificationData.email_notifications || true,
            browser: notificationData.browser_notifications || true,
            session: notificationData.session_notifications || true,
            achievement: notificationData.achievement_notifications || true
          })
        }
        
        // Load timer settings
        const timerData = await timerSettingsApi.getTimerSettings(user.id, authSession)
        if (timerData) {
          setPomoSettings({
            focusDuration: timerData.focus_duration || 25,
            shortBreakDuration: timerData.short_break_duration || 5,
            longBreakDuration: timerData.long_break_duration || 15,
            autoStartBreaks: timerData.auto_start_breaks || false,
            autoStartFocus: timerData.auto_start_focus || false,
            sound: timerData.sound_enabled || true
          })
        }
      } catch (err) {
        console.error('Failed to load user data:', err)
        setError('Failed to load user data. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadUserData()
  }, [user, authSession])
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }
  
  const handleUpdateProfile = async () => {
    if (!user || !authSession) return
    
    setIsUpdating(true)
    
    try {
      // Update profile via Supabase REST API
      await userProfileApi.updateProfile(user.id, {
        bio,
        location,
        occupation,
        updated_at: new Date().toISOString()
      }, authSession)
      
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsUpdating(false)
    }
  }
  
  const handleUpdateNotifications = async () => {
    if (!user || !authSession) return
    
    setIsUpdating(true)
    
    try {
      // Update notification settings via Supabase REST API
      await notificationsApi.updateNotificationSettings(user.id, {
        email_notifications: notifications.email,
        browser_notifications: notifications.browser,
        session_notifications: notifications.session,
        achievement_notifications: notifications.achievement,
        updated_at: new Date().toISOString()
      }, authSession)
      
      toast.success('Notification preferences updated!')
    } catch (error) {
      console.error('Error updating notifications:', error)
      toast.error('Failed to update notification preferences')
    } finally {
      setIsUpdating(false)
    }
  }
  
  const handleUpdatePomoSettings = async () => {
    if (!user || !authSession) return
    
    setIsUpdating(true)
    
    try {
      // Update pomodoro settings via Supabase REST API
      await timerSettingsApi.updateTimerSettings(user.id, {
        focus_duration: pomoSettings.focusDuration,
        short_break_duration: pomoSettings.shortBreakDuration,
        long_break_duration: pomoSettings.longBreakDuration,
        auto_start_breaks: pomoSettings.autoStartBreaks,
        auto_start_focus: pomoSettings.autoStartFocus,
        sound_enabled: pomoSettings.sound,
        updated_at: new Date().toISOString()
      }, authSession)
      
      toast.success('Pomodoro settings updated!')
    } catch (error) {
      console.error('Error updating pomodoro settings:', error)
      toast.error('Failed to update pomodoro settings')
    } finally {
      setIsUpdating(false)
    }
  }
  
  // Mock achievement data
  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'Focus Master',
      description: 'Completed 100 pomodoro sessions',
      icon: '🏆',
      date: '2023-06-15',
      level: 'gold'
    },
    {
      id: '2',
      title: 'Task Conqueror',
      description: 'Completed 500 tasks',
      icon: '✓',
      date: '2023-07-22',
      level: 'silver'
    },
    {
      id: '3',
      title: 'Distraction Warrior',
      description: 'Blocked 1000 distractions',
      icon: '🛡️',
      date: '2023-05-10',
      level: 'platinum'
    },
    {
      id: '4',
      title: 'Early Bird',
      description: 'Completed 20 focus sessions before 9AM',
      icon: '🌅',
      date: '2023-08-03',
      level: 'bronze'
    },
    {
      id: '5',
      title: 'Deep Work Expert',
      description: 'Maintained focus for 3 hours straight',
      icon: '⏱️',
      date: '2023-09-12',
      level: 'gold'
    }
  ]
  
  // Mock focus stats
  const focusStats: FocusStat[] = [
    { label: 'Focus Hours', value: 127.5, change: 12.3, unit: 'hours' },
    { label: 'Tasks Completed', value: 342, change: 23, unit: 'tasks' },
    { label: 'Focus Sessions', value: 215, change: 18, unit: 'sessions' },
    { label: 'Avg. Focus Score', value: 82, change: 5, unit: 'points' }
  ]
  
  const getBadgeColor = (level: 'bronze' | 'silver' | 'gold' | 'platinum') => {
    switch (level) {
      case 'bronze':
        return 'bg-amber-700';
      case 'silver':
        return 'bg-gray-400';
      case 'gold':
        return 'bg-yellow-500';
      case 'platinum':
        return 'bg-indigo-300';
      default:
        return 'bg-gray-200';
    }
  }
  
  if (!user) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>
            Please sign in to view your profile
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }
  
  if (isLoading) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Loading Profile</CardTitle>
          <CardDescription>
            Please wait while we load your profile information...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </CardContent>
      </Card>
    )
  }
  
  if (error) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Error Loading Profile
          </CardTitle>
          <CardDescription>
            {error}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => window.location.reload()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }
  
  // Basic profile view with tabs for profile, notifications, and timer settings
  return (
    <div className="container mx-auto px-4 py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage 
                src={getSecureImageUrl(user.user_metadata?.avatar_url, 'avatar')} 
                onError={(e) => handleImageError(e, 'avatar')}
              />
              <AvatarFallback>{getInitials(name || 'User')}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{name || 'User'}</CardTitle>
              <CardDescription>{email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="profile" className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-1">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">Timer Settings</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                  />
          </div>
          
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      disabled
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Email address cannot be changed. Contact support for assistance.
                  </p>
          </div>
          
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input 
                    id="bio" 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)} 
                    placeholder="Tell us about yourself"
                  />
            </div>
            
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input 
                      id="occupation" 
                      value={occupation} 
                      onChange={(e) => setOccupation(e.target.value)} 
                      placeholder="Your occupation"
                    />
        </div>
        
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input 
                      id="location" 
                      value={location} 
                      onChange={(e) => setLocation(e.target.value)} 
                      placeholder="Your location"
                    />
          </div>
        </div>
        
                <div className="space-y-2">
                  <Label>Profile Picture</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage 
                        src={getSecureImageUrl(user.user_metadata?.avatar_url, 'avatar')} 
                        onError={(e) => handleImageError(e, 'avatar')}
                      />
                      <AvatarFallback>{getInitials(name || 'User')}</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" className="gap-2">
                      <Camera className="h-4 w-4" />
                      Change Avatar
                    </Button>
              </div>
            </div>
            
                <Button 
                  onClick={handleUpdateProfile}
                  disabled={isUpdating}
                  className="gap-2"
                >
                  {isUpdating ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Profile
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive progress reports and tips via email
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Browser Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Show notifications for timers and achievements
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.browser}
                    onCheckedChange={(checked) => setNotifications({...notifications, browser: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Session Completion</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify when focus sessions are completed
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.session}
                    onCheckedChange={(checked) => setNotifications({...notifications, session: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Achievement Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify when you reach new achievements and milestones
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.achievement}
                    onCheckedChange={(checked) => setNotifications({...notifications, achievement: checked})}
                  />
                </div>
                
                <Button 
                  onClick={handleUpdateNotifications}
                  disabled={isUpdating}
                  className="gap-2"
                >
                  {isUpdating ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4" />
                      Save Notification Preferences
                    </>
                  )}
                </Button>
            </div>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Pomodoro Timer Settings</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="focus-duration">Focus Duration (minutes)</Label>
                    <Input 
                      id="focus-duration" 
                      type="number" 
                      min="1"
                      max="120"
                      value={pomoSettings.focusDuration} 
                      onChange={(e) => setPomoSettings({
                        ...pomoSettings, 
                        focusDuration: parseInt(e.target.value) || 25
                      })} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="short-break">Short Break (minutes)</Label>
                    <Input 
                      id="short-break" 
                      type="number" 
                      min="1"
                      max="30"
                      value={pomoSettings.shortBreakDuration} 
                      onChange={(e) => setPomoSettings({
                        ...pomoSettings, 
                        shortBreakDuration: parseInt(e.target.value) || 5
                      })} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="long-break">Long Break (minutes)</Label>
                    <Input 
                      id="long-break" 
                      type="number" 
                      min="1"
                      max="60"
                      value={pomoSettings.longBreakDuration} 
                      onChange={(e) => setPomoSettings({
                        ...pomoSettings, 
                        longBreakDuration: parseInt(e.target.value) || 15
                      })} 
                    />
                  </div>
                </div>
                
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-start Breaks</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically start breaks after focus sessions
                      </p>
                    </div>
                    <Switch 
                      checked={pomoSettings.autoStartBreaks}
                      onCheckedChange={(checked) => setPomoSettings({
                        ...pomoSettings, 
                        autoStartBreaks: checked
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-start Focus</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically start focus sessions after breaks
                      </p>
                  </div>
                    <Switch 
                      checked={pomoSettings.autoStartFocus}
                      onCheckedChange={(checked) => setPomoSettings({
                        ...pomoSettings, 
                        autoStartFocus: checked
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Timer Sound</Label>
                      <p className="text-sm text-muted-foreground">
                        Play sound when timer completes
                      </p>
                        </div>
                    <Switch 
                      checked={pomoSettings.sound}
                      onCheckedChange={(checked) => setPomoSettings({
                        ...pomoSettings, 
                        sound: checked
                      })}
                    />
                </div>
              </div>
              
                <Button 
                  onClick={handleUpdatePomoSettings}
                  disabled={isUpdating}
                  className="gap-2"
                >
                  {isUpdating ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Timer Settings
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Your data is secure and private</span>
              </div>
              
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <a href="#" className="hover:underline">
              Manage Account Security
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
} 