import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  CloudRain, 
  Waves as OceanIcon, 
  Trees, 
  CloudLightning, 
  Droplets,
  Flame,
  Bird,
  Wind
} from 'lucide-react';
import { type NatureSoundType } from '@/lib/audio-engine';

interface NatureSoundControlsProps {
  natureSoundType: NatureSoundType | null;
  natureSoundVolume: number;
  onNatureSoundChange: (type: NatureSoundType | null) => void;
  onVolumeChange: (volume: number) => void;
}

const NATURE_SOUNDS: Array<{
  type: NatureSoundType;
  label: string;
  icon: React.ReactNode;
  description: string;
}> = [
  {
    type: 'rain',
    label: 'Rain',
    icon: <CloudRain className="h-4 w-4" />,
    description: 'Gentle rainfall sounds for relaxation and focus'
  },
  {
    type: 'ocean',
    label: 'Ocean',
    icon: <OceanIcon className="h-4 w-4" />,
    description: 'Calming ocean waves to inspire creativity and calm'
  },
  {
    type: 'forest',
    label: 'Forest',
    icon: <Trees className="h-4 w-4" />,
    description: 'Peaceful forest ambience with birds and rustling leaves'
  },
  {
    type: 'thunderstorm',
    label: 'Storm',
    icon: <CloudLightning className="h-4 w-4" />,
    description: 'Distant thunder and rain for deep focus and dramatic effect'
  },
  {
    type: 'river',
    label: 'River',
    icon: <Droplets className="h-4 w-4" />,
    description: 'Flowing water sounds for a refreshing atmosphere'
  },
  {
    type: 'fire',
    label: 'Fire',
    icon: <Flame className="h-4 w-4" />,
    description: 'Crackling campfire sounds for warmth and comfort'
  },
  {
    type: 'birds',
    label: 'Birds',
    icon: <Bird className="h-4 w-4" />,
    description: 'Cheerful birdsong to create an uplifting environment'
  },
  {
    type: 'wind',
    label: 'Wind',
    icon: <Wind className="h-4 w-4" />,
    description: 'Gentle breeze through trees for a sense of openness'
  },
];

export function NatureSoundControls({
  natureSoundType,
  natureSoundVolume,
  onNatureSoundChange,
  onVolumeChange
}: NatureSoundControlsProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <Label className="text-base font-medium mb-2 block">Nature Sounds</Label>
        
        <div className="grid grid-cols-4 gap-2 mb-4">
          {NATURE_SOUNDS.map((sound) => (
            <Button
              key={sound.type}
              variant={natureSoundType === sound.type ? "default" : "outline"}
              size="sm"
              className="flex flex-col h-20 py-2"
              onClick={() => natureSoundType === sound.type 
                ? onNatureSoundChange(null) 
                : onNatureSoundChange(sound.type)
              }
            >
              <div className="mb-1">{sound.icon}</div>
              <span className="text-xs">{sound.label}</span>
            </Button>
          ))}
        </div>
        
        {natureSoundType && (
          <>
            <div className="text-sm text-muted-foreground mb-4">
              {NATURE_SOUNDS.find(s => s.type === natureSoundType)?.description}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="nature-volume">Nature Sound Volume</Label>
                <span className="text-sm text-muted-foreground">{Math.round(natureSoundVolume * 100)}%</span>
              </div>
              <Slider
                id="nature-volume"
                value={[natureSoundVolume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={(values) => onVolumeChange(values[0])}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
