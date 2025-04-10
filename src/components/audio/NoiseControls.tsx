import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Wind, Hash, Waves, Grid } from 'lucide-react';
import { type NoiseType } from '@/lib/audio-engine';

interface NoiseControlsProps {
  noiseType: NoiseType;
  noiseVolume: number;
  onNoiseTypeChange: (type: NoiseType) => void;
  onVolumeChange: (volume: number) => void;
}

const NOISE_DESCRIPTIONS = {
  white: "White noise contains equal energy across all frequencies, similar to TV static. Effective for masking a wide range of sounds.",
  pink: "Pink noise decreases in energy as frequency increases, creating a more balanced and natural sound. Often described as more pleasant than white noise.",
  brown: "Brown (or red) noise emphasizes lower frequencies, creating a deeper, richer sound similar to heavy rainfall or ocean waves.",
  grey: "Grey noise is specially filtered to match the ear's frequency response, creating a perceptually flat sound that's especially effective for masking speech."
};

export function NoiseControls({
  noiseType,
  noiseVolume,
  onNoiseTypeChange,
  onVolumeChange
}: NoiseControlsProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <Label className="text-base font-medium mb-2 block">Noise Type</Label>
        
        <Tabs value={noiseType} onValueChange={(value) => onNoiseTypeChange(value as NoiseType)} className="mb-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="white" className="flex items-center">
              <Hash className="h-4 w-4 mr-2" />
              White
            </TabsTrigger>
            <TabsTrigger value="pink" className="flex items-center">
              <Waves className="h-4 w-4 mr-2" />
              Pink
            </TabsTrigger>
            <TabsTrigger value="brown" className="flex items-center">
              <Wind className="h-4 w-4 mr-2" />
              Brown
            </TabsTrigger>
            <TabsTrigger value="grey" className="flex items-center">
              <Grid className="h-4 w-4 mr-2" />
              Grey
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-2 text-sm text-muted-foreground">
            {NOISE_DESCRIPTIONS[noiseType]}
          </div>
        </Tabs>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="noise-volume">Noise Volume</Label>
            <span className="text-sm text-muted-foreground">{Math.round(noiseVolume * 100)}%</span>
          </div>
          <Slider
            id="noise-volume"
            value={[noiseVolume]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={(values) => onVolumeChange(values[0])}
          />
        </div>
      </CardContent>
    </Card>
  );
}
