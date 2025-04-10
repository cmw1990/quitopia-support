import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { GomokuSettings, GomokuVariant, BoardSize } from './types';

interface Props {
  settings: GomokuSettings;
  onSettingsChange: (settings: GomokuSettings) => void;
  className?: string;
}

const GomokuSettings: React.FC<Props> = ({
  settings,
  onSettingsChange,
  className = '',
}) => {
  return (
    <div className={`flex gap-4 ${className}`}>
      <Select
        value={settings.variant}
        onValueChange={(value) => 
          onSettingsChange({ ...settings, variant: value as GomokuVariant })
        }
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Variant" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="standard">Standard</SelectItem>
          <SelectItem value="swap2">Swap2</SelectItem>
          <SelectItem value="renju">Renju</SelectItem>
          <SelectItem value="freestyle">Freestyle</SelectItem>
          <SelectItem value="pro">Pro</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={settings.boardSize.toString()}
        onValueChange={(value) => 
          onSettingsChange({ ...settings, boardSize: parseInt(value) as BoardSize })
        }
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Board Size" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="13">13×13</SelectItem>
          <SelectItem value="15">15×15</SelectItem>
          <SelectItem value="17">17×17</SelectItem>
          <SelectItem value="19">19×19</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={settings.difficulty}
        onValueChange={(value) => 
          onSettingsChange({ ...settings, difficulty: value })
        }
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Difficulty" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">Easy</SelectItem>
          <SelectItem value="2">Medium</SelectItem>
          <SelectItem value="3">Hard</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default GomokuSettings;