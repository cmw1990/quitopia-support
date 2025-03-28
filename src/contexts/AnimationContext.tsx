import React, { createContext, useContext, useEffect, useState } from "react";

interface AnimationContextProps {
  prefersReducedMotion: boolean;
  animationsEnabled: boolean;
  setAnimationsEnabled: (enabled: boolean) => void;
  animationSpeed: 'slow' | 'normal' | 'fast';
  setAnimationSpeed: (speed: 'slow' | 'normal' | 'fast') => void;
  getTransition: (customSpeed?: 'slow' | 'normal' | 'fast') => {
    type: "tween" | "spring";
    duration?: number;
    ease?: [number, number, number, number] | string;
    stiffness?: number;
    damping?: number;
  };
  getVariants: (delay?: number) => {
    initial: object;
    animate: object;
    exit: object;
  };
  staggerDelay: number;
  getStaggerTransition: (index: number) => {
    delay: number;
  };
}

const defaultContext: AnimationContextProps = {
  prefersReducedMotion: false,
  animationsEnabled: true,
  setAnimationsEnabled: () => {},
  animationSpeed: 'normal',
  setAnimationSpeed: () => {},
  getTransition: () => ({ type: "tween", duration: 0.3 }),
  getVariants: () => ({ initial: {}, animate: {}, exit: {} }),
  staggerDelay: 0.05,
  getStaggerTransition: () => ({ delay: 0 }),
};

const AnimationContext = createContext<AnimationContextProps>(defaultContext);

export const useAnimation = () => useContext(AnimationContext);

interface AnimationProviderProps {
  children: React.ReactNode;
}

export const AnimationProvider: React.FC<AnimationProviderProps> = ({ children }) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [staggerDelay, setStaggerDelay] = useState(0.05);

  // Check for user's preference for reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Update stagger delay based on animation speed
  useEffect(() => {
    const speedMap = {
      slow: 0.08,
      normal: 0.05,
      fast: 0.03
    };
    setStaggerDelay(speedMap[animationSpeed]);
  }, [animationSpeed]);

  // Get transition configuration based on animation speed
  const getTransition = (customSpeed?: 'slow' | 'normal' | 'fast') => {
    if (!animationsEnabled || prefersReducedMotion) {
      return { type: "tween" as const, duration: 0 };
    }

    const speed = customSpeed || animationSpeed;
    
    // Spring configuration
    if (speed === 'normal') {
      return {
        type: "spring" as const,
        stiffness: 400,
        damping: 30
      };
    }
    
    // Tween configuration with easing
    const speedMap = {
      slow: 0.6,
      normal: 0.3,
      fast: 0.2
    };
    
    // Using a fixed tuple type for the ease array
    const easeValues: [number, number, number, number] = [0.22, 1, 0.36, 1];
    
    return {
      type: "tween" as const,
      duration: speedMap[speed],
      ease: easeValues
    };
  };

  // Get standard animation variants
  const getVariants = (delay = 0) => {
    const shouldAnimate = animationsEnabled && !prefersReducedMotion;
    
    return {
      initial: shouldAnimate ? { opacity: 0, y: 10 } : { opacity: 1 },
      animate: {
        opacity: 1,
        y: 0,
        transition: {
          ...getTransition(),
          delay
        }
      },
      exit: shouldAnimate ? { 
        opacity: 0, 
        y: -10,
        transition: getTransition('fast')
      } : { opacity: 0 }
    };
  };

  // Get staggered transition for lists
  const getStaggerTransition = (index: number) => {
    if (!animationsEnabled || prefersReducedMotion) {
      return { delay: 0 };
    }
    return { delay: index * staggerDelay };
  };

  const contextValue: AnimationContextProps = {
    prefersReducedMotion,
    animationsEnabled,
    setAnimationsEnabled,
    animationSpeed,
    setAnimationSpeed,
    getTransition,
    getVariants,
    staggerDelay,
    getStaggerTransition
  };

  return (
    <AnimationContext.Provider value={contextValue}>
      {children}
    </AnimationContext.Provider>
  );
}; 