import React from 'react';
import { Card } from '@/components/ui/card';
import { FocusTimerTools } from '@/components/focus/FocusTimerTools';
import { FocusZoneCard } from '@/components/focus/zones/FocusZoneCard';
import { FocusRoutineCard } from '@/components/focus/routines/FocusRoutineCard';
import { TimeBlockingCard } from '@/components/focus/tools/TimeBlockingCard';
import { FocusAnalyticsDashboard } from '@/components/focus/analytics/FocusAnalyticsDashboard';
import { FocusEnvironment } from '@/components/focus/FocusEnvironment';
import { ADHDTaskBreakdown } from '@/components/focus/tasks/ADHDTaskBreakdown';
import { FocusInterruptionTracker } from '@/components/focus/FocusInterruptionTracker';
import { SmartBreakSuggestions } from '@/components/focus/SmartBreakSuggestions';
import { FocusHabitTracker } from '@/components/focus/habits/FocusHabitTracker';
import { FocusJournal } from '@/components/focus/journal/FocusJournal';
import { MedicationReminders } from '@/components/focus/medication/MedicationReminders';
import { NoiseSensitivitySettings } from '@/components/focus/noise/NoiseSensitivitySettings';
import { VisualOrganizationTools } from '@/components/focus/visual/VisualOrganizationTools';
import { BodyDoublingSession } from '@/components/focus/social/BodyDoublingSession';
import { useAuth } from '@/components/AuthProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Target, Puzzle, Users, Zap, Clock, BookOpen, Moon, Flower2 } from 'lucide-react';
import { MemoryCards } from '@/components/games/MemoryCards';
import { PatternMatch } from '@/components/games/PatternMatch';
import { WordScramble } from '@/components/games/WordScramble';
import { ColorMatch } from '@/components/games/ColorMatch';
import { MathSpeed } from '@/components/games/MathSpeed';
import { SimonSays } from '@/components/games/SimonSays';
import { SpeedTyping } from '@/components/games/SpeedTyping';
import { VisualMemory } from '@/components/games/VisualMemory';
import { PatternRecognition } from '@/components/games/PatternRecognition';
import { SequenceMemory } from '@/components/games/SequenceMemory';
import { WordAssociation } from '@/components/games/WordAssociation';
import { BrainMatch3 } from '@/components/games/BrainMatch3';
import { ReactionTimeTest } from '@/components/games/ReactionTimeTest';
import ZenDrift from '@/components/games/ZenDrift';
import { BreathingTechniques } from '@/components/breathing/BreathingTechniques';
import { supabase } from '@/integrations/supabase/supabase-client';

export const WebappFocus = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto p-4 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin">
          <Brain className="h-8 w-8 text-primary" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container max-w-6xl mx-auto p-4">
        <Card className="p-6">
          <div className="text-center space-y-4">
            <Brain className="h-12 w-12 text-primary mx-auto" />
            <h2 className="text-2xl font-semibold">Please Sign In</h2>
            <p className="text-muted-foreground">
              You need to be signed in to access the Focus Dashboard.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto space-y-8 p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-full animate-float">
          <Brain className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Focus Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FocusTimerTools />
        <ADHDTaskBreakdown />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FocusJournal />
        <FocusHabitTracker />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MedicationReminders />
        <NoiseSensitivitySettings />
        <VisualOrganizationTools />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FocusInterruptionTracker />
        <SmartBreakSuggestions />
      </div>

      <FocusAnalyticsDashboard />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FocusZoneCard />
        <FocusRoutineCard />
        <TimeBlockingCard />
      </div>

      <FocusEnvironment />

      <BodyDoublingSession />

      {/* Games section */}
      <Tabs defaultValue="quick" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <TabsTrigger value="quick" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Quick
          </TabsTrigger>
          <TabsTrigger value="memory" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Memory
          </TabsTrigger>
          <TabsTrigger value="relax" className="flex items-center gap-2">
            <Flower2 className="h-4 w-4" />
            Relax
          </TabsTrigger>
          <TabsTrigger value="cognitive" className="flex items-center gap-2">
            <Puzzle className="h-4 w-4" />
            Cognitive
          </TabsTrigger>
          <TabsTrigger value="timed" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Timed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quick" className="space-y-4">
          <BrainMatch3 />
          <ReactionTimeTest />
          <ColorMatch />
          <MathSpeed />
        </TabsContent>

        <TabsContent value="memory" className="space-y-4">
          <MemoryCards />
          <SequenceMemory />
          <VisualMemory />
        </TabsContent>

        <TabsContent value="relax" className="space-y-4">
          <ZenDrift />
          <BreathingTechniques />
        </TabsContent>

        <TabsContent value="cognitive" className="space-y-4">
          <WordScramble />
          <PatternMatch />
          <WordAssociation />
        </TabsContent>

        <TabsContent value="timed" className="space-y-4">
          <SimonSays />
          <SpeedTyping />
          <PatternRecognition />
        </TabsContent>
      </Tabs>

      {/* About section */}
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          About These Tools
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="font-medium text-primary">Focus Timer</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Customizable Pomodoro timer</li>
              <li>• Break reminders and suggestions</li>
              <li>• Focus score tracking</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-primary">ADHD Support</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Task breakdown assistance</li>
              <li>• Visual organization tools</li>
              <li>• Medication reminders</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-primary">Environment Control</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Noise sensitivity settings</li>
              <li>• Focus zones and routines</li>
              <li>• Smart break suggestions</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-primary">Cognitive Training</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Memory and pattern games</li>
              <li>• Speed and reaction tests</li>
              <li>• Relaxation exercises</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
