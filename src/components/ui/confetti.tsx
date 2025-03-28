import React, { useState, useEffect } from 'react';
import ReactConfetti from 'react-confetti';
import { hapticFeedback } from '@/utils/hapticFeedback';

interface ConfettiProps {
  duration?: number;
  recycle?: boolean;
  numberOfPieces?: number;
  colors?: string[];
  onComplete?: () => void;
}

export const Confetti: React.FC<ConfettiProps> = ({ 
  duration = 5000, 
  recycle = true, 
  numberOfPieces = 200, 
  colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4'],
  onComplete
}) => {
  const [isActive, setIsActive] = useState(true);
  const [windowDimensions, setWindowDimensions] = useState({ 
    width: typeof window !== 'undefined' ? window.innerWidth : 0, 
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  useEffect(() => {
    // Set timer to remove confetti after duration
    const timer = setTimeout(() => {
      setIsActive(false);
      if (onComplete) {
        onComplete();
      }
    }, duration);

    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Add resize listener
    window.addEventListener('resize', handleResize);

    // Provide haptic feedback when confetti starts
    if (isActive) {
      hapticFeedback.medium();
    }

    // Cleanup
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [duration, onComplete]);

  if (!isActive) return null;

  return (
    <ReactConfetti
      width={windowDimensions.width}
      height={windowDimensions.height}
      recycle={recycle}
      numberOfPieces={numberOfPieces}
      colors={colors}
      confettiSource={{
        x: windowDimensions.width / 2,
        y: windowDimensions.height / 3,
        w: 0,
        h: 0
      }}
    />
  );
}; 