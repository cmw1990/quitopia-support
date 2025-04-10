import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

// Import game components
import { MemoryCards } from './MemoryCards';
import { PatternMatch } from './PatternMatch';
import { WordScramble } from './WordScramble';
import { ColorMatch } from './ColorMatch';
import { MathSpeed } from './MathSpeed';
import { SimonSays } from './SimonSays';
import { SpeedTyping } from './SpeedTyping';
import { VisualMemory } from './VisualMemory';
import { PatternRecognition } from './PatternRecognition';
import { SequenceMemory } from './SequenceMemory';
import { WordAssociation } from './WordAssociation';
import { BrainMatch3 } from './BrainMatch3';
import { ReactionTimeTest } from './ReactionTimeTest';
import { ZenDrift } from './ZenDrift';

export const GamesLayout: React.FC = () => {
  const games = [
    { path: 'memory-cards', name: 'Memory Cards', component: MemoryCards },
    { path: 'pattern-match', name: 'Pattern Match', component: PatternMatch },
    { path: 'word-scramble', name: 'Word Scramble', component: WordScramble },
    { path: 'color-match', name: 'Color Match', component: ColorMatch },
    { path: 'math-speed', name: 'Math Speed', component: MathSpeed },
    { path: 'simon-says', name: 'Simon Says', component: SimonSays },
    { path: 'speed-typing', name: 'Speed Typing', component: SpeedTyping },
    { path: 'visual-memory', name: 'Visual Memory', component: VisualMemory },
    { path: 'pattern-recognition', name: 'Pattern Recognition', component: PatternRecognition },
    { path: 'sequence-memory', name: 'Sequence Memory', component: SequenceMemory },
    { path: 'word-association', name: 'Word Association', component: WordAssociation },
    { path: 'brain-match3', name: 'Brain Match 3', component: BrainMatch3 },
    { path: 'reaction-time', name: 'Reaction Time Test', component: ReactionTimeTest },
    { path: 'zen-drift', name: 'Zen Drift', component: ZenDrift },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Focus Games</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {games.map(({ path, name }) => (
          <Link
            key={path}
            to={path}
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-lg font-semibold">{name}</h2>
          </Link>
        ))}
      </div>

      <Routes>
        {games.map(({ path, component: Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
      </Routes>
    </div>
  );
};
