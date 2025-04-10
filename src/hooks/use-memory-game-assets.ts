import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/supabase-client';
import { useToast } from '@/hooks/use-toast';

export interface MemoryGameAssets {
  patternShapes: string;
  sequenceNumbers: string;
  wordChainBackground: string;
  memoryCardsBackground: string;
  successAnimation: string;
  focusIcon: string;
}

export const useMemoryGameAssets = () => {
  const [assets, setAssets] = useState<MemoryGameAssets | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const assetNames = [
          'pattern-shapes',
          'sequence-numbers',
          'word-chain-background',
          'memory-cards-background',
          'success-animation',
          'focus-icon'
        ];

        const loadedAssets: Record<string, string> = {};

        for (const name of assetNames) {
          const { data: { publicUrl } } = supabase
            .storage
            .from('game-assets')
            .getPublicUrl(`memory-games/${name}.png`);

          // Convert kebab-case to camelCase for the object keys
          const camelCaseName = name.replace(/-([a-z])/g, g => g[1].toUpperCase());
          loadedAssets[camelCaseName] = publicUrl;
        }

        setAssets(loadedAssets as unknown as MemoryGameAssets);
      } catch (error) {
        console.error('Error loading memory game assets:', error);
        toast({
          title: 'Error Loading Assets',
          description: 'Using fallback images. The games will still work.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAssets();
  }, [toast]);

  return { assets, isLoading };
};