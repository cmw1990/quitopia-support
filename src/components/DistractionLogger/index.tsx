import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Plus, X, ZapOff } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface DistractionLoggerProps {
  distractions: string[];
  onAddDistraction: (distraction: string) => void;
  onRemoveDistraction: (index: number) => void;
}

export function DistractionLogger({
  distractions,
  onAddDistraction,
  onRemoveDistraction,
}: DistractionLoggerProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem('distraction') as HTMLInputElement;
    if (input.value.trim()) {
      onAddDistraction(input.value.trim());
      input.value = '';
    }
  };

  const commonDistractions = [
    'Social media notifications',
    'Email checking',
    'Phone calls',
    'Background noise',
    'Hunger/thirst',
    'Mental fatigue',
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ZapOff className="h-5 w-5" />
          Distraction Logger
        </CardTitle>
        <CardDescription>
          Track distractions to improve your focus sessions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            name="distraction"
            placeholder="What distracted you?"
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </form>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Logged Distractions</Label>
            {distractions.length > 0 && (
              <Badge variant="secondary">
                {distractions.length} {distractions.length === 1 ? 'item' : 'items'}
              </Badge>
            )}
          </div>

          <motion.div layout className="space-y-2">
            <AnimatePresence mode="popLayout">
              {distractions.map((distraction, index) => (
                <motion.div
                  key={`${distraction}-${index}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="group flex items-center gap-2"
                >
                  <div className="flex-1 rounded-md border bg-muted/50 px-3 py-2 text-sm">
                    {distraction}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100"
                    onClick={() => onRemoveDistraction(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>

        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle className="h-4 w-4" />
            Common Distractions & Tips
          </div>
          <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
            {commonDistractions.map((distraction, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                <span>{distraction}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 