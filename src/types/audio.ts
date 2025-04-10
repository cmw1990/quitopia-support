import type { NatureSound } from "@/utils/audio/natureTypes";
import type { Database } from "@/integrations/supabase/types";

export interface AudioState {
  noise: AudioBufferSourceNode | null;
  nature: ReturnType<typeof import("@/utils/audio").generateNatureSound> | null;
  binaural: ReturnType<typeof import("@/utils/audio").generateBinauralBeat> | null;
}

export interface AudioSettings {
  noiseType: 'white' | 'pink' | 'brown' | 'off';
  noiseVolume: number;
  natureSoundType: NatureSound | null;
  natureSoundVolume: number;
  binauralFrequency: number | null;
  binauralVolume: number;
}
