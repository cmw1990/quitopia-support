import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { TopNav } from "@/components/layout/TopNav"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { 
  Brain, 
  Volume, 
  Volume2, 
  PlayCircle, 
  PauseCircle, 
  TimerReset, 
  Clock, 
  Save, 
  Plus,
  X, 
  Info,
  Timer,
  Music,
  ExternalLink,
  Headphones
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabaseRequest } from '@/utils/supabaseRequest'; // Corrected import
import { useAuth } from "@/components/AuthProvider"
import { BINAURAL_RANGES, BinauralBeatType } from "@/lib/audio-engine"

interface PresetType {
  id?: string;
  name: string;
  base: number;
  beat: number;
  carrier?: number;
  duration?: number;
  description?: string;
}

export default function BinauralBeats() {
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false)
  const [baseFrequency, setBaseFrequency] = useState(200)
  const [beatFrequency, setBeatFrequency] = useState(10)
  const [carrierWave, setCarrierWave] = useState<"sine" | "square" | "triangle" | "sawtooth">("sine")
  const [volume, setVolume] = useState(0.5)
  const [preset, setPreset] = useState("focus")
  const [isVisualizing, setIsVisualizing] = useState(true)
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [timerDuration, setTimerDuration] = useState(15)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [currentBeatType, setCurrentBeatType] = useState<BinauralBeatType>("alpha")
  
  // User presets
  const [savedPresets, setSavedPresets] = useState<PresetType[]>([])
  const [isEditingPreset, setIsEditingPreset] = useState(false)
  const [newPresetName, setNewPresetName] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Session metrics
  const [sessionStart, setSessionStart] = useState<Date | null>(null)
  const [totalSessionTime, setTotalSessionTime] = useState(0)
  const [sessionType, setSessionType] = useState("focus")

  // Refs
  const audioContextRef = useRef<AudioContext | null>(null)
  const oscillatorsRef = useRef<Array<OscillatorNode | null>>([null, null])
  const gainNodesRef = useRef<Array<GainNode | null>>([null, null])
  const analyserRef = useRef<AnalyserNode | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const timerIntervalRef = useRef<number | null>(null)

  // Hooks
  const { toast } = useToast()
  const { session } = useAuth()

  // Default presets
  const defaultPresets: Record<string, PresetType> = {
    focus: { name: "Focus & Concentration", base: 200, beat: 10, carrier: 0, description: "Enhanced concentration and alertness. Ideal for focused work and study sessions." },
    meditation: { name: "Deep Meditation", base: 100, beat: 4, carrier: 0, description: "Promotes deep meditation and relaxation. Perfect for mindfulness practice." },
    relaxation: { name: "Stress Relief", base: 300, beat: 6, carrier: 0, description: "Releases tension and anxiety. Great for unwinding after a long day." },
    sleep: { name: "Sleep Induction", base: 150, beat: 2, carrier: 0, description: "Facilitates the transition to deep, restful sleep." },
    creativity: { name: "Creative Flow", base: 170, beat: 7.83, carrier: 0, description: "Enhances creative thinking and problem-solving. Stimulates innovation." },
    energy: { name: "Energy Boost", base: 250, beat: 16, carrier: 0, description: "Increases mental alertness and physical energy. Good for morning sessions." },
    learning: { name: "Accelerated Learning", base: 220, beat: 12, carrier: 1, description: "Optimizes brain function for absorbing and retaining new information." },
    recovery: { name: "Physical Recovery", base: 180, beat: 3, carrier: 0, description: "Supports physical healing and recovery processes." },
  }

  // Load audio context only when component mounts
  useEffect(() => {
    // Create audio context only when needed
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        analyserRef.current = audioContextRef.current.createAnalyser()
        analyserRef.current.fftSize = 2048
      } catch (error) {
        console.error("Web Audio API is not supported in this browser.", error)
        toast({
          title: "Browser Not Supported",
          description: "Your browser doesn't support the Web Audio API required for binaural beats.",
          variant: "destructive"
        })
      }
    }

    // Clean up when component unmounts
    return () => {
      stopTone()
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [])

  // Load user presets
  useEffect(() => {
    if (session?.user) {
      loadUserPresets()
    }
  }, [session])

  // Update visualization when playing state changes
  useEffect(() => {
    if (isPlaying && isVisualizing) {
      startVisualization()
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [isPlaying, isVisualizing])

  // Monitor and update current frequency type
  useEffect(() => {
    // Find which binaural beat type the current frequency belongs to
    const type = Object.entries(BINAURAL_RANGES).find(
      ([_, range]) => beatFrequency >= range.min && beatFrequency <= range.max
    )?.[0] as BinauralBeatType || "alpha"
    
    setCurrentBeatType(type)
    setSessionType(type)
  }, [beatFrequency])

  // Timer functionality
  useEffect(() => {
    if (isTimerActive && timeRemaining !== null) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
      
      timerIntervalRef.current = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timerIntervalRef.current!)
            stopTone()
            toast({
              title: "Session Complete",
              description: `Your ${sessionType} session has ended.`
            })
            return null
          }
          return prev - 1
        })
      }, 1000)
    } else if (!isTimerActive && timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
    }
    
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [isTimerActive, timeRemaining])

  // Session time tracker
  useEffect(() => {
    let interval: number | null = null
    
    if (isPlaying && sessionStart) {
      interval = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - sessionStart.getTime()) / 1000)
        setTotalSessionTime(elapsed)
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, sessionStart])

  const startTone = () => {
    if (!audioContextRef.current) return
    
    // Resume audio context if suspended
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume()
    }
    
    // Create new oscillators if they don't exist
    if (!oscillatorsRef.current[0] || !oscillatorsRef.current[1]) {
      const leftOsc = audioContextRef.current.createOscillator()
      const rightOsc = audioContextRef.current.createOscillator()
      const leftGain = audioContextRef.current.createGain()
      const rightGain = audioContextRef.current.createGain()
      const merger = audioContextRef.current.createChannelMerger(2)
      
      // Set waveform types
      leftOsc.type = carrierWave
      rightOsc.type = carrierWave
      
      // Set frequencies
      leftOsc.frequency.value = baseFrequency
      rightOsc.frequency.value = baseFrequency + beatFrequency
      
      // Set volumes
      leftGain.gain.value = volume
      rightGain.gain.value = volume
      
      // Connect nodes
      leftOsc.connect(leftGain)
      rightOsc.connect(rightGain)
      leftGain.connect(merger, 0, 0)
      rightGain.connect(merger, 0, 1)
      
      // Connect to analyser if visualizing
      if (isVisualizing && analyserRef.current) {
        merger.connect(analyserRef.current)
        analyserRef.current.connect(audioContextRef.current.destination)
      } else {
        merger.connect(audioContextRef.current.destination)
      }
      
      // Start oscillators
      leftOsc.start()
      rightOsc.start()
      
      // Store references
      oscillatorsRef.current = [leftOsc, rightOsc]
      gainNodesRef.current = [leftGain, rightGain]
      
      // Start timer if active
      if (isTimerActive) {
        setTimeRemaining(timerDuration * 60)
      }
      
      // Record session start
      setSessionStart(new Date())
    }
    
    setIsPlaying(true)
  }

  const stopTone = () => {
    // Stop oscillators
    oscillatorsRef.current.forEach(osc => {
      if (osc) {
        try {
          osc.stop()
          osc.disconnect()
        } catch (e) {
          console.log('Oscillator already stopped')
        }
      }
    })
    
    // Reset references
    oscillatorsRef.current = [null, null]
    gainNodesRef.current = [null, null]
    
    // Stop timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      setTimeRemaining(null)
    }
    
    // Stop animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    
    // Log session if stopped after playing
    if (isPlaying && sessionStart) {
      const sessionDuration = Math.floor((Date.now() - sessionStart.getTime()) / 1000)
      logSession(sessionDuration)
    }
    
    setIsPlaying(false)
    setTotalSessionTime(0)
    setSessionStart(null)
  }

  const updateFrequency = () => {
    if (!isPlaying || !oscillatorsRef.current[0] || !oscillatorsRef.current[1]) return
    
    // Update oscillator frequencies
    oscillatorsRef.current[0].frequency.value = baseFrequency
    oscillatorsRef.current[1].frequency.value = baseFrequency + beatFrequency
  }

  const updateVolume = (newVolume: number) => {
    setVolume(newVolume)
    
    // Update gain if playing
    if (isPlaying && gainNodesRef.current[0] && gainNodesRef.current[1]) {
      gainNodesRef.current[0].gain.value = newVolume
      gainNodesRef.current[1].gain.value = newVolume
    }
  }

  const updateWaveform = (type: "sine" | "square" | "triangle" | "sawtooth") => {
    setCarrierWave(type)
    
    // Update oscillator types if playing
    if (isPlaying && oscillatorsRef.current[0] && oscillatorsRef.current[1]) {
      oscillatorsRef.current[0].type = type
      oscillatorsRef.current[1].type = type
    }
  }

  const handlePresetChange = (value: string) => {
    // Check if it's a default preset
    if (value in defaultPresets) {
      const presetValues = defaultPresets[value]
      setPreset(value)
      setBaseFrequency(presetValues.base)
      setBeatFrequency(presetValues.beat)
      
      if (presetValues.carrier !== undefined) {
        const waveforms: Array<"sine" | "square" | "triangle" | "sawtooth"> = [
          "sine", "square", "triangle", "sawtooth"
        ]
        setCarrierWave(waveforms[presetValues.carrier])
      }
      
      // Update frequencies if already playing
      updateFrequency()
      
      toast({
        title: presetValues.name,
        description: presetValues.description || "Preset applied successfully"
      })
    } 
    // Check if it's a user preset
    else {
      const userPreset = savedPresets.find(p => p.id === value)
      if (userPreset) {
        setPreset(value)
        setBaseFrequency(userPreset.base)
        setBeatFrequency(userPreset.beat)
        
        if (userPreset.carrier !== undefined) {
          const waveforms: Array<"sine" | "square" | "triangle" | "sawtooth"> = [
            "sine", "square", "triangle", "sawtooth"
          ]
          setCarrierWave(waveforms[userPreset.carrier])
        }
        
        // Update frequencies if already playing
        updateFrequency()
        
        toast({
          title: userPreset.name,
          description: userPreset.description || "Your custom preset has been applied"
        })
      }
    }
  }

  const loadUserPresets = async () => {
    if (!session?.user?.id) return
    
    try {
      // Use supabaseRequest, handle response, remove session arg
      const { data, error: loadError } = await supabaseRequest<PresetType[]>(
        `/rest/v1/binaural_presets8?user_id=eq.${session.user.id}&order=created_at.desc`,
        { method: "GET" }
        // Removed session argument
      );
      if (loadError) throw loadError; // Propagate error
      
      if (Array.isArray(data)) {
        setSavedPresets(data)
      }
    } catch (error) {
      console.error("Error loading presets:", error)
    }
  }

  const savePreset = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to save custom presets",
        variant: "destructive"
      })
      return
    }
    
    if (!newPresetName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your preset",
        variant: "destructive"
      })
      return
    }
    
    try {
      setIsSaving(true)
      
      // Convert waveform to number for storage
      const waveformIndex = ["sine", "square", "triangle", "sawtooth"].indexOf(carrierWave)
      
      const preset = {
        user_id: session.user.id,
        name: newPresetName,
        base: baseFrequency,
        beat: beatFrequency,
        carrier: waveformIndex,
        duration: timerDuration,
        description: `Custom ${currentBeatType} beat (${beatFrequency.toFixed(1)} Hz)`
      }
      
      // Use supabaseRequest, handle response, remove session arg
      // Also ensure select and Prefer header to get the created item back
      const { data, error: saveError } = await supabaseRequest<PresetType[]>( // Expect array
        `/rest/v1/binaural_presets8?select=*`,
        {
          method: "POST",
          headers: { 'Prefer': 'return=representation' }, // Request result back
          body: JSON.stringify(preset)
        }
        // Removed session argument
      );
      if (saveError) throw saveError; // Propagate error
      
      if (data) {
        toast({
          title: "Preset Saved",
          description: "Your custom preset has been saved"
        })
        
        // Reset form and reload presets
        setNewPresetName("")
        setIsEditingPreset(false)
        loadUserPresets()
      }
    } catch (error) {
      console.error("Error saving preset:", error)
      toast({
        title: "Error",
        description: "Failed to save preset",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const deletePreset = async (presetId: string) => {
    if (!session?.user?.id) return
    
    try {
      // Use supabaseRequest, handle error, remove session arg
      const { error: deleteError } = await supabaseRequest(
        `/rest/v1/binaural_presets8?id=eq.${presetId}`,
        { method: "DELETE" }
        // Removed session argument
      );
      if (deleteError) throw deleteError; // Propagate error
      
      toast({
        title: "Preset Deleted",
        description: "Your preset has been removed"
      })
      
      // Reset preset if it was selected
      if (preset === presetId) {
        setPreset("focus")
        handlePresetChange("focus")
      }
      
      loadUserPresets()
    } catch (error) {
      console.error("Error deleting preset:", error)
    }
  }

  const startVisualization = () => {
    if (!analyserRef.current || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const analyzer = analyserRef.current
    const bufferLength = analyzer.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    
    // Set canvas dimensions
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight
    
    // Colors based on current beat type
    const colors = {
      delta: { primary: '#3b82f6', secondary: '#1d4ed8' },
      theta: { primary: '#8b5cf6', secondary: '#6d28d9' },
      alpha: { primary: '#10b981', secondary: '#047857' },
      beta: { primary: '#f59e0b', secondary: '#d97706' },
      gamma: { primary: '#ef4444', secondary: '#b91c1c' }
    }
    
    const currentColor = colors[currentBeatType] || colors.alpha
    
    const draw = () => {
      // Only continue if playing and visualizing
      if (!isPlaying || !isVisualizing) {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
        return
      }
      
      animationFrameRef.current = requestAnimationFrame(draw)
      analyzer.getByteTimeDomainData(dataArray)
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Set wave properties
      ctx.lineWidth = 2
      ctx.strokeStyle = currentColor.primary
      
      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
      gradient.addColorStop(0, currentColor.secondary)
      gradient.addColorStop(1, currentColor.primary)
      ctx.strokeStyle = gradient
      
      // Draw wave
      ctx.beginPath()
      
      const sliceWidth = canvas.width / bufferLength
      let x = 0
      
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0
        const y = (v * canvas.height) / 2
        
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
        
        x += sliceWidth
      }
      
      ctx.lineTo(canvas.width, canvas.height / 2)
      ctx.stroke()
    }
    
    draw()
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const logSession = async (duration: number) => {
    if (!session?.user?.id || duration < 10) return
    
    try {
      // Use supabaseRequest, handle error, remove session arg
      const { error: logError } = await supabaseRequest(
        `/rest/v1/binaural_sessions8`,
        {
          method: "POST",
           headers: { 'Prefer': 'return=minimal' }, // Don't need full object back
          body: JSON.stringify({
            user_id: session.user.id,
            frequency: beatFrequency,
            carrier: baseFrequency,
            duration_seconds: duration,
            waveform: carrierWave,
            session_type: currentBeatType,
            created_at: new Date().toISOString()
          })
        }
        // Removed session argument
      );
       if (logError) throw logError; // Propagate error
    } catch (error) {
      console.error("Error logging session:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="container mx-auto p-4 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                Binaural Beats Generator
              </CardTitle>
              <CardDescription>
                Generate binaural beats for focus, meditation, and relaxation. Use headphones for best results.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left column: Visualization */}
                <div className="col-span-1 md:col-span-2">
                  <Card className="border-none shadow-none">
                    <CardContent className="p-0">
                      <div className="p-4 rounded-lg bg-muted/50 border overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <span className="text-sm font-medium capitalize">{currentBeatType} Wave</span>
                            <span className="ml-2 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                              {beatFrequency.toFixed(1)} Hz
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={isVisualizing}
                              onCheckedChange={setIsVisualizing}
                              id="visualization"
                            />
                            <Label htmlFor="visualization" className="text-xs">Visualization</Label>
                          </div>
                        </div>
                        
                        <div 
                          className={`h-40 rounded relative overflow-hidden ${isVisualizing ? '' : 'bg-background/50'}`}
                        >
                          <canvas 
                            ref={canvasRef}
                            className="w-full h-full absolute inset-0"
                            style={{ display: isVisualizing ? 'block' : 'none' }}
                          />
                          
                          {!isVisualizing && (
                            <div className="flex items-center justify-center h-full">
                              <Info className="h-6 w-6 text-muted-foreground opacity-50" />
                              <span className="ml-2 text-sm text-muted-foreground">Visualization disabled</span>
                            </div>
                          )}
                          
                          {isPlaying && (
                            <div className="absolute bottom-2 left-2 bg-background/80 text-xs px-2 py-1 rounded">
                              {formatTime(totalSessionTime)}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Main controls */}
                  <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
                    <Button
                      onClick={isPlaying ? stopTone : startTone}
                      size="lg"
                      className={`gap-2 h-14 w-14 rounded-full ${
                        isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-primary'
                      }`}
                    >
                      {isPlaying ? <PauseCircle className="h-6 w-6" /> : <PlayCircle className="h-6 w-6" />}
                    </Button>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Volume</Label>
                        <span className="text-xs text-muted-foreground">{Math.round(volume * 100)}%</span>
                      </div>
                      <Slider
                        value={[volume]}
                        min={0}
                        max={1}
                        step={0.01}
                        onValueChange={([val]) => updateVolume(val)}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Right column: Settings */}
                <div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Preset</Label>
                      <Select value={preset} onValueChange={handlePresetChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a preset" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="focus">Focus & Concentration</SelectItem>
                          <SelectItem value="meditation">Deep Meditation</SelectItem>
                          <SelectItem value="relaxation">Stress Relief</SelectItem>
                          <SelectItem value="sleep">Sleep Induction</SelectItem>
                          <SelectItem value="creativity">Creative Flow</SelectItem>
                          <SelectItem value="energy">Energy Boost</SelectItem>
                          <SelectItem value="learning">Accelerated Learning</SelectItem>
                          <SelectItem value="recovery">Physical Recovery</SelectItem>
                          
                          {savedPresets.length > 0 && (
                            <>
                              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                                Your Presets
                              </div>
                              {savedPresets.map(p => (
                                <SelectItem key={p.id} value={p.id!}>
                                  {p.name}
                                </SelectItem>
                              ))}
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Carrier Frequency (Hz)</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={baseFrequency}
                          onChange={(e) => {
                            setBaseFrequency(Number(e.target.value))
                            updateFrequency()
                          }}
                          min={20}
                          max={500}
                          step={10}
                        />
                        <Select 
                          value={carrierWave} 
                          onValueChange={(val) => updateWaveform(val as any)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sine">Sine</SelectItem>
                            <SelectItem value="square">Square</SelectItem>
                            <SelectItem value="triangle">Triangle</SelectItem>
                            <SelectItem value="sawtooth">Sawtooth</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium">Binaural Beat (Hz)</Label>
                        <span className="text-xs text-muted-foreground">
                          {beatFrequency.toFixed(1)} Hz - {BINAURAL_RANGES[currentBeatType].name}
                        </span>
                      </div>
                      <Slider
                        value={[beatFrequency]}
                        min={0.5}
                        max={40}
                        step={0.1}
                        onValueChange={([val]) => {
                          setBeatFrequency(val)
                          updateFrequency()
                        }}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0.5 Hz</span>
                        <span>40 Hz</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium flex items-center gap-1">
                          <Timer className="h-4 w-4" />
                          Auto-Stop Timer
                        </Label>
                        <Switch
                          checked={isTimerActive}
                          onCheckedChange={(checked) => {
                            setIsTimerActive(checked)
                            if (checked && isPlaying) {
                              setTimeRemaining(timerDuration * 60)
                            } else {
                              setTimeRemaining(null)
                            }
                          }}
                        />
                      </div>
                      
                      {isTimerActive && (
                        <div className="flex items-center gap-2">
                          <Slider
                            value={[timerDuration]}
                            min={5}
                            max={60}
                            step={5}
                            onValueChange={([val]) => setTimerDuration(val)}
                            disabled={isPlaying}
                            className="flex-1"
                          />
                          <div className="w-16 text-center text-sm">
                            {timeRemaining !== null ? formatTime(timeRemaining) : `${timerDuration} min`}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Save preset button */}
                    <div className="pt-2">
                      {isEditingPreset ? (
                        <div className="space-y-2">
                          <Input
                            placeholder="Enter preset name"
                            value={newPresetName}
                            onChange={(e) => setNewPresetName(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <Button 
                              onClick={savePreset} 
                              className="flex-1"
                              disabled={isSaving}
                            >
                              {isSaving ? "Saving..." : "Save Preset"}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsEditingPreset(false)
                                setNewPresetName("")
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setIsEditingPreset(true)}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save Current Settings
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Brain wave info tabs */}
              <Tabs defaultValue="delta" className="mt-6">
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger value="delta">Delta</TabsTrigger>
                  <TabsTrigger value="theta">Theta</TabsTrigger>
                  <TabsTrigger value="alpha">Alpha</TabsTrigger>
                  <TabsTrigger value="beta">Beta</TabsTrigger>
                  <TabsTrigger value="gamma">Gamma</TabsTrigger>
                </TabsList>
                
                {Object.entries(BINAURAL_RANGES).map(([type, range]) => (
                  <TabsContent key={type} value={type} className="mt-2">
                    <Card>
                      <CardHeader className="py-4">
                        <CardTitle className="text-lg">{range.name}</CardTitle>
                        <CardDescription>{range.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="py-2">
                        <p className="text-sm">
                          {type === "delta" && "Delta waves are associated with deep, dreamless sleep and restorative rest. They help with healing, regeneration, and immune system function."}
                          {type === "theta" && "Theta waves occur during deep meditation, light sleep, and REM dreaming. They enhance creativity, intuition, and can facilitate profound relaxation."}
                          {type === "alpha" && "Alpha waves bridge the gap between conscious thinking and subconscious mind. They promote relaxed alertness, stress reduction, and positive thinking."}
                          {type === "beta" && "Beta waves are present during normal waking consciousness and active problem-solving. They support alertness, concentration, and cognitive processing."}
                          {type === "gamma" && "Gamma waves represent the fastest brainwave activity. They're linked to higher mental activity, including perception, problem-solving, and consciousness."}
                        </p>
                        
                        <div className="mt-4 flex justify-center">
                          <Button
                            onClick={() => {
                              setBeatFrequency(range.default)
                              updateFrequency()
                              if (!isPlaying) {
                                startTone()
                              }
                            }}
                            variant="outline"
                            className="gap-2"
                          >
                            <PlayCircle className="h-4 w-4" />
                            Try {type.charAt(0).toUpperCase() + type.slice(1)} Wave
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between border-t pt-6">
              <div className="text-sm text-muted-foreground flex items-center">
                <Headphones className="h-4 w-4 mr-2" />
                For optimal effect, please use stereo headphones
              </div>
              <a 
                href="https://en.wikipedia.org/wiki/Binaural_beats" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center mt-4 sm:mt-0"
              >
                Learn more about binaural beats
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
