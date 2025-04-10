const AudioContext = window.AudioContext || (window as any).webkitAudioContext;

// Types for audio engine
export type NoiseType = 'white' | 'pink' | 'brown' | 'grey';
export type NatureSoundType = 'rain' | 'ocean' | 'forest' | 'thunderstorm' | 'river' | 'fire' | 'birds' | 'wind';
export type BinauralBeatType = 'alpha' | 'beta' | 'theta' | 'delta' | 'gamma';

export interface AudioSettings {
  noiseType: NoiseType;
  noiseVolume: number;
  natureSoundType: NatureSoundType | null;
  natureSoundVolume: number;
  binauralFrequency: number;
  binauralVolume: number;
  masterVolume: number;
}

// Frequency ranges for binaural beats
export const BINAURAL_RANGES = {
  delta: { min: 0.5, max: 4, default: 2, name: 'Delta (0.5-4Hz)', description: 'Deep sleep, healing, dreamless sleep' },
  theta: { min: 4, max: 8, default: 6, name: 'Theta (4-8Hz)', description: 'Meditation, creativity, dreaming' },
  alpha: { min: 8, max: 14, default: 10, name: 'Alpha (8-14Hz)', description: 'Relaxed alertness, calm focus' },
  beta: { min: 14, max: 30, default: 20, name: 'Beta (14-30Hz)', description: 'Active thinking, concentration' },
  gamma: { min: 30, max: 100, default: 40, name: 'Gamma (30-100Hz)', description: 'Higher cognitive processing, problem solving' },
};

/**
 * Audio Engine class for generating ambient sounds
 */
export class AudioEngine {
  private context: AudioContext | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private natureNode: AudioBufferSourceNode | null = null;
  private binauralNodes: { carrier: OscillatorNode | null; modulator: OscillatorNode | null } = {
    carrier: null,
    modulator: null,
  };
  
  private gainNodes: {
    noise: GainNode | null;
    nature: GainNode | null;
    binaural: GainNode | null;
    master: GainNode | null;
  } = {
    noise: null,
    nature: null,
    binaural: null,
    master: null,
  };
  
  private natureSounds: Record<NatureSoundType, AudioBuffer | null> = {
    rain: null,
    ocean: null,
    forest: null,
    thunderstorm: null,
    river: null,
    fire: null,
    birds: null,
    wind: null,
  };
  
  private noiseBuffers: Record<NoiseType, AudioBuffer | null> = {
    white: null,
    pink: null,
    brown: null,
    grey: null,
  };
  
  private settings: AudioSettings = {
    noiseType: 'white',
    noiseVolume: 0.5,
    natureSoundType: null,
    natureSoundVolume: 0.5,
    binauralFrequency: 10,
    binauralVolume: 0.2,
    masterVolume: 0.7,
  };
  
  private isPlaying = false;
  
  /**
   * Initialize the audio context and gain nodes
   */
  public async initialize(): Promise<boolean> {
    try {
      if (!this.context) {
        this.context = new AudioContext();
        
        // Create gain nodes
        this.gainNodes.noise = this.context.createGain();
        this.gainNodes.nature = this.context.createGain();
        this.gainNodes.binaural = this.context.createGain();
        this.gainNodes.master = this.context.createGain();
        
        // Connect the individual gains to the master gain
        this.gainNodes.noise.connect(this.gainNodes.master);
        this.gainNodes.nature.connect(this.gainNodes.master);
        this.gainNodes.binaural.connect(this.gainNodes.master);
        
        // Connect master to output
        this.gainNodes.master.connect(this.context.destination);
        
        // Set initial volumes
        this.updateVolume('noise', this.settings.noiseVolume);
        this.updateVolume('nature', this.settings.natureSoundVolume);
        this.updateVolume('binaural', this.settings.binauralVolume);
        this.updateVolume('master', this.settings.masterVolume);
        
        // Generate noise buffers
        await this.generateNoiseBuffers();
      }
      
      return true;
    } catch (error) {
      console.error("Error initializing audio context:", error);
      return false;
    }
  }
  
  /**
   * Generate noise buffers for different noise colors
   */
  private async generateNoiseBuffers(): Promise<void> {
    if (!this.context) return;
    
    const sampleRate = this.context.sampleRate;
    const bufferSize = 2 * sampleRate; // 2 seconds of audio
    
    // White noise
    const whiteBuffer = this.context.createBuffer(2, bufferSize, sampleRate);
    const whiteL = whiteBuffer.getChannelData(0);
    const whiteR = whiteBuffer.getChannelData(1);
    
    for (let i = 0; i < bufferSize; i++) {
      whiteL[i] = Math.random() * 2 - 1;
      whiteR[i] = Math.random() * 2 - 1;
    }
    
    this.noiseBuffers.white = whiteBuffer;
    
    // Pink noise (1/f noise)
    const pinkBuffer = this.context.createBuffer(2, bufferSize, sampleRate);
    const pinkL = pinkBuffer.getChannelData(0);
    const pinkR = pinkBuffer.getChannelData(1);
    
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      
      const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      b6 = white * 0.115926;
      
      pinkL[i] = pink * 0.11;
      pinkR[i] = pink * 0.11;
    }
    
