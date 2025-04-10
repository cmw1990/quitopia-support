
export const createNoiseBuffer = (context: AudioContext, type: 'white' | 'pink' | 'brown' | 'off' = 'white') => {
  const bufferSize = context.sampleRate * 2; // 2 seconds of noise
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const data = buffer.getChannelData(0);
  
  switch (type) {
    case 'pink': {
      // Pink noise generation (1/f noise)
      const b = [0, 0, 0, 0, 0, 0, 0];
      let white;
      for (let i = 0; i < bufferSize; i++) {
        white = Math.random() * 2 - 1;
        b[0] = 0.99886 * b[0] + white * 0.0555179;
        b[1] = 0.99332 * b[1] + white * 0.0750759;
        b[2] = 0.96900 * b[2] + white * 0.1538520;
        b[3] = 0.86650 * b[3] + white * 0.3104856;
        b[4] = 0.55000 * b[4] + white * 0.5329522;
        b[5] = -0.7616 * b[5] - white * 0.0168980;
        data[i] = b[0] + b[1] + b[2] + b[3] + b[4] + b[5] + b[6] + white * 0.5362;
        data[i] *= 0.11; // Normalize amplitude
      }
      break;
    }
    case 'brown': {
      // Brown noise generation (1/f² noise)
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // Normalize amplitude
      }
      break;
    }
    case 'white': {
      // White noise generation
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      break;
    }
    case 'off':
    default: {
      // Silence
      for (let i = 0; i < bufferSize; i++) {
        data[i] = 0;
      }
    }
  }
  
  return buffer;
};
