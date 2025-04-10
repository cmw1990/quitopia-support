import { createModulation } from './createModulation';
import { createNoiseBuffer } from './createNoiseBuffer';
import type { NatureSound } from './natureTypes';

let audioContextInstance: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContextInstance) {
    audioContextInstance = new AudioContext();
  }
  return audioContextInstance;
};

// Create random bursts for thunder
const createThunderBurst = (context: AudioContext, masterGain: GainNode) => {
  const burstGain = context.createGain();
  const filter = context.createBiquadFilter();
  
  filter.type = 'lowpass';
  filter.frequency.value = 100;
  
  const noise = context.createBufferSource();
  noise.buffer = createNoiseBuffer(context);
  
  noise.connect(filter);
  filter.connect(burstGain);
  burstGain.connect(masterGain);
  
  burstGain.gain.setValueAtTime(0, context.currentTime);
  burstGain.gain.linearRampToValueAtTime(0.8, context.currentTime + 0.1);
  burstGain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 2);
  
  noise.start();
  noise.stop(context.currentTime + 2);
  
  setTimeout(() => {
    if (Math.random() > 0.7) {
      createThunderBurst(context, masterGain);
    }
  }, Math.random() * 10000 + 5000);
};

export const generateNatureSound = (type: NatureSound, volume = 0.5) => {
  const context = getAudioContext();
  const masterGain = context.createGain();
  masterGain.gain.value = volume;
  masterGain.connect(context.destination);

  const noiseBuffer = createNoiseBuffer(context);
  const noiseSource = context.createBufferSource();
  noiseSource.buffer = noiseBuffer;
  noiseSource.loop = true;

  switch (type) {
    case 'ocean': {
      const filter = context.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 850;
      filter.Q.value = 0.5;

      const modulator = createModulation(context, 0.1, 400);
      modulator.connect(filter.frequency);

      noiseSource.connect(filter);
      filter.connect(masterGain);
      break;
    }
    case 'rain': {
      const filter = context.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 2500;
      filter.Q.value = 0.2;

      noiseSource.connect(filter);
      filter.connect(masterGain);
      break;
    }
    case 'wind': {
      const filter = context.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 400;
      filter.Q.value = 1.0;

      const modulator = createModulation(context, 0.2, 200);
      modulator.connect(filter.frequency);

      noiseSource.connect(filter);
      filter.connect(masterGain);
      break;
    }
    case 'forest': {
      const highFilter = context.createBiquadFilter();
      highFilter.type = 'highpass';
      highFilter.frequency.value = 2000;
      highFilter.Q.value = 0.5;

      const lowFilter = context.createBiquadFilter();
      lowFilter.type = 'lowpass';
      lowFilter.frequency.value = 400;
      lowFilter.Q.value = 0.5;

      const modulator = createModulation(context, 0.3, 100);
      modulator.connect(highFilter.frequency);

      noiseSource.connect(highFilter);
      noiseSource.connect(lowFilter);
      highFilter.connect(masterGain);
      lowFilter.connect(masterGain);
      break;
    }
    case 'thunder': {
      const filter = context.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 100;
      
      noiseSource.connect(filter);
      filter.connect(masterGain);
      
      createThunderBurst(context, masterGain);
      break;
    }
    case 'crickets': {
      const filter = context.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 4500;
      filter.Q.value = 10;

      const modulator = createModulation(context, 20, 0.7);
      const modulatorGain = context.createGain();
      modulatorGain.gain.value = 0.3;
      
      modulator.connect(modulatorGain);
      modulatorGain.connect(filter.frequency);

      noiseSource.connect(filter);
      filter.connect(masterGain);
      break;
    }
    case 'birds': {
      const filter = context.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 3000;
      filter.Q.value = 5;

      const chirpModulator = createModulation(context, 10, 1000);
      chirpModulator.connect(filter.frequency);

      noiseSource.connect(filter);
      filter.connect(masterGain);

      setInterval(() => {
        if (Math.random() > 0.7) {
          filter.frequency.setTargetAtTime(2000 + Math.random() * 2000, context.currentTime, 0.1);
        }
      }, 1000);
      break;
    }
    case 'stream': {
      const filter1 = context.createBiquadFilter();
      filter1.type = 'bandpass';
      filter1.frequency.value = 600;
      filter1.Q.value = 1;

      const filter2 = context.createBiquadFilter();
      filter2.type = 'highpass';
      filter2.frequency.value = 2000;
      filter2.Q.value = 0.5;

      const modulator = createModulation(context, 0.5, 200);
      modulator.connect(filter1.frequency);

      noiseSource.connect(filter1);
      noiseSource.connect(filter2);
      filter1.connect(masterGain);
      filter2.connect(masterGain);
      break;
    }
    case 'shower-relax': {
      const filter = context.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 800;
      filter.Q.value = 0.5;

      const modulator = createModulation(context, 0.2, 100);
      modulator.connect(filter.frequency);

      noiseSource.connect(filter);
      filter.connect(masterGain);
      break;
    }
    case 'shower-calm': {
      const filter = context.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1000;
      filter.Q.value = 0.7;

      const modulator = createModulation(context, 0.15, 150);
      modulator.connect(filter.frequency);

      noiseSource.connect(filter);
      filter.connect(masterGain);
      break;
    }
    case 'shower-creative': {
      const filter = context.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1200;
      filter.Q.value = 0.6;

      const modulator = createModulation(context, 0.3, 200);
      modulator.connect(filter.frequency);

      noiseSource.connect(filter);
      filter.connect(masterGain);
      break;
    }
    case 'shower-energy': {
      const filter = context.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1500;
      filter.Q.value = 0.4;

      const modulator = createModulation(context, 0.4, 250);
      modulator.connect(filter.frequency);

      noiseSource.connect(filter);
      filter.connect(masterGain);
      break;
    }
  }

  noiseSource.start();
  return {
    stop: () => {
      noiseSource.stop();
      masterGain.disconnect();
    },
    setVolume: (newVolume: number) => {
      masterGain.gain.value = newVolume;
    }
  };
};