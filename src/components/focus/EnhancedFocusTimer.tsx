import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Play, Pause, RotateCcw, Check, Settings, Volume2, Volume, ChevronUp, ChevronDown, Clock, List, BarChart2, AlertTriangle, Trash, PlusCircle, Coffee, Brain, Move, Droplets, Footprints, Wind, Eye, Star, ChevronRight, SkipForward, Music, Volume1, VolumeX, Loader2, AlertCircle, Hand, Frown, Meh, Smile, Zap, Plus, CheckCheck // Added missing icons
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format as formatFn, parseISO, differenceInHours } from 'date-fns';
import { useAuth } from '@/providers/auth-provider';
import { supabaseRequest } from '@/utils/supabaseRequest';
import { focusSessionsApi, tasksApi, distractionLogsApi, settingsApi, achievementsApi } from '@/api/supabase-rest'; // Ensure all needed APIs are imported
import { Task, TaskPriority } from '@/app/tasks/page'; // Use Task definition from TaskManagerPage
import { Session, TimerMode } from '@/types/session';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { produce } from 'immer';
import type { LucideProps } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useNavigate } from 'react-router-dom';
import { handleError } from '@/utils/error-handler'; // Ensure handleError is imported

// --- Helper Functions ---
const formatTime = (seconds: number): string => { const m=Math.floor(seconds/60); const s=seconds%60; return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`; };
const triggerConfetti = () => { const d=3*1000; const end=Date.now()+d; const def={startVelocity:30,spread:360,ticks:60,zIndex:100}; const r=(min:number,max:number)=>Math.random()*(max-min)+min; const i=setInterval(()=>{const left=end-Date.now(); if(left<=0)return clearInterval(i); const pC=50*(left/d); confetti({...def,particleCount:pC,origin:{x:r(0.1,0.3),y:Math.random()-0.2}}); confetti({...def,particleCount:pC,origin:{x:r(0.7,0.9),y:Math.random()-0.2}});},250); };
function debounce<F extends (...args: any[]) => any>(func: F, wait: number): (...args: Parameters<F>) => void { let tId:ReturnType<typeof setTimeout>|null=null; return function(this:ThisParameterType<F>,...args:Parameters<F>){ const ctx=this; if(tId)clearTimeout(tId); tId=setTimeout(()=>{func.apply(ctx,args);},wait);}; }
const calculateProgress = (currentTimeLeft: number, durationSeconds: number): number => { if (durationSeconds <= 0) return 0; const elapsed = durationSeconds - currentTimeLeft; return Math.min(100, Math.max(0, (elapsed / durationSeconds) * 100)); };

// --- Type Definitions ---
// Define TaskStatus locally if not exported/imported reliably
type TaskStatus = 'todo' | 'in_progress' | 'completed';

interface TimerSettings { focusTime: number; shortBreakTime: number; longBreakTime: number; longBreakInterval: number; autoStartBreaks: boolean; autoStartPomodoros: boolean; enabledSounds: boolean; alarmVolume: number; enabledSoundscapes: boolean; soundscapeVolume: number; selectedSoundscapeId: string | null; defaultFocusTechnique?: string; blockDistractions?: boolean; trackFocusMetrics?: boolean; theme?: 'light' | 'dark' | 'system'; notifications?: { enabled?: boolean; sound?: boolean }; }
interface FocusSettingsDbRecord extends TimerSettings { id: string; user_id: string; created_at: string; updated_at?: string; }
interface LoggedDistraction { id: string; description: string; timestamp: number; session_id?: string; user_id?: string; created_at?: string; trigger?: string | null; feeling?: string | null; }
interface BreakActivity { id: string; title: string; description: string; icon: React.FC<LucideProps>; }
interface Soundscape { id: string; name: string; filePath: string; }
interface AchievementDefinition { key: string; condition: (task: Task) => boolean; name: string; description: string; category?: string; }

// Props Interface
interface EnhancedFocusTimerProps {
  initialTaskId?: string | null;
  initialTaskTitle?: string | null; // Keep for potential display
}

// --- Constants ---
const defaultTimerSettings: TimerSettings = { focusTime: 25, shortBreakTime: 5, longBreakTime: 15, longBreakInterval: 4, autoStartBreaks: false, autoStartPomodoros: false, enabledSounds: true, alarmVolume: 50, enabledSoundscapes: false, soundscapeVolume: 60, selectedSoundscapeId: null, defaultFocusTechnique: 'pomodoro', blockDistractions: true, trackFocusMetrics: true, theme: 'system', notifications: { enabled: true, sound: true }, };
const breakActivities: BreakActivity[] = [ { id: 'stretch', title: 'Stretch', description: 'Loosen muscles.', icon: Move }, { id: 'hydrate', title: 'Hydrate', description: 'Drink water.', icon: Droplets }, { id: 'walk', title: 'Walk', description: 'Get blood flowing.', icon: Footprints }, { id: 'breathe', title: 'Breathe', description: 'Relax mind.', icon: Wind }, { id: 'look_away', title: 'Look Away', description: 'Rest eyes.', icon: Eye }, ];
const ADAPTIVE_SETTINGS = { ENABLED: true, SESSION_HISTORY_COUNT: 5, LOW_QUALITY_THRESHOLD: 3, HIGH_QUALITY_THRESHOLD: 4, REDUCTION_FACTOR: 0.8, INCREASE_FACTOR: 1.1, MIN_FOCUS_TIME: 15, MAX_FOCUS_TIME: 45 };
const availableSoundscapes: Soundscape[] = [ { id: 'none', name: 'None', filePath: '' }, { id: 'rain', name: 'Gentle Rain', filePath: '/sounds/rain.mp3' }, { id: 'whitenoise', name: 'White Noise', filePath: '/sounds/whitenoise.mp3' }, { id: 'forest', name: 'Forest Ambience', filePath: '/sounds/forest.mp3' }, ];

// =======================================
// EnhancedFocusTimer Component Definition
// =======================================
const EnhancedFocusTimer = ({ initialTaskId, initialTaskTitle }: EnhancedFocusTimerProps) => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const userId = user?.id;

  // --- State Declarations ---
  const [mode, setMode] = useState<TimerMode>('focus');
  const [settings, setSettings] = useState<TimerSettings>(defaultTimerSettings);
  const [currentFocusTime, setCurrentFocusTime] = useState<number>(defaultTimerSettings.focusTime);
  const [timeLeft, setTimeLeft] = useState<number>(defaultTimerSettings.focusTime * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [completedPomodoros, setCompletedPomodoros] = useState<number>(0);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [lastCompletedSessionId, setLastCompletedSessionId] = useState<string | null>(null);
  const [sessionHistory, setSessionHistory] = useState<Session[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [isMutatingSession, setIsMutatingSession] = useState(false);
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(initialTaskId || null);
  const [isTasksLoading, setIsTasksLoading] = useState<boolean>(true);
  const [distractions, setDistractions] = useState<LoggedDistraction[]>([]);
  const [newDistractionText, setNewDistractionText] = useState<string>('');
  const [newDistractionTrigger, setNewDistractionTrigger] = useState<string>('');
  const [newDistractionFeeling, setNewDistractionFeeling] = useState<string>('');
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const [focusQualityRating, setFocusQualityRating] = useState<number | null>(null);
  const [showSettingsDialog, setShowSettingsDialog] = useState<boolean>(false);
  const [settingsDbId, setSettingsDbId] = useState<string | null>(null);
  const [isSettingsLoading, setIsSettingsLoading] = useState<boolean>(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('timer');
  const [showDistractionDialog, setShowDistractionDialog] = useState<boolean>(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState<boolean>(false);
  const [suggestedActivity, setSuggestedActivity] = useState<BreakActivity | null>(null);
  const [isSoundscapePlaying, setIsSoundscapePlaying] = useState<boolean>(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => (typeof window !== 'undefined' && 'Notification' in window) ? Notification.permission : 'default');

  // --- Refs ---
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null);
  const soundscapeAudioRef = useRef<HTMLAudioElement | null>(null);
  const startTimerFnRef = useRef<() => Promise<void>>();
  const handleSessionCompleteFnRef = useRef<() => Promise<void>>();

   // --- Achievement Logic ---
   const checkAndAwardTaskAchievements = useCallback(async (completedTaskId: string, userId: string) => {
    if (!userId) return;
    const task = availableTasks.find(t=>t.id===completedTaskId);
    if (!task) return;
    const checks: AchievementDefinition[] = [
        { key: 'task_complete_1', condition:()=>true, name:"First Task Done!", description:"Completed your first task.", category: 'tasks' },
        { key: 'task_complete_high_priority', condition:(t)=>t.priority==='high', name:"Priority Slayer", description:"Completed a high-priority task.", category: 'tasks' }
    ];
    let existing: any[] = []; try { existing = await achievementsApi.getUserAchievements(userId); } catch(e){console.error(e);}
    const doneKeys = new Set(existing.filter(a=>a.completed).map(a=>a.achievement_key));
    for (const ach of checks) { if (!doneKeys.has(ach.key) && ach.condition(task)) { try { const p = { user_id:userId, achievement_key:ach.key, name:ach.name, description:ach.description, category:ach.category||'tasks', completed:true, completion_date:new Date().toISOString(), progress:100 }; await achievementsApi.createOrUpdateAchievement(p); toast({title:"🏆 Achievement!", description:ach.name}); doneKeys.add(ach.key); } catch(e){handleError(e,'AchieveErr');} }}
  }, [availableTasks, toast, user?.id]);

  // --- Data Fetching ---
  const loadAvailableTasks = useCallback(async () => { if (!userId) return; setIsTasksLoading(true); try { const all = (await tasksApi.getTasks(userId)) || []; const incomplete = all.filter((t: Task) => t.status !== 'completed'); setAvailableTasks(incomplete); } catch (e:any) { console.error("Task load fail:", e); toast({ title:"Error Loading Tasks", description: e.message, variant:"destructive"}); } finally {setIsTasksLoading(false);} }, [userId, toast]);
  const loadSessionHistory = useCallback(async () => { if (!userId) return; setIsHistoryLoading(true); setHistoryError(null); try { const h = await focusSessionsApi.getRecent(userId, 50); setSessionHistory(h.sort((a,b)=>new Date(b.start_time).getTime()-new Date(a.start_time).getTime())); } catch (e:any) { const msg = `History load fail: ${e.message}`; setHistoryError(msg); toast({title:"Error Loading History", description:msg, variant:"destructive"}); } finally {setIsHistoryLoading(false);} }, [userId, toast]);
  const determineAdaptedFocusTime = useCallback(async (): Promise<number> => { let baseTime=settings.focusTime; if (!userId||!ADAPTIVE_SETTINGS.ENABLED) return baseTime; try { const path = `/rest/v1/focus_sessions8?user_id=eq.${userId}&select=focus_quality_rating&status=eq.completed&focus_quality_rating=not.is.null&order=end_time.desc&limit=${ADAPTIVE_SETTINGS.SESSION_HISTORY_COUNT}`; const {data:rec, error} = await supabaseRequest<Session[]>(path,{method:'GET'}); if(error||!rec||rec.length<ADAPTIVE_SETTINGS.SESSION_HISTORY_COUNT){ return baseTime; } const ratings = rec.map(s=>s.focus_quality_rating).filter(r=>r!=null) as number[]; if(ratings.length<ADAPTIVE_SETTINGS.SESSION_HISTORY_COUNT){ return baseTime;} const avg=ratings.reduce((s,r)=>s+r,0)/ratings.length; let adapted=baseTime; if(avg<ADAPTIVE_SETTINGS.LOW_QUALITY_THRESHOLD) adapted=Math.max(ADAPTIVE_SETTINGS.MIN_FOCUS_TIME, Math.round(baseTime*ADAPTIVE_SETTINGS.REDUCTION_FACTOR)); else if(avg>=ADAPTIVE_SETTINGS.HIGH_QUALITY_THRESHOLD) adapted=Math.min(ADAPTIVE_SETTINGS.MAX_FOCUS_TIME, Math.round(baseTime*ADAPTIVE_SETTINGS.INCREASE_FACTOR)); return adapted; } catch(e){console.error("Adapt Err:",e); return baseTime;} }, [userId, settings.focusTime]);
  const loadSettingsAndAdapt = useCallback(async () => { if (!userId) { setIsSettingsLoading(false); setSettings(defaultTimerSettings); setCurrentFocusTime(defaultTimerSettings.focusTime); if(!isActive)setTimeLeft(defaultTimerSettings.focusTime*60); return; } setIsSettingsLoading(true); setSettingsError(null); try { const r=await settingsApi.getSettings(userId); let loaded=produce(defaultTimerSettings,d=>{if(r){(Object.keys(r) as Array<keyof TimerSettings>).forEach(k=>{if(k!=='notifications'&&k in d&&r[k]!==undefined)(d as any)[k]=r[k];}); if(r.notifications){if(r.notifications.enabled!==undefined)d.notifications!.enabled=r.notifications.enabled; if(r.notifications.sound!==undefined)d.notifications!.sound=r.notifications.sound;}}}); setSettings(loaded); setSettingsDbId(r?.id||null); const adapted=await determineAdaptedFocusTime(); setCurrentFocusTime(adapted); if(!isActive){ let durS=adapted*60; if(mode==='shortBreak')durS=loaded.shortBreakTime*60; else if(mode==='longBreak')durS=loaded.longBreakTime*60; setTimeLeft(durS);}} catch(e:any){console.error(e); setSettingsError("Fail load settings."); setSettings(defaultTimerSettings); setCurrentFocusTime(defaultTimerSettings.focusTime); if(!isActive)setTimeLeft(defaultTimerSettings.focusTime*60);} finally {setIsSettingsLoading(false);}}, [userId, isActive, determineAdaptedFocusTime, mode]);

  // --- Core Timer Logic ---
  const handleTimerTick = useCallback(() => { setTimeLeft(prev => { if (prev <= 1) { handleSessionCompleteFnRef.current?.(); return 0; } return prev - 1; }); }, []);
  const getCurrentDurationSeconds = useCallback((): number => { switch(mode){ case 'focus': return currentFocusTime*60; case 'shortBreak': return settings.shortBreakTime*60; case 'longBreak': return settings.longBreakTime*60; default: return settings.focusTime*60; }}, [mode, currentFocusTime, settings]);
  const playAlarmSound = useCallback(() => { if(settings.enabledSounds&&alarmAudioRef.current){alarmAudioRef.current.volume=settings.alarmVolume/100; alarmAudioRef.current.play().catch(e=>console.error("Alarm play err:",e));}}, [settings.enabledSounds, settings.alarmVolume]);
  const requestNotificationPermission = useCallback(async()=>{ if(!('Notification' in window)){toast({title:"No Notifications", variant:"destructive"}); setNotificationPermission('denied'); return;} if(notificationPermission!=='default')return; try{ const p=await Notification.requestPermission(); setNotificationPermission(p); if(p==='granted')toast({title:"Notifications On"}); else toast({title:"Notifications Off", variant:"destructive"});} catch(e){console.error(e); toast({title:"Error", description:"Notify perm error.", variant:"destructive"});}},[notificationPermission, toast]);
  const showNotification = useCallback((title:string,body:string)=>{ if(notificationPermission==='granted'&&settings.notifications?.enabled){new Notification(title,{body,icon:'/vite.svg'});}},[notificationPermission, settings.notifications]);

  // --- Session Handling ---
  const handleSessionComplete = useCallback(async () => {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsActive(false);
      playAlarmSound();
      triggerConfetti();

      const previousMode = mode;
      let nextMode: TimerMode = 'focus';
      let nextPomodoros = completedPomodoros;
      const sessionEndTime = new Date().toISOString();
      const sessionDurationSeconds = getCurrentDurationSeconds() - timeLeft;

      if (previousMode === 'focus' && currentSessionId) {
          setIsMutatingSession(true);
          setLastCompletedSessionId(currentSessionId);
          try {
              await focusSessionsApi.update(currentSessionId, {
                  status: 'completed',
                  end_time: sessionEndTime,
                  duration_seconds: sessionDurationSeconds > 0 ? sessionDurationSeconds : 0,
                  completed: true
              });
              console.log(`Focus session ${currentSessionId} completed and saved.`);
              loadSessionHistory();
          } catch (e: any) {
              console.error("Error saving completed session:", e);
              toast({ title: "Error Saving Session", description: e.message, variant: "destructive" });
          } finally {
              setIsMutatingSession(false);
          }

          if (settings.defaultFocusTechnique === 'pomodoro') {
              nextPomodoros++;
              setCompletedPomodoros(nextPomodoros);
              nextMode = (nextPomodoros % settings.longBreakInterval === 0) ? 'longBreak' : 'shortBreak';
              setSuggestedActivity(breakActivities[Math.floor(Math.random() * breakActivities.length)]);
              setShowCompletionDialog(true);
          } else {
              nextMode = 'focus';
              setMode(nextMode);
              const nextFocusDuration = (await determineAdaptedFocusTime()) * 60;
              setCurrentFocusTime(nextFocusDuration / 60);
              setTimeLeft(nextFocusDuration);
              setShowCompletionDialog(true);
          }

      } else { // Break ended
          nextMode = 'focus';
          setSuggestedActivity(null);
          if (currentSessionId) {
              console.warn("Session ID was present at the end of a break:", currentSessionId);
              setCurrentSessionId(null);
          }

          setMode(nextMode);
          const nextFocusDuration = (await determineAdaptedFocusTime()) * 60;
          setCurrentFocusTime(nextFocusDuration / 60);
          setTimeLeft(nextFocusDuration);
          showNotification("Break Over!", "Time to get back to focus.");

          if (settings.autoStartPomodoros) {
              requestAnimationFrame(() => {
                  startTimerFnRef.current?.();
              });
          } else {
              setIsActive(false);
          }
      }

  }, [
      playAlarmSound, mode, currentSessionId, completedPomodoros, settings,
      getCurrentDurationSeconds, determineAdaptedFocusTime, toast, loadSessionHistory,
      showNotification, timeLeft
  ]);

  const startTimer = useCallback(async () => {
      if (!userId || authLoading) { toast({ title: "Authentication Required", description:"Please wait or log in.", variant: "destructive" }); return; }
      if (isActive || isMutatingSession) return;

      let currentDurationSeconds = getCurrentDurationSeconds();
      if (timeLeft <= 0) {
          setTimeLeft(currentDurationSeconds);
      }

      if (mode === 'focus' && !currentSessionId) {
          setIsMutatingSession(true);
          try {
              const sessionData = { user_id: userId, start_time: new Date().toISOString(), status: 'active' as const, initial_mode: mode, focus_time_setting: currentFocusTime, task_id: selectedTaskId || null, completed: false };
              const created = await focusSessionsApi.create(sessionData);
              if (created?.id) {
                  setCurrentSessionId(created.id);
                  console.log("Started new focus session:", created.id);
              } else {
                  throw new Error("Failed to create session in database (no ID returned).");
              }
          } catch (e: unknown) {
              console.error("Failed to start session:", e);
              const errorMessage = e instanceof Error ? e.message : String(e);
              toast({ title: "Database Error", description: `Could not start session: ${errorMessage}`, variant: "destructive" });
              setIsMutatingSession(false);
              return;
          } finally {
              setIsMutatingSession(false);
          }
      } else if (mode !== 'focus' && currentSessionId) {
           console.warn("Clearing session ID before starting break:", currentSessionId);
           setCurrentSessionId(null);
      }

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(handleTimerTick, 1000);
      setIsActive(true);

  }, [
      userId, authLoading, isActive, mode, currentSessionId, toast, isMutatingSession,
      selectedTaskId, currentFocusTime, handleTimerTick, getCurrentDurationSeconds, timeLeft
  ]);
  const pauseTimer = useCallback(() => {
      if (!isActive) return;
      setIsActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
      console.log("Timer paused");
  }, [isActive]);

  const playSelectedSoundscape = useCallback(() => {
      if (!settings.enabledSoundscapes || !settings.selectedSoundscapeId || settings.selectedSoundscapeId === 'none') return;
      const soundscape = availableSoundscapes.find(s => s.id === settings.selectedSoundscapeId);
      if (soundscape?.filePath) {
          if (!soundscapeAudioRef.current) {
              soundscapeAudioRef.current = new Audio(soundscape.filePath);
              soundscapeAudioRef.current.loop = true;
          } else if (soundscapeAudioRef.current.src !== `${window.location.origin}${soundscape.filePath}`) {
              soundscapeAudioRef.current.pause();
              soundscapeAudioRef.current.src = soundscape.filePath;
              soundscapeAudioRef.current.load();
          }
          soundscapeAudioRef.current.volume = settings.soundscapeVolume / 100;
          soundscapeAudioRef.current.play().then(() => {
              setIsSoundscapePlaying(true);
          }).catch(e => console.error("Soundscape play error:", e));
      } else {
           if (soundscapeAudioRef.current) {
                soundscapeAudioRef.current.pause();
                setIsSoundscapePlaying(false);
            }
      }
  }, [settings.enabledSoundscapes, settings.selectedSoundscapeId, settings.soundscapeVolume]);

  const pauseSoundscape = useCallback(() => {
      if (soundscapeAudioRef.current) {
          soundscapeAudioRef.current.pause();
      }
      setIsSoundscapePlaying(false);
  }, []);

  const toggleSoundscape = useCallback(() => {
      if (isSoundscapePlaying) {
          pauseSoundscape();
      } else {
          playSelectedSoundscape();
      }
  }, [isSoundscapePlaying, playSelectedSoundscape, pauseSoundscape]);

  const resetTimer = useCallback(async () => {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsActive(false);

      if (mode === 'focus' && currentSessionId) {
          setIsMutatingSession(true);
          const sessionIdToCancel = currentSessionId;
          setCurrentSessionId(null);
          try {
              const duration = getCurrentDurationSeconds() - timeLeft;
              await focusSessionsApi.update(sessionIdToCancel, { status: 'cancelled', completed: false, end_time: new Date().toISOString(), duration_seconds: duration > 0 ? duration : 0 });
              console.log("Cancelled session:", sessionIdToCancel);
              loadSessionHistory();
          } catch (e: any) {
              console.error("Error cancelling session:", e);
              toast({ title: "Database Error", description: `Failed to cancel session: ${e.message}`, variant: "destructive" });
          } finally {
              setIsMutatingSession(false);
          }
      } else if (currentSessionId) {
          setCurrentSessionId(null);
      }

      setMode('focus');
      const baseFocusTime = settings.focusTime;
      setCurrentFocusTime(baseFocusTime);
      setTimeLeft(baseFocusTime * 60);
      setCompletedPomodoros(0);

      setShowCompletionDialog(false);
      setDistractions([]);
      setSessionNotes('');
      setFocusQualityRating(null);
      setSuggestedActivity(null);
      setSelectedTaskId(initialTaskId || null);
      pauseSoundscape();

  }, [
      mode, currentSessionId, timeLeft, settings.focusTime, getCurrentDurationSeconds,
      toast, loadSessionHistory, initialTaskId, pauseSoundscape
  ]);
  const skipSession = useCallback(async () => {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsActive(false);
      playAlarmSound();

      const previousMode = mode;
      let nextMode: TimerMode = 'focus';
      let nextPomodoros = completedPomodoros;

      if (previousMode === 'focus' && currentSessionId) {
          setIsMutatingSession(true);
          const sessionIdToSkip = currentSessionId;
          setCurrentSessionId(null);
          try {
              const duration = getCurrentDurationSeconds() - timeLeft;
              await focusSessionsApi.update(sessionIdToSkip, { status: 'skipped', completed: false, end_time: new Date().toISOString(), duration_seconds: duration > 0 ? duration : 0 });
              console.log("Skipped session:", sessionIdToSkip);
              loadSessionHistory();
          } catch (e: any) {
              console.error("Error skipping session:", e);
              toast({ title: "Database Error", description: `Failed to skip session: ${e.message}`, variant: "destructive" });
          } finally {
              setIsMutatingSession(false);
          }
          if (settings.defaultFocusTechnique === 'pomodoro') {
              nextPomodoros++;
              setCompletedPomodoros(nextPomodoros);
              nextMode = (nextPomodoros % settings.longBreakInterval === 0) ? 'longBreak' : 'shortBreak';
          } else {
               nextMode = 'focus';
          }
      } else { // Skipping a break
          nextMode = 'focus';
          if (currentSessionId) setCurrentSessionId(null);
      }

      setMode(nextMode);
      showNotification("Phase Skipped", `Starting ${nextMode.replace(/([A-Z])/g, ' $1').trim()}.`);

      let nextDurationSeconds = 0;
      if (nextMode === 'focus') {
          const focusMins = await determineAdaptedFocusTime();
          setCurrentFocusTime(focusMins);
          nextDurationSeconds = focusMins * 60;
      } else if (nextMode === 'shortBreak') {
          nextDurationSeconds = settings.shortBreakTime * 60;
      } else { // longBreak
          nextDurationSeconds = settings.longBreakTime * 60;
      }
      setTimeLeft(nextDurationSeconds);

      setDistractions([]);
      setSessionNotes('');
      setFocusQualityRating(null);
      setSuggestedActivity(nextMode !== 'focus' ? breakActivities[Math.floor(Math.random() * breakActivities.length)] : null);

      toast({ title: `Skipped to ${nextMode === 'focus' ? 'Focus' : 'Break'}` });

      const isNextFocus = nextMode === 'focus';
      const shouldAutoStart = (isNextFocus && settings.autoStartPomodoros) || (!isNextFocus && settings.autoStartBreaks);
      if (shouldAutoStart) {
          requestAnimationFrame(() => {
              startTimerFnRef.current?.();
          });
      } else {
          setIsActive(false);
      }

  }, [
      mode, completedPomodoros, settings, currentSessionId, playAlarmSound, getCurrentDurationSeconds,
      timeLeft, determineAdaptedFocusTime, toast, loadSessionHistory, showNotification, currentFocusTime
  ]);

  const handleLogDistraction = useCallback(async () => { if (!newDistractionText.trim()||!currentSessionId||!userId){toast({title:"Cannot Log",description:"Text & active session needed.",variant:"destructive"});return;} const tempId=`td-${Date.now()}`; const optim:LoggedDistraction={id:tempId,description:newDistractionText.trim(),timestamp:Date.now(),session_id:currentSessionId,user_id:userId,created_at:new Date().toISOString()}; setDistractions(p=>[optim,...p]); const dText=newDistractionText; const dTrig=newDistractionTrigger; const dFeel=newDistractionFeeling; setNewDistractionText(''); setNewDistractionTrigger(''); setNewDistractionFeeling(''); setShowDistractionDialog(false); try{const p={description:dText,session_id:currentSessionId,user_id:userId,trigger:dTrig||null,feeling:dFeel||null}; const logged=await distractionLogsApi.create(p); if(!logged?.id)throw new Error("Fail log distraction"); setDistractions(curr=>produce(curr,d=>{const i=d.findIndex(d=>d.id===tempId);if(i!==-1)d[i]={...logged,timestamp:logged.created_at?parseISO(logged.created_at).getTime():optim.timestamp};})); toast({title:"Distraction Logged"});}catch(e:any){console.error(e); toast({title:"Err Log Distraction",description:e.message,variant:"destructive"}); setDistractions(p=>p.filter(d=>d.id!==tempId)); setNewDistractionText(dText); setNewDistractionTrigger(dTrig); setNewDistractionFeeling(dFeel); setShowDistractionDialog(true);}}, [userId,currentSessionId,newDistractionText,newDistractionTrigger,newDistractionFeeling,toast]);
  const handleSaveCompletionData = useCallback(async () => { const sessId=lastCompletedSessionId; if(!sessId){console.error("Missing session ID"); toast({title:"Err", description:"Session ID missing.", variant:"destructive"}); setShowCompletionDialog(false); return;} setIsMutatingSession(true); try{await focusSessionsApi.update(sessId,{notes:sessionNotes.trim()||null, focus_quality_rating:focusQualityRating}); toast({title:"Feedback Saved"}); setLastCompletedSessionId(null); loadSessionHistory(); if(settings.autoStartBreaks){await startTimerFnRef.current?.();}}catch(e:any){console.error(e); toast({title:"Err Save Feedback", description:e.message, variant:"destructive"});}finally{setIsMutatingSession(false); setShowCompletionDialog(false);}}, [lastCompletedSessionId, sessionNotes, focusQualityRating, toast, settings.autoStartBreaks, loadSessionHistory]);
  const handleEmergencyStop = useCallback(()=>{if(!isActive)return; pauseTimer(); toast({title:"Stopped", description:"Take a moment.", duration:5000});},[isActive, pauseTimer, toast]);
  const saveSettingsDebounced = useCallback(debounce(async (newSettings: TimerSettings) => { if(!userId)return; try{ const r=await settingsApi.upsertSettings(userId,{settings:newSettings}); if(r?.id){setSettingsDbId(r.id); console.log("Settings saved");} else throw new Error("Save fail"); } catch(e:any){console.error(e); setSettingsError(`Auto-save fail: ${e.message}`); toast({title:"Auto-Save Failed", description:e.message, variant:"destructive"});}}, 1500), [userId, toast]);
  const handleTimerDialogSettingsChange = useCallback(<K extends keyof TimerSettings>(key: K, value: TimerSettings[K])=>{ setSettings(p=>{const n=produce(p,d=>{(d as any)[key]=value;}); saveSettingsDebounced(n); return n;}); if(!isActive){if(key==='focusTime'&&mode==='focus'){setTimeLeft((value as number)*60); setCurrentFocusTime(value as number);}else if(key==='shortBreakTime'&&mode==='shortBreak'){setTimeLeft((value as number)*60);}else if(key==='longBreakTime'&&mode==='longBreak'){setTimeLeft((value as number)*60);}} /* Correctly closing if block */ } /* Correctly closing useCallback arrow function */, [isActive, mode, saveSettingsDebounced]);
  const handleExtendFocus = useCallback(async (minutes: number) => { if (!isActive && timeLeft <= 0 && mode === 'focus') { const newTime = Math.min(timeLeft + minutes * 60, settings.focusTime * 60 * 2); setTimeLeft(newTime); setShowCompletionDialog(false); await startTimer(); toast({title: `Focus Extended by ${minutes} min`}); } else { toast({title: "Cannot Extend", description:"Only possible after focus session.", variant:"destructive"}); } }, [isActive, timeLeft, mode, settings.focusTime, startTimer, toast]);

    // --- Effects ---
    useEffect(() => { startTimerFnRef.current = startTimer; handleSessionCompleteFnRef.current = handleSessionComplete; }, [startTimer, handleSessionComplete]);
    useEffect(() => { alarmAudioRef.current = new Audio('/sounds/timer-complete.mp3'); alarmAudioRef.current.load(); }, []); // Use existing sound file
    useEffect(() => { if (userId && !authLoading) { loadSettingsAndAdapt(); loadAvailableTasks(); loadSessionHistory(); } else if (!authLoading) { setSettings(defaultTimerSettings); setAvailableTasks([]); setSessionHistory([]); setCurrentFocusTime(defaultTimerSettings.focusTime); setTimeLeft(defaultTimerSettings.focusTime * 60); setIsActive(false); if (timerRef.current) clearInterval(timerRef.current); setCurrentSessionId(null); } }, [userId, authLoading, loadSettingsAndAdapt, loadAvailableTasks, loadSessionHistory]);
    useEffect(() => { return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, []);
    useEffect(() => { if (isActive) { document.title = `${formatTime(timeLeft)} - ${mode === 'focus' ? 'Focusing' : 'Break'} | EF`; } else { document.title = 'Easier Focus | Timer'; } return () => { document.title = 'Easier Focus'; }; }, [isActive, timeLeft, mode]);
    useEffect(() => {
        if (!isActive) {
            let durationSeconds = 0;
            if (mode === 'focus') {
                durationSeconds = currentFocusTime * 60;
            } else if (mode === 'shortBreak') {
                durationSeconds = settings.shortBreakTime * 60;
            } else if (mode === 'longBreak') {
                durationSeconds = settings.longBreakTime * 60;
            }
            setTimeLeft(durationSeconds);
        }
    }, [mode, isActive, currentFocusTime, settings.shortBreakTime, settings.longBreakTime]);
    useEffect(() => {
        if (initialTaskId && availableTasks.some(task => task.id === initialTaskId)) {
            setSelectedTaskId(initialTaskId);
        } else if (initialTaskId) {
            console.warn(`Initial Task ID ${initialTaskId} not found or available.`);
        } else {
            setSelectedTaskId(null);
        }
     }, [initialTaskId, availableTasks]);

   // --- Soundscape Effects ---
   useEffect(() => { if (soundscapeAudioRef.current) soundscapeAudioRef.current.volume = settings.soundscapeVolume / 100; }, [settings.soundscapeVolume]);
   useEffect(() => {
       if (!settings.enabledSoundscapes || !settings.selectedSoundscapeId || settings.selectedSoundscapeId === 'none') {
           pauseSoundscape();
       } else if (isSoundscapePlaying) {
           playSelectedSoundscape();
       }
   }, [settings.enabledSoundscapes, settings.selectedSoundscapeId, pauseSoundscape, isSoundscapePlaying, playSelectedSoundscape]);

   // Cleanup soundscape on unmount
   useEffect(() => {
       const audioRef = soundscapeAudioRef.current;
       return () => {
           if (audioRef) {
               audioRef.pause();
               audioRef.src = '';
           }
       };
   }, []);


  // --- Helper Render Functions ---
  function renderSettingsDialog(): JSX.Element { return ( <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}> <DialogContent className="sm:max-w-[525px]"> <DialogHeader> <DialogTitle>Timer Settings</DialogTitle> <DialogDescription>Adjust timer preferences.</DialogDescription> </DialogHeader> {isSettingsLoading && <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin"/></div>} {settingsError && <Alert variant="destructive"><AlertCircle className="h-4 w-4"/><AlertTitle>Error</AlertTitle><AlertDescription>{settingsError}</AlertDescription></Alert>} {!isSettingsLoading && !settingsError && ( <div className="grid gap-6 py-4"> <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="focusTime" className="text-right col-span-1">Focus</Label><Slider id="focusTime" value={[settings.focusTime]} onValueChange={([v])=>handleTimerDialogSettingsChange('focusTime',v)} min={15} max={60} step={5} className="col-span-2"/><span className="col-span-1 text-sm text-muted-foreground">{settings.focusTime} min</span></div> <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="shortBreakTime" className="text-right col-span-1">Short</Label><Slider id="shortBreakTime" value={[settings.shortBreakTime]} onValueChange={([v])=>handleTimerDialogSettingsChange('shortBreakTime',v)} min={1} max={15} step={1} className="col-span-2"/><span className="col-span-1 text-sm text-muted-foreground">{settings.shortBreakTime} min</span></div> <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="longBreakTime" className="text-right col-span-1">Long</Label><Slider id="longBreakTime" value={[settings.longBreakTime]} onValueChange={([v])=>handleTimerDialogSettingsChange('longBreakTime',v)} min={10} max={30} step={5} className="col-span-2"/><span className="col-span-1 text-sm text-muted-foreground">{settings.longBreakTime} min</span></div> <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="longBreakInterval" className="text-right col-span-1">Interval</Label><Slider id="longBreakInterval" value={[settings.longBreakInterval]} onValueChange={([v])=>handleTimerDialogSettingsChange('longBreakInterval',v)} min={2} max={6} step={1} className="col-span-2"/><span className="col-span-1 text-sm text-muted-foreground">{settings.longBreakInterval} sess</span></div> <div className="flex items-center justify-between pt-4"><Label htmlFor="autoStartBreaks">Auto Start Breaks</Label><Switch id="autoStartBreaks" checked={settings.autoStartBreaks} onCheckedChange={(c)=>handleTimerDialogSettingsChange('autoStartBreaks',c)}/></div> <div className="flex items-center justify-between"><Label htmlFor="autoStartPomodoros">Auto Start Focus</Label><Switch id="autoStartPomodoros" checked={settings.autoStartPomodoros} onCheckedChange={(c)=>handleTimerDialogSettingsChange('autoStartPomodoros',c)}/></div> <Separator className="my-4"/> <h4 className="font-medium text-sm">Sounds</h4> {notificationPermission === 'default' && (<Button variant="outline" size="sm" onClick={requestNotificationPermission} className="w-full mb-3">Enable Browser Notifications</Button>)} {notificationPermission === 'denied' && (<p className="text-xs text-destructive text-center mb-3">Notifications disabled in browser.</p>)} <div className="flex items-center justify-between"><Label htmlFor="browserNotifications">Browser Alerts</Label><Switch id="browserNotifications" checked={settings.notifications?.enabled??true} onCheckedChange={(c)=>handleTimerDialogSettingsChange('notifications',{...settings.notifications,enabled:c})} disabled={notificationPermission !== 'granted'}/></div> <div className="flex items-center justify-between"><Label htmlFor="enabledSounds">Alarm Sound</Label><Switch id="enabledSounds" checked={settings.enabledSounds} onCheckedChange={(c)=>handleTimerDialogSettingsChange('enabledSounds',c)}/></div> <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="alarmVolume" className="text-right col-span-1">Alarm Vol</Label><Slider id="alarmVolume" value={[settings.alarmVolume]} onValueChange={([v])=>handleTimerDialogSettingsChange('alarmVolume',v)} min={0} max={100} step={5} className="col-span-2" disabled={!settings.enabledSounds}/><span className="col-span-1 text-sm text-muted-foreground">{settings.alarmVolume}%</span></div> <div className="flex items-center justify-between"><Label htmlFor="enabledSoundscapes">Soundscapes</Label><Switch id="enabledSoundscapes" checked={settings.enabledSoundscapes} onCheckedChange={(c)=>handleTimerDialogSettingsChange('enabledSoundscapes',c)}/></div> <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="soundscapeVolume" className="text-right col-span-1">Sound Vol</Label><Slider id="soundscapeVolume" value={[settings.soundscapeVolume]} onValueChange={([v])=>handleTimerDialogSettingsChange('soundscapeVolume',v)} min={0} max={100} step={5} className="col-span-2" disabled={!settings.enabledSoundscapes}/><span className="col-span-1 text-sm text-muted-foreground">{settings.soundscapeVolume}%</span></div> <Select value={settings.selectedSoundscapeId??'none'} onValueChange={(v)=>handleTimerDialogSettingsChange('selectedSoundscapeId',v==='none'?null:v)} disabled={!settings.enabledSoundscapes}><SelectTrigger className="col-span-4"><SelectValue placeholder="Select soundscape..."/></SelectTrigger><SelectContent>{availableSoundscapes.map(s=><SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select> <div className="grid grid-cols-4 items-center gap-4 pt-4"><Label htmlFor="timerTheme" className="text-right col-span-1">Theme</Label><Select value={settings.theme??'system'} onValueChange={(v)=>handleTimerDialogSettingsChange('theme',v as any)} disabled={isSettingsLoading}><SelectTrigger id="timerTheme"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="light">Light</SelectItem><SelectItem value="dark">Dark</SelectItem><SelectItem value="system">System</SelectItem></SelectContent></Select></div> <div className="grid grid-cols-4 items-center gap-4 pt-4 border-t"><Label htmlFor="focusTechnique" className="text-right col-span-1">Technique</Label><Select value={settings.defaultFocusTechnique??'pomodoro'} onValueChange={(v)=>handleTimerDialogSettingsChange('defaultFocusTechnique',v)} disabled={isSettingsLoading}><SelectTrigger id="focusTechnique"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="pomodoro">Pomodoro</SelectItem><SelectItem value="deepWork">Deep Work</SelectItem></SelectContent></Select></div> </div> )} <DialogFooter> <Button onClick={()=>setShowSettingsDialog(false)}>Close</Button> </DialogFooter> </DialogContent> </Dialog> ); }
  function renderDistractionDialog(): JSX.Element { return ( <Dialog open={showDistractionDialog} onOpenChange={setShowDistractionDialog}> <DialogContent> <DialogHeader> <DialogTitle>Log Distraction</DialogTitle> <DialogDescription>What pulled you away?</DialogDescription> </DialogHeader> <div className="py-4 space-y-4"> <div><Label htmlFor="dist-text">Distraction</Label><Textarea id="dist-text" value={newDistractionText} onChange={e=>setNewDistractionText(e.target.value)} placeholder="e.g., Checked email, noise..." className="mt-1" rows={2}/></div> <div><Label htmlFor="dist-trig">Trigger (Optional)</Label><Input id="dist-trig" value={newDistractionTrigger} onChange={e=>setNewDistractionTrigger(e.target.value)} placeholder="e.g., Notification, boredom..." className="mt-1"/></div> <div><Label>Feeling (Optional)</Label><div className="flex gap-2 mt-2 flex-wrap"> <Button variant={newDistractionFeeling==='Anxious'?'default':'outline'} size="sm" onClick={()=>setNewDistractionFeeling('Anxious')}><Frown className="h-4 w-4 mr-1"/>Anxious</Button> <Button variant={newDistractionFeeling==='Bored'?'default':'outline'} size="sm" onClick={()=>setNewDistractionFeeling('Bored')}><Meh className="h-4 w-4 mr-1"/>Bored</Button> <Button variant={newDistractionFeeling==='Curious'?'default':'outline'} size="sm" onClick={()=>setNewDistractionFeeling('Curious')}><Smile className="h-4 w-4 mr-1"/>Curious</Button> <Button variant={newDistractionFeeling==='Overwhelmed'?'default':'outline'} size="sm" onClick={()=>setNewDistractionFeeling('Overwhelmed')}><Zap className="h-4 w-4 mr-1"/>Overwhelmed</Button> {newDistractionFeeling && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={()=>setNewDistractionFeeling('')}><X className="h-4 w-4"/></Button>} </div></div> </div> <DialogFooter> <Button variant="outline" onClick={()=>setShowDistractionDialog(false)}>Cancel</Button> <Button onClick={handleLogDistraction} disabled={!newDistractionText.trim()||isMutatingSession}>Log</Button> </DialogFooter> </DialogContent> </Dialog> ); }
  function renderCompletionDialog(): JSX.Element { return ( <Dialog open={showCompletionDialog} onOpenChange={(open)=>{if(!open)setLastCompletedSessionId(null);setShowCompletionDialog(open);}}> <DialogContent className="sm:max-w-md"> <DialogHeader> <DialogTitle className="flex items-center gap-2"><Check className="h-5 w-5 text-green-600"/> Session Complete!</DialogTitle> <DialogDescription>Reflect on your session.</DialogDescription> </DialogHeader> <div className="py-4 space-y-4"> {suggestedActivity && (<Alert variant="default"><suggestedActivity.icon className="h-4 w-4"/><AlertTitle>Break Suggestion: {suggestedActivity.title}</AlertTitle><AlertDescription>{suggestedActivity.description}</AlertDescription></Alert>)} <div><Label>Focus Quality?</Label><RadioGroup value={focusQualityRating?.toString()??''} onValueChange={v=>setFocusQualityRating(parseInt(v))} className="flex justify-center gap-2 mt-2"> {[1,2,3,4,5].map(r=>(<div key={r} className="flex flex-col items-center space-y-1"><RadioGroupItem value={r.toString()} id={`r-${r}`} className="peer sr-only"/><Label htmlFor={`r-${r}`} className={cn("flex items-center justify-center rounded-full border-2 border-muted bg-background w-10 h-10 cursor-pointer","peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary","hover:bg-accent hover:text-accent-foreground")}>{r}</Label></div>))} </RadioGroup></div> <div><Label htmlFor="sess-notes">Session Notes</Label><Textarea id="sess-notes" value={sessionNotes} onChange={e=>setSessionNotes(e.target.value)} placeholder="Thoughts or challenges?" className="mt-1" rows={3}/></div> </div> <DialogFooter className="sm:justify-between gap-2"> <Button variant="secondary" onClick={() => handleExtendFocus(10)}> <Plus className="mr-2 h-4 w-4" /> Extend (10 min) </Button> <div className="flex gap-2"> <Button variant="outline" onClick={()=>setShowCompletionDialog(false)}>Skip</Button> <Button onClick={handleSaveCompletionData} disabled={isMutatingSession}>{isMutatingSession?<Loader2 className="mr-2 h-4 w-4 animate-spin"/>:null} Save & Start Break </Button> </div> </DialogFooter> </DialogContent> </Dialog> ); }

   // --- Main Render Logic ---
   const currentTaskDisplayTitle = useMemo(() => {
        if (selectedTaskId) {
            const task = availableTasks.find(t => t.id === selectedTaskId);
            // Use initialTaskTitle as fallback if task isn't loaded yet but ID matches
            return task?.title || (initialTaskId === selectedTaskId ? initialTaskTitle : null) || "Loading task...";
        }
        return initialTaskTitle || null; // Use initial if no selection made yet
    }, [selectedTaskId, availableTasks, initialTaskId, initialTaskTitle]);


  return (
     <div className="container mx-auto p-4 md:p-6 max-w-4xl">
       <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5}}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
           <TabsList className="grid w-full grid-cols-3 mb-6"> <TabsTrigger value="timer">Timer</TabsTrigger> <TabsTrigger value="tasks">Select Task</TabsTrigger> <TabsTrigger value="stats">History</TabsTrigger> </TabsList>
          <TabsContent value="timer">
              <Card className="overflow-hidden shadow-lg border border-border/60 relative">
                  <CardContent className="p-6 md:p-10 flex flex-col items-center justify-center text-center relative"> {/* Added relative positioning */}

                      {/* Mode Indicator */}
                      <motion.div key={mode} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                          {mode.replace(/([A-Z])/g, ' $1').trim()}
                      </motion.div>

                      {/* Timer Display */}
                      <motion.div className="relative w-64 h-64 md:w-80 md:h-80 mb-8" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                          <CircularProgressbar
                              value={calculateProgress(timeLeft, getCurrentDurationSeconds())} // Simplified: Removed useMemo
                              text={formatTime(timeLeft)}
                              strokeWidth={5}
                              styles={buildStyles({
                                  textColor: `hsl(var(--foreground))`,
                                  pathColor: mode === 'shortBreak' ? 'hsl(var(--green-500))' : mode === 'longBreak' ? 'hsl(var(--blue-500))' : 'hsl(var(--primary))', // Simplified: Removed useMemo and try/catch
                                  trailColor: `hsl(var(--muted) / 0.2)`, textSize: '20px', pathTransitionDuration: 0.5,
                              })}
                          />
                           {/* Display Break Activity Suggestion Inside Timer */}
                          {(mode === 'shortBreak' || mode === 'longBreak') && suggestedActivity && (
                              <motion.div
                                  key={suggestedActivity.id}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.2 }}
                                  className="absolute inset-0 flex flex-col items-center justify-center text-center p-4"
                              >
                                  <p className="text-xs text-muted-foreground mb-1">Break Idea:</p>
                                  <suggestedActivity.icon className="w-8 h-8 text-primary opacity-80 mb-2" />
                                  <p className="text-lg font-semibold">{suggestedActivity.title}</p>
                                  <p className="text-xs text-muted-foreground mt-1">{suggestedActivity.description}</p>
                              </motion.div>
                          )}
                      </motion.div>

                      {/* Selected Task Display (Only during focus) */}
                      {mode === 'focus' && currentTaskDisplayTitle && (
                          <motion.div className="mb-6 text-center max-w-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                              <p className="text-sm text-muted-foreground mb-1">Focusing on:</p>
                              <p className="font-medium text-lg truncate">{currentTaskDisplayTitle}</p>
                          </motion.div>
                      )}

                       {/* Timer Controls */}
                      <div className="flex items-center justify-center space-x-4">
                          <Button variant="ghost" size="icon" onClick={resetTimer} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full w-12 h-12 disabled:opacity-50" disabled={isMutatingSession && !isActive} aria-label="Reset"><RotateCcw className="h-5 w-5" /></Button>
                          <Button size="lg" onClick={isActive ? pauseTimer : startTimer} disabled={isMutatingSession} className="rounded-full w-20 h-20 text-lg shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-shadow duration-300" aria-label={isActive ? 'Pause' : 'Start'}>{isActive ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}</Button>
                          <Button variant="ghost" size="icon" onClick={skipSession} className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full w-12 h-12 disabled:opacity-50" disabled={isMutatingSession} aria-label="Skip"><SkipForward className="h-5 w-5" /></Button>
                      </div>

                      {/* Pomodoro Progress */}
                      {settings.defaultFocusTechnique === 'pomodoro' && (
                          <div className="mt-8 text-center">
                              <p className="text-sm text-muted-foreground">Session {completedPomodoros % settings.longBreakInterval + 1} / {settings.longBreakInterval}</p>
                              <Progress value={(completedPomodoros % settings.longBreakInterval) * (100 / settings.longBreakInterval)} className="w-32 h-1.5 mx-auto mt-2" />
                          </div>
                      )}

                      {/* Soundscape Controls - More Accessible */}
                      {settings.enabledSoundscapes && (
                           <motion.div
                                className="absolute bottom-4 left-4 flex items-center gap-2"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}>
                                <TooltipProvider delayDuration={150}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={toggleSoundscape} title={isSoundscapePlaying ? "Pause Soundscape" : "Play Soundscape"}>
                                                {isSoundscapePlaying ? <Volume1 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">{isSoundscapePlaying ? "Pause Sound" : "Play Sound"}</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                {isSoundscapePlaying && (
                                     <motion.div initial={{width: 0, opacity: 0}} animate={{width: '6rem', opacity: 1}} exit={{width: 0, opacity: 0}}>
                                          <Slider
                                                value={[settings.soundscapeVolume]}
                                                onValueChange={([v]) => handleTimerDialogSettingsChange('soundscapeVolume', v)}
                                                min={0} max={100} step={5}
                                                className="w-24 h-1 [&>span:first-child]:h-1 [&>span:first-child>span]:h-1 [&>span:first-child>span]:w-3 [&>span:first-child>span]:h-3 [&>span:first-child>span]:-top-1"
                                                aria-label="Soundscape Volume"
                                            />
                                     </motion.div>
                                )}
                           </motion.div>
                      )}

                      {/* Action Buttons (Settings, Distraction, Stop) */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2">
                          {/* Wrap Settings Dialog Trigger */}
                          <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
                              <TooltipProvider delayDuration={150}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <DialogTrigger asChild><Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10"><Settings className="h-5 w-5" /></Button></DialogTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent side="left">Settings</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={() => setShowDistractionDialog(true)} disabled={mode !== 'focus' || !isActive}>
                                            <AlertTriangle className="h-5 w-5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="left">Log Distraction</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleEmergencyStop} disabled={!isActive}>
                                            <Hand className="h-5 w-5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="left">Emergency Stop</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              {/* Dialog Content is rendered conditionally below, triggered by open state */}
                          </Dialog>
                      </div>

                  </CardContent>
              </Card>
          </TabsContent>
           <TabsContent value="tasks">
               {/* Removed renderTaskManagement call */}
               <Card>
                   <CardHeader><CardTitle>Select Focus Task</CardTitle><CardDescription>Choose a task to associate with your focus session.</CardDescription></CardHeader>
                   <CardContent>
                       <div className="mt-2">
                           <Label htmlFor="task-select-main" className="text-sm font-medium">Focus Task</Label>
                           <Select value={selectedTaskId ?? ''} onValueChange={(v) => setSelectedTaskId(v || null)} disabled={isTasksLoading || availableTasks.length === 0}>
                               <SelectTrigger id="task-select-main" className={cn("mt-1 w-full", !selectedTaskId && "text-muted-foreground")}>
                                   <SelectValue placeholder={isTasksLoading ? "Loading tasks..." : (availableTasks.length === 0 ? "No tasks available" : "Select a task...")} />
                               </SelectTrigger>
                               <SelectContent>
                                   <SelectItem value="">-- None --</SelectItem>
                                   {availableTasks.map(task => (<SelectItem key={task.id} value={task.id}>{task.title}</SelectItem>))}
                               </SelectContent>
                           </Select>
                           {isTasksLoading && <p className="text-xs text-muted-foreground mt-1">Loading...</p>}
                           {!isTasksLoading && availableTasks.length === 0 && <p className="text-xs text-muted-foreground mt-1">No tasks found. Add tasks in the Task Manager.</p>}
                       </div>
                   </CardContent>
               </Card>
            </TabsContent>
           <TabsContent value="stats"> <Card> <CardHeader><CardTitle>Recent History</CardTitle><CardDescription>Review past sessions.</CardDescription></CardHeader> <CardContent> {isHistoryLoading && (<div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin"/></div>)} {historyError && (<Alert variant="destructive"><AlertCircle className="h-4 w-4"/><AlertTitle>Error History</AlertTitle><AlertDescription>{historyError}</AlertDescription></Alert>)} {!isHistoryLoading && !historyError && sessionHistory.length === 0 && (<p className="text-sm text-muted-foreground text-center py-4">No sessions yet.</p>)} {!isHistoryLoading && !historyError && sessionHistory.length > 0 && (<ScrollArea className="h-[400px] pr-3"><ul className="space-y-3">{sessionHistory.map((s)=>{const st=s.start_time?parseISO(s.start_time):null; const dur=s.duration_seconds?formatTime(s.duration_seconds):'N/A'; const t=availableTasks.find(tk=>tk.id===s.task_id); const isC=s.status==='completed'; const isX=s.status==='cancelled'||s.status==='skipped'; return(<li key={s.id} className="border p-3 rounded-md bg-muted/30"><div className="flex justify-between items-start mb-1"><span className="text-sm font-medium">{st?formatFn(st,'MMM d, yyyy h:mm a'):'Unknown'}</span><Badge variant={isC?"secondary":isX?"destructive":"outline"}>{s.status?s.status.charAt(0).toUpperCase()+s.status.slice(1):'Unknown'}</Badge></div>{t && <p className="text-xs text-muted-foreground mb-1">Task: {t.title}</p>}<div className="flex justify-between items-center text-xs text-muted-foreground"><span>Duration: {dur}</span>{s.focus_quality_rating!=null&&(<div className="flex items-center gap-1">{Array.from({length:5}).map((_,i)=>(<Star key={i} className={`h-3 w-3 ${i<s.focus_quality_rating!?'fill-amber-400 text-amber-500':'text-gray-300'}`}/>))}</div>)}</div>{s.notes&&<p className="text-xs mt-1 italic border-l-2 pl-2 ml-1 border-border">{s.notes}</p>}</li>);})}</ul></ScrollArea>)} </CardContent> </Card> </TabsContent>
         </Tabs>
         {/* Dialog content is now rendered conditionally via the Dialog component above */}
         {renderDistractionDialog()}
         {renderCompletionDialog()}
         <audio ref={alarmAudioRef} src={`/sounds/timer-complete.mp3`} preload="auto"/> {/* Use existing sound file */}
         <audio ref={soundscapeAudioRef} loop preload="none"/>
       </motion.div>
    </div> // Closing container div
  ); // Closing parenthesis for the main return statement
}; // Explicit closing brace for the EnhancedFocusTimer function component

export default EnhancedFocusTimer;
// Final comment removed
