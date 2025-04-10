import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2, VolumeX, Play, Pause, Clock, Waves, Cloud, Droplets, Trees, Coffee, Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";

// Sound source type
type Sound = {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  type: 'noise' | 'ambient';
  volume: number;
  isPlaying: boolean;
};

export const FocusSounds: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [masterVolume, setMasterVolume] = useState(0.7);
  const audioSources = useRef<Map<string, OscillatorNode | AudioBufferSourceNode>>(new Map());
  const gainNodes = useRef<Map<string, GainNode>>(new Map());
  const masterGain = useRef<GainNode | null>(null);
  
  // Initialize with basic sound data
  const [sounds, setSounds] = useState<Sound[]>([
    { id: 'white-noise', name: 'White Noise', icon: Waves, type: 'noise', volume: 0.7, isPlaying: false },
    { id: 'pink-noise', name: 'Pink Noise', icon: Waves, type: 'noise', volume: 0.7, isPlaying: false },
    { id: 'brown-noise', name: 'Brown Noise', icon: Waves, type: 'noise', volume: 0.7, isPlaying: false },
    { id: 'rain', name: 'Rain', icon: Droplets, type: 'ambient', volume: 0.7, isPlaying: false },
    { id: 'forest', name: 'Forest', icon: Trees, type: 'ambient', volume: 0.7, isPlaying: false },
    { id: 'cafe', name: 'Cafe', icon: Coffee, type: 'ambient', volume: 0.7, isPlaying: false },
  ]);

  // Initialize audio context
  useEffect(() => {
    // Define resumeAudioContext outside since we need it for cleanup
    let resumeAudioContextCallback: () => void;
    
    try {
      // Safari and some mobile browsers require user interaction to create AudioContext
      // We'll start with audio context in a suspended state and resume it on user interaction
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(ctx);
      
      const master = ctx.createGain();
      master.gain.value = masterVolume;
      master.connect(ctx.destination);
      masterGain.current = master;
      
      // Set loading to false immediately since we're generating sounds dynamically
      setIsLoading(false);
      
      // Add a listener to resume audio context when user interacts with the page
      resumeAudioContextCallback = () => {
        if (ctx.state === 'suspended') {
          ctx.resume().catch(console.error);
        }
        
        // Only need to call once
        window.removeEventListener('click', resumeAudioContextCallback);
        window.removeEventListener('touchstart', resumeAudioContextCallback);
        window.removeEventListener('keydown', resumeAudioContextCallback);
      };
      
      window.addEventListener('click', resumeAudioContextCallback);
      window.addEventListener('touchstart', resumeAudioContextCallback);
      window.addEventListener('keydown', resumeAudioContextCallback);
      
    } catch (err) {
      console.error('Error initializing audio context:', err);
      toast({
        title: "Error",
        description: "Failed to initialize audio. Please try again or use a different browser.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
    
    return () => {
      // Clean up all audio nodes
      stopAllSounds();
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().catch(console.error);
      }
      
      // Clean up event listeners
      if (resumeAudioContextCallback) {
        window.removeEventListener('click', resumeAudioContextCallback);
        window.removeEventListener('touchstart', resumeAudioContextCallback);
        window.removeEventListener('keydown', resumeAudioContextCallback);
      }
    };
  }, []);
  
  // Update master volume
  useEffect(() => {
    if (masterGain.current) {
      masterGain.current.gain.value = masterVolume;
    }
  }, [masterVolume]);

  // Play a noise sound (generated via Web Audio API)
  const playNoiseSound = (soundId: string, noiseType: 'white' | 'pink' | 'brown') => {
    if (!audioContext) return;
    
    // Stop existing sound if playing
    stopSound(soundId);
    
    try {
      // For noise sounds, use Audio API to generate the noise
      if (noiseType === 'white') {
        // White noise is random samples
        const bufferSize = 2 * audioContext.sampleRate;
        const noiseBuffer = audioContext.createBuffer(
          1, bufferSize, audioContext.sampleRate
        );
        const output = noiseBuffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        
        const whiteNoise = audioContext.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;
        
        const gainNode = audioContext.createGain();
        const sound = sounds.find(s => s.id === soundId);
        if (sound) {
          gainNode.gain.value = sound.volume * 0.2; // Reduce volume for white noise
        }
        
        whiteNoise.connect(gainNode);
        gainNode.connect(masterGain.current!);
        
        whiteNoise.start(0);
        
        audioSources.current.set(soundId, whiteNoise);
        gainNodes.current.set(soundId, gainNode);
      } 
      else if (noiseType === 'pink' || noiseType === 'brown') {
        // Pink or brown noise requires filtering
        // We'll use a simple oscillator with multiple filters as an approximation
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sawtooth';
        oscillator.frequency.value = 100;
        
        const gainNode = audioContext.createGain();
        const sound = sounds.find(s => s.id === soundId);
        if (sound) {
          gainNode.gain.value = sound.volume * 0.15; // Lower volume for filtered noise
        }
        
        // Create filters for approximating pink/brown noise
        const filter1 = audioContext.createBiquadFilter();
        filter1.type = 'lowpass';
        filter1.frequency.value = noiseType === 'pink' ? 800 : 400;
        
        const filter2 = audioContext.createBiquadFilter();
        filter2.type = 'lowpass';
        filter2.frequency.value = noiseType === 'pink' ? 1200 : 600;
        
        const filter3 = audioContext.createBiquadFilter();
        filter3.type = 'lowpass';
        filter3.frequency.value = noiseType === 'pink' ? 2000 : 1000;
        
        // Connect nodes
        oscillator.connect(filter1);
        filter1.connect(filter2);
        filter2.connect(filter3);
        filter3.connect(gainNode);
        gainNode.connect(masterGain.current!);
        
        oscillator.start(0);
        
        audioSources.current.set(soundId, oscillator);
        gainNodes.current.set(soundId, gainNode);
      }
      
      // Update state
      setSounds(prevSounds => 
        prevSounds.map(s => 
          s.id === soundId ? { ...s, isPlaying: true } : s
        )
      );
    } catch (err) {
      console.error(`Error playing ${noiseType} noise:`, err);
      toast({
        title: "Error",
        description: `Failed to play ${noiseType} noise.`,
        variant: "destructive"
      });
    }
  };

  // Play an ambient sound (using recorded sound) - simplified to avoid file loading issues
  const playAmbientSound = (soundId: string) => {
    if (!audioContext) return;
    
    try {
      // For this simplified version, we'll simulate ambient sounds with oscillators
      const oscillator = audioContext.createOscillator();
      
      // Different settings for different ambient sounds
      if (soundId === 'rain') {
        oscillator.type = 'sawtooth';
        oscillator.frequency.value = 220;
      } else if (soundId === 'forest') {
        oscillator.type = 'triangle';
        oscillator.frequency.value = 150;
      } else if (soundId === 'cafe') {
        oscillator.type = 'sine';
        oscillator.frequency.value = 180;
      }
      
      const gainNode = audioContext.createGain();
      const sound = sounds.find(s => s.id === soundId);
      if (sound) {
        gainNode.gain.value = sound.volume * 0.1; // Lower volume for ambient sounds
      }
      
      // Add some filters to make it sound more like ambient
      const filter = audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 500;
      
      // Connect
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(masterGain.current!);
      
      oscillator.start(0);
      
      audioSources.current.set(soundId, oscillator);
      gainNodes.current.set(soundId, gainNode);
      
      // Update state
      setSounds(prevSounds => 
        prevSounds.map(s => 
          s.id === soundId ? { ...s, isPlaying: true } : s
        )
      );
    } catch (err) {
      console.error(`Error playing ambient sound ${soundId}:`, err);
      toast({
        title: "Error",
        description: `Failed to play ${soundId}.`,
        variant: "destructive"
      });
    }
  };

  // Play a specific sound
  const playSound = (soundId: string) => {
    if (!audioContext) {
      toast({
        title: "Error",
        description: "Audio context not initialized. Please refresh the page.",
        variant: "destructive"
      });
      return;
    }
    
    // Resume audio context if it's suspended (needed for some browsers like Safari)
    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(err => {
        console.error('Failed to resume audio context:', err);
        toast({
          title: "Audio Permission Required",
          description: "Please interact with the page first or check your browser permissions.",
          variant: "destructive"
        });
      });
    }
    
    const sound = sounds.find(s => s.id === soundId);
    if (!sound) return;
    
    // Stop first in case it's already playing
    stopSound(soundId);
    
    // Play based on sound type
    if (sound.type === 'noise') {
      if (soundId === 'white-noise') {
        playNoiseSound(soundId, 'white');
      } else if (soundId === 'pink-noise') {
        playNoiseSound(soundId, 'pink');
      } else if (soundId === 'brown-noise') {
        playNoiseSound(soundId, 'brown');
      }
    } else {
      playAmbientSound(soundId);
    }
  };

  // Stop a specific sound
  const stopSound = (soundId: string) => {
    const source = audioSources.current.get(soundId);
    if (source) {
      try {
        if ('stop' in source) {
          source.stop();
        }
        source.disconnect();
      } catch (e) {
        // Source might already be stopped
      }
      audioSources.current.delete(soundId);
    }
    
    const gainNode = gainNodes.current.get(soundId);
    if (gainNode) {
      gainNode.disconnect();
      gainNodes.current.delete(soundId);
    }
    
    // Update state
    setSounds(prevSounds => 
      prevSounds.map(s => 
        s.id === soundId ? { ...s, isPlaying: false } : s
      )
    );
  };

  // Toggle sound playback
  const toggleSound = (soundId: string) => {
    const sound = sounds.find(s => s.id === soundId);
    if (!sound) return;
    
    if (sound.isPlaying) {
      stopSound(soundId);
    } else {
      playSound(soundId);
    }
  };

  // Adjust volume for a specific sound
  const setSoundVolume = (soundId: string, volume: number) => {
    // Update gain node if sound is playing
    const gainNode = gainNodes.current.get(soundId);
    if (gainNode) {
      const sound = sounds.find(s => s.id === soundId);
      if (sound) {
        // Apply different volume scaling based on sound type
        if (sound.type === 'noise') {
          if (soundId === 'white-noise') {
            gainNode.gain.value = volume * 0.2;
          } else {
            gainNode.gain.value = volume * 0.15;
          }
        } else {
          gainNode.gain.value = volume * 0.1;
        }
      }
    }
    
    // Update state
    setSounds(prevSounds => 
      prevSounds.map(s => 
        s.id === soundId ? { ...s, volume } : s
      )
    );
  };

  // Stop all sounds
  const stopAllSounds = () => {
    sounds.forEach(sound => {
      if (sound.isPlaying) {
        stopSound(sound.id);
      }
    });
  };

  // Play all sounds
  const playAllSounds = () => {
    sounds.forEach(sound => {
      if (!sound.isPlaying) {
        playSound(sound.id);
      }
    });
  };

  // Check if any sound is playing
  const isAnySoundPlaying = sounds.some(sound => sound.isPlaying);

  return (
    <div className="bg-card rounded-lg shadow-sm border p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold mb-4">Focus Sounds Mixer</h2>
      <p className="text-muted-foreground mb-6">
        Mix ambient sounds to create your perfect focus environment. Adjust volume levels individually.
      </p>

      {/* Master Controls */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/20 rounded-lg mb-6">
        <Button 
          variant={isAnySoundPlaying ? "default" : "outline"} 
          size="sm"
          onClick={isAnySoundPlaying ? stopAllSounds : playAllSounds}
          disabled={isLoading}
          className="flex-shrink-0"
        >
          {isAnySoundPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
          {isAnySoundPlaying ? 'Stop All' : 'Play All'}
        </Button>
        
        <div className="flex items-center gap-2 flex-grow">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={[masterVolume]}
            onValueChange={(val) => setMasterVolume(val[0])}
            disabled={isLoading}
            aria-label="Master Volume"
            className="flex-grow"
          />
          <span className="text-xs font-mono w-10 text-right">{(masterVolume * 100).toFixed(0)}%</span>
        </div>
      </div>
      
      {/* Loading State */}
      {isLoading && (
        <div className="text-center p-8">
          <div className="animate-pulse bg-muted h-4 w-1/3 mx-auto rounded mb-2"></div>
          <div className="animate-pulse bg-muted h-4 w-1/2 mx-auto rounded"></div>
        </div>
      )}
      
      {/* Sound Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sounds.map((sound) => {
            const IconComponent = sound.icon;
            return (
              <Card key={sound.id} className={`transition-all border-2 ${sound.isPlaying ? 'border-primary shadow-md' : 'border-transparent'}`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <IconComponent className={`h-5 w-5 ${sound.isPlaying ? 'text-primary' : 'text-muted-foreground'}`} />
                    {sound.name}
                  </CardTitle>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => toggleSound(sound.id)}
                    className={`h-8 w-8 rounded-full ${sound.isPlaying ? 'bg-primary/10 text-primary' : ''}`}
                  >
                    {sound.isPlaying ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Slider
                      min={0} max={1} step={0.01}
                      value={[sound.volume]}
                      onValueChange={(val) => setSoundVolume(sound.id, val[0])}
                      aria-label={`${sound.name} volume`}
                      className="flex-grow"
                    />
                    <span className="text-xs font-mono w-8 text-right">{(sound.volume * 100).toFixed(0)}%</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
      {/* Tips */}
      <div className="mt-8 bg-muted/30 p-4 rounded-lg">
        <h3 className="font-medium mb-2 flex items-center gap-2">
          <Waves className="h-4 w-4" /> Sound Mixing Tips
        </h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• White noise is great for blocking out distractions</li>
          <li>• Natural sounds can create a calming environment</li>
          <li>• Lower volumes are often more effective for longer sessions</li>
          <li>• Try different combinations to find your perfect mix</li>
        </ul>
      </div>
    </div>
  );
};

export default FocusSounds; 