    this.noiseBuffers.pink = pinkBuffer;
    
    // Brown noise (1/f^2 noise)
    const brownBuffer = this.context.createBuffer(2, bufferSize, sampleRate);
    const brownL = brownBuffer.getChannelData(0);
    const brownR = brownBuffer.getChannelData(1);
    
    let lastL = 0;
    let lastR = 0;
    
    for (let i = 0; i < bufferSize; i++) {
      const whiteL = Math.random() * 2 - 1;
      const whiteR = Math.random() * 2 - 1;
      
      // Leaky integrator
      lastL = (0.02 * whiteL) + (0.98 * lastL);
      lastR = (0.02 * whiteR) + (0.98 * lastR);
      
      // Normalize to -1 to 1 range
      brownL[i] = lastL * 3.5;
      brownR[i] = lastR * 3.5;
    }
    
    this.noiseBuffers.brown = brownBuffer;
    
    // Grey noise (filtered white noise with EQ for better sound masking)
    const greyBuffer = this.context.createBuffer(2, bufferSize, sampleRate);
    const greyL = greyBuffer.getChannelData(0);
    const greyR = greyBuffer.getChannelData(1);
    
    // Start with white noise
    for (let i = 0; i < bufferSize; i++) {
      greyL[i] = Math.random() * 2 - 1;
      greyR[i] = Math.random() * 2 - 1;
    }
    
    // Apply simple high-shelf filter simulation
    let lastSampleL = 0;
    let lastSampleR = 0;
    
    for (let i = 0; i < bufferSize; i++) {
      // Simple high-pass filter
      greyL[i] = 0.7 * (greyL[i] - lastSampleL + 0.1 * greyL[i]);
      greyR[i] = 0.7 * (greyR[i] - lastSampleR + 0.1 * greyR[i]);
      
      lastSampleL = greyL[i];
      lastSampleR = greyR[i];
    }
    
