import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Slider } from '../../components/ui/slider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

interface SoundOption {
  id: string;
  name: string;
  icon: string;
  audioUrl: string;
}

const SOUND_OPTIONS: SoundOption[] = [
  { 
    id: 'white-noise', 
    name: 'White Noise', 
    icon: '🌫️', 
    audioUrl: '/sounds/white-noise.mp3' 
  },
  { 
    id: 'pink-noise', 
    name: 'Pink Noise', 
    icon: '🌸', 
    audioUrl: '/sounds/pink-noise.mp3' 
  },
  { 
    id: 'brown-noise', 
    name: 'Brown Noise', 
    icon: '🌰', 
    audioUrl: '/sounds/brown-noise.mp3' 
  },
  { 
    id: 'rain', 
    name: 'Rain', 
    icon: '🌧️', 
    audioUrl: '/sounds/rain.mp3' 
  },
  { 
    id: 'ocean', 
    name: 'Ocean Waves', 
    icon: '🌊', 
    audioUrl: '/sounds/ocean.mp3' 
  },
  { 
    id: 'forest', 
    name: 'Forest', 
    icon: '🌳', 
    audioUrl: '/sounds/forest.mp3' 
  },
  { 
    id: 'fire', 
    name: 'Fireplace', 
    icon: '🔥', 
    audioUrl: '/sounds/fire.mp3' 
  },
  { 
    id: 'cafe', 
    name: 'Cafe Ambience', 
    icon: '☕', 
    audioUrl: '/sounds/cafe.mp3' 
  }
];

export function WhiteNoiseTool() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [selectedSound, setSelectedSound] = useState<SoundOption>(SOUND_OPTIONS[0]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.loop = true;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Update sound when selection changes
  useEffect(() => {
    if (!audioRef.current) return;
    
    const wasPlaying = !audioRef.current.paused;
    audioRef.current.src = selectedSound.audioUrl;
    audioRef.current.volume = volume / 100;
    
    if (wasPlaying) {
      audioRef.current.play().catch(err => console.error('Error playing audio:', err));
    }
  }, [selectedSound, volume]);

  // Play/pause toggle
  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => console.error('Error playing audio:', err));
    }
    
    setIsPlaying(!isPlaying);
  };

  // Handle volume change
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">White Noise Tool</h1>
      
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Ambient Sounds</CardTitle>
          <CardDescription>
            Choose from various ambient sounds to help you focus, relax, or sleep.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="sounds" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="sounds">Sound Library</TabsTrigger>
              <TabsTrigger value="mixer">Sound Mixer</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sounds" className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SOUND_OPTIONS.map((sound) => (
                  <Button
                    key={sound.id}
                    variant={selectedSound.id === sound.id ? "default" : "outline"}
                    className="h-24 flex flex-col items-center justify-center"
                    onClick={() => setSelectedSound(sound)}
                  >
                    <span className="text-2xl mb-1">{sound.icon}</span>
                    <span>{sound.name}</span>
                  </Button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="mixer" className="space-y-4">
              <p className="text-sm text-gray-500">
                Sound mixer feature coming soon. You'll be able to mix multiple sounds together.
              </p>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <span>Volume</span>
              <span>{volume}%</span>
            </div>
            <Slider
              value={[volume]}
              min={0}
              max={100}
              step={1}
              onValueChange={(value) => handleVolumeChange(value[0])}
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <div className="text-sm">
            <p>Currently playing: <strong>{selectedSound.name}</strong></p>
          </div>
          <Button onClick={togglePlay}>
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 