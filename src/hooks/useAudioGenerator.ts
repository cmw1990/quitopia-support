import { useState, useEffect, useCallback } from 'react';
import { 
  getAudioEngine, 
  type AudioSettings, 
  type NoiseType, 
  type NatureSoundType 
} from '@/lib/audio-engine';

const DEFAULT_SETTINGS: AudioSettings = {
  noiseType: 'white',
  noiseVolume: 0.5,
  natureSoundType: null,
  natureSoundVolume: 0.5,
  binauralFrequency: 10,
  binauralVolume: 0.2,
  masterVolume: 0.7,
};

// URLs for nature sounds
const NATURE_SOUND_URLS: Record<NatureSoundType, string> = {
  rain: '/audio/rain.mp3',
  ocean: '/audio/ocean.mp3',
  forest: '/audio/forest.mp3',
  thunderstorm: '/audio/thunderstorm.mp3',
  river: '/audio/river.mp3',
  fire: '/audio/fire.mp3',
  birds: '/audio/birds.mp3',
  wind: '/audio/wind.mp3',
};

export const useAudioGenerator = (initialSettings?: Partial<AudioSettings>) => {
  const [audioEngine] = useState(() => getAudioEngine());
  const [isPlaying, setIsPlaying] = useState(false);
  const [settings, setSettings] = useState<AudioSettings>({
    ...DEFAULT_SETTINGS,
    ...initialSettings,
  });

  // Initialize audio engine and load sounds
  useEffect(() => {
    const initialize = async () => {
      await audioEngine.initialize();
      
      // Load nature sounds
      const loadPromises = Object.entries(NATURE_SOUND_URLS).map(
        ([type, url]) => audioEngine.loadNatureSound(type as NatureSoundType, url)
      );
      
      await Promise.all(loadPromises);
    };
    
    initialize();
    
    // Cleanup
    return () => {
      if (isPlaying) {
        audioEngine.stop();
      }
      // Note: We don't dispose the audio engine here because it's a singleton
      // and might be used by other components. The browser will clean it up
      // when the page is unloaded.
    };
  }, [audioEngine]);

  // Update engine when settings change
  useEffect(() => {
    audioEngine.updateSettings(settings);
  }, [audioEngine, settings]);

  // Toggle sound playback
  const toggleSound = useCallback(async (): Promise<boolean> => {
    if (isPlaying) {
      audioEngine.stop();
      setIsPlaying(false);
      return false;
    } else {
      const success = await audioEngine.play();
      setIsPlaying(success);
      return success;
    }
  }, [audioEngine, isPlaying]);

  // Update noise type
  const updateNoiseType = useCallback((type: NoiseType) => {
    setSettings(prev => ({ ...prev, noiseType: type }));
  }, []);

  // Update nature sound
  const updateNatureSound = useCallback((type: NatureSoundType | null) => {
    setSettings(prev => ({ ...prev, natureSoundType: type }));
  }, []);

  // Update volume for a specific sound type
  const updateVolume = useCallback((type: 'noise' | 'nature' | 'binaural' | 'master', value: number) => {
    setSettings(prev => {
      const newSettings: Partial<AudioSettings> = {};
      
      switch (type) {
        case 'noise':
          newSettings.noiseVolume = value;
          break;
        case 'nature':
          newSettings.natureSoundVolume = value;
          break;
        case 'binaural':
          newSettings.binauralVolume = value;
          break;
        case 'master':
          newSettings.masterVolume = value;
          break;
      }
      
      return { ...prev, ...newSettings };
    });
  }, []);

  // Update binaural beat frequency
  const updateBinauralFrequency = useCallback((frequency: number) => {
    setSettings(prev => ({ ...prev, binauralFrequency: frequency }));
  }, []);

  return {
    isPlaying,
    settings,
    setSettings,
    toggleSound,
    updateNoiseType,
    updateNatureSound,
    updateVolume,
    updateBinauralFrequency,
  };
};
