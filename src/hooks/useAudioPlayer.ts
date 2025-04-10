import { useState, useEffect, useRef } from 'react';

interface UseAudioPlayerProps {
  audioUrl: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
}

export const useAudioPlayer = ({ 
  audioUrl, 
  onProgress, 
  onComplete 
}: UseAudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
      const currentProgress = (audio.currentTime / audio.duration) * 100;
      setProgress(currentProgress);
      onProgress?.(currentProgress);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      onComplete?.();
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [audioUrl, onProgress, onComplete]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const seek = (newProgress: number) => {
    if (audioRef.current && duration) {
      const newTime = (newProgress / 100) * duration;
      audioRef.current.currentTime = newTime;
      setProgress(newProgress);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const setAudioVolume = (newVolume: number) => {
    setVolume(newVolume);
  };

  return {
    isPlaying,
    progress,
    duration,
    volume,
    isMuted,
    togglePlay,
    seek,
    toggleMute,
    setVolume: setAudioVolume
  };
};