    this.noiseBuffers.grey = greyBuffer;
  }
  
  /**
   * Load a nature sound from URL
   */
  public async loadNatureSound(type: NatureSoundType, url: string): Promise<void> {
    if (!this.context) await this.initialize();
    if (!this.context) return;
    
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
      
      this.natureSounds[type] = audioBuffer;
    } catch (error) {
      console.error(`Error loading ${type} sound:`, error);
    }
  }
  
  /**
   * Set audio settings
   */
  public updateSettings(newSettings: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    
    // Update volumes if playing
    if (this.isPlaying) {
      if (newSettings.noiseVolume !== undefined) {
        this.updateVolume('noise', newSettings.noiseVolume);
      }
      
      if (newSettings.natureSoundVolume !== undefined) {
        this.updateVolume('nature', newSettings.natureSoundVolume);
      }
      
      if (newSettings.binauralVolume !== undefined) {
        this.updateVolume('binaural', newSettings.binauralVolume);
      }
      
      if (newSettings.masterVolume !== undefined) {
        this.updateVolume('master', newSettings.masterVolume);
      }
      
      // If noise type changed, restart noise
      if (newSettings.noiseType && newSettings.noiseType !== this.settings.noiseType) {
        this.stopNoise();
        this.playNoise();
      }
      
      // If nature sound changed, restart nature sound
      if (newSettings.natureSoundType && newSettings.natureSoundType !== this.settings.natureSoundType) {
        this.stopNatureSound();
        if (newSettings.natureSoundType) {
          this.playNatureSound();
        }
      }
      
      // If binaural frequency changed, update it
      if (newSettings.binauralFrequency !== undefined && 
          this.binauralNodes.carrier && 
          this.binauralNodes.modulator) {
        this.updateBinauralFrequency();
      }
    }
  }
  
  /**
   * Update volume level for a specific sound type
   */
  public updateVolume(type: 'noise' | 'nature' | 'binaural' | 'master', value: number): void {
    if (!this.gainNodes[type]) return;
    
    // Ensure value is between 0 and 1
    const safeValue = Math.max(0, Math.min(1, value));
    
    // Apply volume curve (cubic) for more natural volume control
    const curvedValue = safeValue * safeValue * safeValue;
    
    this.settings[`${type}Volume` as keyof AudioSettings] = safeValue;
    this.gainNodes[type]!.gain.setValueAtTime(curvedValue, this.context?.currentTime || 0);
  }
  
  /**
   * Start playing audio
   */
  public async play(): Promise<boolean> {
    if (this.isPlaying) return true;
    
    try {
      if (!this.context) {
        await this.initialize();
      } else if (this.context.state === 'suspended') {
        await this.context.resume();
      }
      
      if (!this.context) return false;
      
      // Start noise
      this.playNoise();
      
      // Start nature sound if selected
      if (this.settings.natureSoundType) {
        this.playNatureSound();
      }
      
      // Start binaural beats
      this.playBinauralBeats();
      
      this.isPlaying = true;
      return true;
    } catch (error) {
      console.error("Error starting audio:", error);
      return false;
    }
  }
  
  /**
   * Stop all audio
   */
  public stop(): void {
    this.stopNoise();
    this.stopNatureSound();
    this.stopBinauralBeats();
    
    this.isPlaying = false;
  }
  
  /**
   * Play current noise type
   */
  private playNoise(): void {
    if (!this.context || !this.gainNodes.noise) return;
    
    const buffer = this.noiseBuffers[this.settings.noiseType];
    if (!buffer) return;
    
    try {
      this.noiseNode = this.context.createBufferSource();
      this.noiseNode.buffer = buffer;
      this.noiseNode.loop = true;
      this.noiseNode.connect(this.gainNodes.noise);
      this.noiseNode.start();
    } catch (error) {
      console.error("Error playing noise:", error);
    }
  }
  
  /**
   * Stop current noise
   */
  private stopNoise(): void {
    if (this.noiseNode) {
      try {
        this.noiseNode.stop();
        this.noiseNode.disconnect();
      } catch (error) {
        // Ignore errors when stopping
      }
      this.noiseNode = null;
    }
  }
  
  /**
   * Play selected nature sound
   */
  private playNatureSound(): void {
    if (!this.context || !this.gainNodes.nature || !this.settings.natureSoundType) return;
    
    const buffer = this.natureSounds[this.settings.natureSoundType];
    if (!buffer) return;
    
    try {
      this.natureNode = this.context.createBufferSource();
      this.natureNode.buffer = buffer;
      this.natureNode.loop = true;
      this.natureNode.connect(this.gainNodes.nature);
      this.natureNode.start();
    } catch (error) {
      console.error("Error playing nature sound:", error);
    }
  }
  
  /**
   * Stop nature sound
   */
  private stopNatureSound(): void {
    if (this.natureNode) {
      try {
        this.natureNode.stop();
        this.natureNode.disconnect();
      } catch (error) {
        // Ignore errors when stopping
      }
      this.natureNode = null;
    }
  }
  
  /**
   * Play binaural beats
   */
  private playBinauralBeats(): void {
    if (!this.context || !this.gainNodes.binaural) return;
    
    try {
      // Create carrier oscillator (base frequency)
      this.binauralNodes.carrier = this.context.createOscillator();
      this.binauralNodes.carrier.type = 'sine';
      this.binauralNodes.carrier.frequency.value = 200; // Base frequency
      
      // Create modulator oscillator (base + difference)
      this.binauralNodes.modulator = this.context.createOscillator();
      this.binauralNodes.modulator.type = 'sine';
      
      // Set the modulator frequency to create the desired beat frequency
      this.updateBinauralFrequency();
      
      // Connect both oscillators to the gain node
      this.binauralNodes.carrier.connect(this.gainNodes.binaural);
      this.binauralNodes.modulator.connect(this.gainNodes.binaural);
      
      // Start oscillators
      this.binauralNodes.carrier.start();
      this.binauralNodes.modulator.start();
    } catch (error) {
      console.error("Error playing binaural beats:", error);
    }
  }
  
  /**
   * Update binaural beat frequency
   */
  private updateBinauralFrequency(): void {
    if (!this.binauralNodes.carrier || !this.binauralNodes.modulator) return;
    
    const baseFrequency = 200; // Base carrier frequency
    const beatFrequency = this.settings.binauralFrequency; // Desired beat frequency
    
    this.binauralNodes.carrier.frequency.value = baseFrequency;
    this.binauralNodes.modulator.frequency.value = baseFrequency + beatFrequency;
  }
  
  /**
   * Stop binaural beats
   */
  private stopBinauralBeats(): void {
    if (this.binauralNodes.carrier) {
      try {
        this.binauralNodes.carrier.stop();
        this.binauralNodes.carrier.disconnect();
      } catch (error) {
        // Ignore errors when stopping
      }
      this.binauralNodes.carrier = null;
    }
    
    if (this.binauralNodes.modulator) {
      try {
        this.binauralNodes.modulator.stop();
        this.binauralNodes.modulator.disconnect();
      } catch (error) {
        // Ignore errors when stopping
      }
      this.binauralNodes.modulator = null;
    }
  }
  
  /**
   * Get current settings
   */
  public getSettings(): AudioSettings {
    return { ...this.settings };
  }
  
  /**
   * Check if audio is currently playing
   */
  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
  
  /**
   * Clean up resources
   */
  public dispose(): void {
    this.stop();
    
    if (this.context) {
      this.context.close();
      this.context = null;
    }
  }
}

// Singleton instance
let audioEngineInstance: AudioEngine | null = null;

/**
 * Get audio engine singleton
 */
export const getAudioEngine = (): AudioEngine => {
  if (!audioEngineInstance) {
    audioEngineInstance = new AudioEngine();
  }
  return audioEngineInstance;
}; 