import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Cloud, 
  CoffeeIcon, 
  Droplets, 
  Flame, 
  Info, 
  Keyboard, 
  Layers, 
  LightbulbIcon,
  Pause, 
  Play, 
  Save, 
  Sparkles, 
  Timer, 
  ToggleLeft, 
  Volume, 
  Volume1, 
  Volume2, 
  VolumeX, 
  Waves, 
  Wind, 
  X, 
  Brain 
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { useAuth } from '../AuthProvider';
import { supabaseRequest } from '@/utils/supabaseRequest'; // Corrected import
import { Input } from '../ui/input';

// Sound types
interface Sound {
  id: string;
  name: string;
  icon: React.ReactNode;
  src: string;
  category: 'nature' | 'ambient' | 'focus';
  color?: string;
}

interface SoundPreset {
  id: string;
  name: string;
  description: string;
  sounds: { id: string; volume: number }[];
  user_id?: string;
}

export function WhiteNoiseGenerator() {
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [activeCategory, setActiveCategory] = useState<'nature' | 'ambient' | 'focus'>('nature');
  const [activeSounds, setActiveSounds] = useState<{ id: string; volume: number }[]>([]);
  const [soundElements, setSoundElements] = useState<{ [key: string]: HTMLAudioElement }>({});
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [presets, setPresets] = useState<SoundPreset[]>([]);
  const [autoStopTime, setAutoStopTime] = useState<number | null>(null);
  const [autoStopCountdown, setAutoStopCountdown] = useState<number | null>(null);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDescription, setNewPresetDescription] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const { session, user } = useAuth();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Sound library
  const sounds: Sound[] = [
    // Nature sounds
    { id: 'rain', name: 'Rain', icon: <Droplets />, src: '/sounds/rain.mp3', category: 'nature', color: 'bg-blue-500/10 text-blue-500' },
    { id: 'ocean', name: 'Ocean Waves', icon: <Waves />, src: '/sounds/ocean.mp3', category: 'nature', color: 'bg-cyan-500/10 text-cyan-500' },
    { id: 'forest', name: 'Forest', icon: <Wind />, src: '/sounds/forest.mp3', category: 'nature', color: 'bg-green-500/10 text-green-500' },
    { id: 'thunder', name: 'Thunder', icon: <Cloud />, src: '/sounds/thunder.mp3', category: 'nature', color: 'bg-slate-500/10 text-slate-500' },
    { id: 'fire', name: 'Campfire', icon: <Flame />, src: '/sounds/fire.mp3', category: 'nature', color: 'bg-orange-500/10 text-orange-500' },
    
    // Ambient sounds
    { id: 'cafe', name: 'Café', icon: <CoffeeIcon />, src: '/sounds/cafe.mp3', category: 'ambient', color: 'bg-amber-500/10 text-amber-500' },
    { id: 'whitenoise', name: 'White Noise', icon: <Sparkles />, src: '/sounds/whitenoise.mp3', category: 'ambient', color: 'bg-gray-500/10 text-gray-500' },
    { id: 'brownoise', name: 'Brown Noise', icon: <Layers />, src: '/sounds/brownoise.mp3', category: 'ambient', color: 'bg-stone-500/10 text-stone-500' },
    
    // Focus sounds
    { id: 'typing', name: 'Keyboard Typing', icon: <Keyboard />, src: '/sounds/typing.mp3', category: 'focus', color: 'bg-purple-500/10 text-purple-500' },
    { id: 'lofi', name: 'Lo-Fi Beats', icon: <ToggleLeft />, src: '/sounds/lofi.mp3', category: 'focus', color: 'bg-pink-500/10 text-pink-500' }
  ];
  
  // Load user presets
  useEffect(() => {
    if (user) {
      loadPresets();
    } else {
      // Default presets for non-logged in users
      setPresets([
        {
          id: 'default-1',
          name: 'Deep Focus',
          description: 'Brown noise with a hint of rain',
          sounds: [
            { id: 'brownoise', volume: 60 },
            { id: 'rain', volume: 30 }
          ]
        },
        {
          id: 'default-2',
          name: 'Café Working',
          description: 'Coffee shop ambiance with lo-fi',
          sounds: [
            { id: 'cafe', volume: 50 },
            { id: 'lofi', volume: 40 }
          ]
        }
      ]);
    }
  }, [user]);
  
  // Initialize audio elements when sounds list changes
  useEffect(() => {
    const elements: { [key: string]: HTMLAudioElement } = {};
    
    sounds.forEach(sound => {
      const audio = new Audio(sound.src);
      audio.loop = true;
      audio.volume = 0;
      elements[sound.id] = audio;
    });
    
    setSoundElements(elements);
    
    // Cleanup function to stop and remove all audio elements
    return () => {
      Object.values(elements).forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    };
  }, []);
  
  // Update audio volumes when active sounds change
  useEffect(() => {
    if (!soundElements) return;
    
    // Set volumes for active sounds
    Object.keys(soundElements).forEach(soundId => {
      const activeSound = activeSounds.find(s => s.id === soundId);
      if (activeSound) {
        soundElements[soundId].volume = (activeSound.volume / 100) * (volume / 100);
      } else {
        soundElements[soundId].volume = 0;
      }
    });
  }, [activeSounds, volume, soundElements]);
  
  // Play/pause sounds when isPlaying changes
  useEffect(() => {
    if (!soundElements) return;
    
    if (isPlaying) {
      Object.values(soundElements).forEach(audio => {
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            // Auto-play was prevented, show a UI element to let the user manually start playback
            console.error("Autoplay prevented:", e);
            setIsPlaying(false);
            toast.error("Autoplay blocked by browser. Please click play again.");
          });
        }
      });
    } else {
      Object.values(soundElements).forEach(audio => {
        audio.pause();
      });
    }
  }, [isPlaying, soundElements]);
  
  // Auto-stop timer
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (autoStopTime && isPlaying) {
      setAutoStopCountdown(autoStopTime * 60);
      
      timerRef.current = setInterval(() => {
        setAutoStopCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timerRef.current!);
            setIsPlaying(false);
            setAutoStopTime(null);
            setAutoStopCountdown(null);
            toast.success('Sound playback stopped automatically');
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setAutoStopCountdown(null);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [autoStopTime, isPlaying]);
  
  // Format time for display
  const formatTime = (seconds: number | null) => {
    if (seconds === null) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Load user presets from database
  const loadPresets = async () => {
    if (!user || !session) return;
    
    try {
      // Use supabaseRequest, handle response, remove session arg
      const { data, error: loadError } = await supabaseRequest<SoundPreset[]>(
        `/rest/v1/sound_presets8?user_id=eq.${user.id}&order=created_at.desc`,
        { method: "GET" }
        // Removed session argument
      );
      if (loadError) throw loadError; // Propagate error
      
      if (data) {
        setPresets([
          ...data,
          // Default presets
          {
            id: 'default-1',
            name: 'Deep Focus',
            description: 'Brown noise with a hint of rain',
            sounds: [
              { id: 'brownoise', volume: 60 },
              { id: 'rain', volume: 30 }
            ]
          },
          {
            id: 'default-2',
            name: 'Café Working',
            description: 'Coffee shop ambiance with lo-fi',
            sounds: [
              { id: 'cafe', volume: 50 },
              { id: 'lofi', volume: 40 }
            ]
          }
        ]);
      }
    } catch (error) {
      console.error("Error loading sound presets:", error);
      toast.error('Failed to load sound presets');
    }
  };
  
  // Save a new preset
  const savePreset = async () => {
    if (activeSounds.length === 0) {
      toast.error('Please add at least one sound to your preset');
      return;
    }
    
    if (!newPresetName.trim()) {
      toast.error('Please enter a preset name');
      return;
    }
    
    setIsSaving(true);
    
    if (user && session) {
      try {
        const preset = {
          user_id: user.id,
          name: newPresetName.trim(),
          description: newPresetDescription.trim() || null,
          sounds: activeSounds
        };
        
        // Use supabaseRequest, handle response, remove session arg
        // Also ensure select and Prefer header to get the created item back
        const { data: dataResponse, error: saveError } = await supabaseRequest<SoundPreset[]>( // Expect array
          `/rest/v1/sound_presets8?select=*`,
          {
            method: "POST",
            headers: { 'Prefer': 'return=representation' }, // Request result back
            body: JSON.stringify(preset)
          }
          // Removed session argument
        );
        if (saveError) throw saveError; // Propagate error
        const data = dataResponse; // Keep as array for check below
        
        if (data && data.length > 0) {
          setPresets([data[0], ...presets]);
          setActivePreset(data[0].id);
          setNewPresetName('');
          setNewPresetDescription('');
          setIsEditMode(false);
          toast.success('Preset saved successfully');
        }
      } catch (error) {
        console.error("Error saving sound preset:", error);
        toast.error('Failed to save preset');
      } finally {
        setIsSaving(false);
      }
    } else {
      // For non-logged in users, just create a local preset
      const newId = 'local-' + Date.now();
      const newPreset: SoundPreset = {
        id: newId,
        name: newPresetName.trim(),
        description: newPresetDescription.trim(),
        sounds: [...activeSounds]
      };
      
      setPresets([newPreset, ...presets]);
      setActivePreset(newId);
      setNewPresetName('');
      setNewPresetDescription('');
      setIsEditMode(false);
      toast.success('Preset saved locally');
      setIsSaving(false);
    }
  };
  
  // Apply a preset
  const applyPreset = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (!preset) return;
    
    setActiveSounds(preset.sounds);
    setActivePreset(presetId);
    
    if (!isPlaying) {
      setIsPlaying(true);
    }
    
    toast.success(`Applied preset: ${preset.name}`);
  };
  
  // Toggle a sound on/off
  const toggleSound = (soundId: string) => {
    const existingIndex = activeSounds.findIndex(s => s.id === soundId);
    
    if (existingIndex >= 0) {
      // Remove sound
      setActiveSounds(activeSounds.filter(s => s.id !== soundId));
    } else {
      // Add sound with default volume
      setActiveSounds([...activeSounds, { id: soundId, volume: 50 }]);
    }
    
    // If applying a preset, clear the active preset
    if (activePreset) {
      setActivePreset(null);
    }
  };
  
  // Adjust the volume of an active sound
  const adjustSoundVolume = (soundId: string, newVolume: number) => {
    setActiveSounds(
      activeSounds.map(sound => 
        sound.id === soundId 
          ? { ...sound, volume: newVolume } 
          : sound
      )
    );
    
    // If applying a preset, clear the active preset
    if (activePreset) {
      setActivePreset(null);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Focus Sounds
          </CardTitle>
          <CardDescription>
            Enhance your focus with ambient background sounds
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Player Controls */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="flex flex-col items-center space-y-3">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPlaying(!isPlaying);
                    }}
                    size="lg"
                    className={`h-16 w-16 rounded-full ${isPlaying ? 'bg-primary/90 hover:bg-primary/80' : 'bg-primary'}`}
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="h-6 w-6 ml-1" />
                    )}
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    {isPlaying ? 'Playing' : 'Paused'}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Master Volume</Label>
                    <div className="flex items-center gap-2">
                      {volume === 0 ? (
                        <VolumeX className="h-4 w-4 text-muted-foreground" />
                      ) : volume < 30 ? (
                        <Volume className="h-4 w-4 text-muted-foreground" />
                      ) : volume < 70 ? (
                        <Volume1 className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Volume2 className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="w-8 text-sm text-right">{volume}%</span>
                    </div>
                  </div>
                  <Slider
                    value={[volume]}
                    onValueChange={([newVolume]) => setVolume(newVolume)}
                    max={100}
                    step={1}
                  />
                </div>
                
                <div className="flex flex-col items-center space-y-3">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="auto-stop" className="text-sm">Auto-Stop Timer</Label>
                    <Switch 
                      id="auto-stop" 
                      checked={autoStopTime !== null}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setAutoStopTime(30); // Default to 30 minutes
                        } else {
                          setAutoStopTime(null);
                        }
                      }}
                    />
                  </div>
                  
                  {autoStopTime !== null && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAutoStopTime(Math.max(5, (autoStopTime || 30) - 5));
                        }}
                        className="h-8 w-8 p-0"
                      >
                        -
                      </Button>
                      <div className="w-32 text-center">
                        <div className="font-mono text-lg">
                          {autoStopCountdown ? formatTime(autoStopCountdown) : formatTime(autoStopTime * 60)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {autoStopTime} minutes
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAutoStopTime(Math.min(120, (autoStopTime || 30) + 5));
                        }}
                        className="h-8 w-8 p-0"
                      >
                        +
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Active Sounds */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Active Sounds ({activeSounds.length})</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSounds([]);
                }}
                disabled={activeSounds.length === 0}
                className="h-8 px-2 text-xs"
              >
                Clear All
              </Button>
            </div>
            
            {activeSounds.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                <Volume2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No sounds active. Add sounds from the library below.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeSounds.map(activeSound => {
                  const sound = sounds.find(s => s.id === activeSound.id);
                  if (!sound) return null;
                  
                  return (
                    <Card key={sound.id} className={`border ${sound.color || 'border-primary/20'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-full ${sound.color || 'bg-primary/10'}`}>
                            {sound.icon}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{sound.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {sound.category.charAt(0).toUpperCase() + sound.category.slice(1)}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSound(sound.id);
                            }}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Volume className="h-4 w-4 text-muted-foreground" />
                          <Slider
                            value={[activeSound.volume]}
                            onValueChange={([newVolume]) => adjustSoundVolume(sound.id, newVolume)}
                            max={100}
                            step={1}
                            className="flex-1"
                          />
                          <span className="w-8 text-sm text-right">{activeSound.volume}%</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Sound Library */}
          <div className="space-y-4">
            <h3 className="font-medium">Sound Library</h3>
            
            <Tabs 
              value={activeCategory} 
              onValueChange={(value) => setActiveCategory(value as 'nature' | 'ambient' | 'focus')}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="nature" className="flex items-center gap-1">
                  <Droplets className="h-4 w-4" />
                  <span className="hidden sm:inline">Nature</span>
                </TabsTrigger>
                <TabsTrigger value="ambient" className="flex items-center gap-1">
                  <Wind className="h-4 w-4" />
                  <span className="hidden sm:inline">Ambient</span>
                </TabsTrigger>
                <TabsTrigger value="focus" className="flex items-center gap-1">
                  <Brain className="h-4 w-4" />
                  <span className="hidden sm:inline">Focus</span>
                </TabsTrigger>
              </TabsList>
              
              {['nature', 'ambient', 'focus'].map(category => (
                <TabsContent key={category} value={category}>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {sounds
                      .filter(sound => sound.category === category)
                      .map(sound => {
                        const isActive = activeSounds.some(s => s.id === sound.id);
                        
                        return (
                          <motion.div
                            key={sound.id}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            <Card 
                              className={`cursor-pointer h-full transition-colors hover:bg-muted/50 ${
                                isActive ? 'bg-primary/10 border-primary/30' : ''
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSound(sound.id);
                              }}
                            >
                              <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                                <div className={`p-3 rounded-full ${sound.color || 'bg-primary/10'} mt-2`}>
                                  {sound.icon}
                                </div>
                                <div className="font-medium">{sound.name}</div>
                                {isActive && (
                                  <Badge variant="default" className="mt-1">
                                    Active
                                  </Badge>
                                )}
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
          
          {/* Presets */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Sound Presets</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditMode(!isEditMode);
                }}
                className="gap-1"
              >
                {isEditMode ? 'Cancel' : 'Create Preset'}
              </Button>
            </div>
            
            <AnimatePresence>
              {isEditMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-dashed border-primary/40 mb-4">
                    <CardContent className="pt-6 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="preset-name">Preset Name</Label>
                        <Input
                          id="preset-name"
                          placeholder="E.g., Rainy Café Atmosphere"
                          value={newPresetName}
                          onChange={(e) => setNewPresetName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="preset-description">Description (Optional)</Label>
                        <Input
                          id="preset-description"
                          placeholder="Describe your sound mix..."
                          value={newPresetDescription}
                          onChange={(e) => setNewPresetDescription(e.target.value)}
                        />
                      </div>
                      
                      <div className="bg-muted/40 p-3 rounded-lg text-sm">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                          <div className="text-muted-foreground">
                            <p>
                              Your currently active sounds will be saved as a preset. Make sure
                              to adjust the sounds and volumes before saving.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          savePreset();
                        }}
                        disabled={!newPresetName.trim() || activeSounds.length === 0 || isSaving}
                        className="w-full"
                      >
                        <Save className="h-4 w-4 mr-1" /> Save Preset
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
            
            {presets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                <Save className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No presets saved yet. Create your first preset!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {presets.map(preset => (
                  <Card 
                    key={preset.id}
                    className={`cursor-pointer hover:bg-muted/30 transition-colors ${
                      activePreset === preset.id ? 'bg-primary/10 border-primary/30' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      applyPreset(preset.id);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h4 className="font-medium">{preset.name}</h4>
                        {activePreset === preset.id && (
                          <Badge variant="default" className="text-xs">
                            Active
                          </Badge>
                        )}
                      </div>
                      
                      {preset.description && (
                        <p className="text-sm text-muted-foreground mb-3">{preset.description}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-1">
                        {preset.sounds.map(presetSound => {
                          const sound = sounds.find(s => s.id === presetSound.id);
                          if (!sound) return null;
                          
                          return (
                            <Badge key={sound.id} variant="outline" className="text-xs">
                              {sound.name}
                            </Badge>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 