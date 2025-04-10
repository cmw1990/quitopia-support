export const createModulation = (context: AudioContext, frequency: number, depth: number) => {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  
  oscillator.frequency.value = frequency;
  gain.gain.value = depth;
  oscillator.connect(gain);
  oscillator.start();
  
  return gain;
};