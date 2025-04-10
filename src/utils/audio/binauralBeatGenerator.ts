let audioContextInstance: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContextInstance) {
    audioContextInstance = new AudioContext();
  }
  return audioContextInstance;
};

export const generateBinauralBeat = (baseFreq: number, beatFreq: number, volume = 0.5) => {
  const context = getAudioContext();
  const masterGain = context.createGain();
  masterGain.gain.value = volume;
  masterGain.connect(context.destination);

  // Create two oscillators slightly detuned
  const osc1 = context.createOscillator();
  const osc2 = context.createOscillator();
  
  // Pan oscillators left and right
  const panLeft = context.createStereoPanner();
  const panRight = context.createStereoPanner();
  
  panLeft.pan.value = -1;
  panRight.pan.value = 1;

  osc1.frequency.value = baseFreq;
  osc2.frequency.value = baseFreq + beatFreq;

  osc1.connect(panLeft);
  osc2.connect(panRight);
  panLeft.connect(masterGain);
  panRight.connect(masterGain);

  osc1.start();
  osc2.start();

  return {
    stop: () => {
      osc1.stop();
      osc2.stop();
      masterGain.disconnect();
    },
    setVolume: (newVolume: number) => {
      masterGain.gain.value = newVolume;
    }
  };
};