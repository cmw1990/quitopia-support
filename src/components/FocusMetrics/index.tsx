import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { Brain, Zap } from 'lucide-react';

interface FocusMetricsProps {
  energyLevel: number;
  focusLevel: number;
  onEnergyChange: (value: number) => void;
  onFocusChange: (value: number) => void;
  onSave: () => void;
}

export function FocusMetrics({
  energyLevel,
  focusLevel,
  onEnergyChange,
  onFocusChange,
  onSave
}: FocusMetricsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-dashed border-primary/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">How was your focus session?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="flex items-center gap-1">
                <Zap className="h-4 w-4 text-amber-500" />
                Energy Level
              </Label>
              <Badge 
                variant="outline" 
                className="font-mono"
              >
                {energyLevel}/10
              </Badge>
            </div>
            <Slider
              value={[energyLevel]}
              min={1}
              max={10}
              step={1}
              onValueChange={(values) => onEnergyChange(values[0])}
              className="py-1"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Low Energy</span>
              <span>High Energy</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="flex items-center gap-1">
                <Brain className="h-4 w-4 text-blue-500" />
                Focus Level
              </Label>
              <Badge 
                variant="outline" 
                className="font-mono"
              >
                {focusLevel}/10
              </Badge>
            </div>
            <Slider
              value={[focusLevel]}
              min={1}
              max={10}
              step={1}
              onValueChange={(values) => onFocusChange(values[0])}
              className="py-1"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Easily Distracted</span>
              <span>Deeply Focused</span>
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <Button onClick={onSave}>
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}