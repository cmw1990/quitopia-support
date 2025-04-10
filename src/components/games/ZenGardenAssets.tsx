import { useState, useEffect } from 'react';
import { SUPABASE_URL, SUPABASE_KEY } from '@/integrations/supabase/db-client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthProvider';

export interface ZenGardenAssets {
  sand: string;
  rocks: string[];
  plants: string[];
  rake: string;
  background: string;
}

export const useZenGardenAssets = () => {
  const { session } = useAuth();
  const [assets, setAssets] = useState<ZenGardenAssets>({
    sand: '/placeholder.svg',
    rocks: ['/placeholder.svg'],
    plants: ['/placeholder.svg'],
    rake: '/placeholder.svg',
    background: '/placeholder.svg'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const assetTypes = ['sand', 'rocks', 'plants', 'rake', 'background'];
        const loadedAssets: Partial<ZenGardenAssets> = {
          rocks: [],
          plants: []
        };

        for (const type of assetTypes) {
          if (type === 'rocks' || type === 'plants') {
            const response = await fetch(
              `${SUPABASE_URL}/storage/v1/object/list/game-assets/zen-garden/${type}`,
              {
                headers: {
                  'apikey': SUPABASE_KEY
                }
              }
            );

            if (!response.ok) {
              throw new Error(`Failed to load ${type} assets`);
            }

            const data = await response.json();
            const urls = data.map((item: any) => 
              `${SUPABASE_URL}/storage/v1/object/public/game-assets/zen-garden/${type}/${item.name}`
            );
            loadedAssets[type] = urls;
          } else {
            const response = await fetch(
              `${SUPABASE_URL}/storage/v1/object/public/game-assets/zen-garden/${type}.png`,
              {
                headers: {
                  'apikey': SUPABASE_KEY
                }
              }
            );

            if (!response.ok) {
              throw new Error(`Failed to load ${type} asset`);
            }

            loadedAssets[type] = response.url;
          }
        }

        setAssets(loadedAssets as ZenGardenAssets);
      } catch (err) {
        console.error('Error loading zen garden assets:', err);
        setError(err as Error);
        toast({
          title: "Asset Loading Error",
          description: "Using placeholder images for now. The game will still work!",
          variant: "default",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAssets();
  }, [toast]);

  const generateAssets = async () => {
    if (!session?.access_token) {
      toast({
        title: "Error",
        description: "You must be logged in to generate assets",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/generate-zen-garden-assets`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || response.statusText);
      }
      
      toast({
        title: "Assets Generated",
        description: "New game assets have been created and saved!",
      });

      // Reload assets after generation
      window.location.reload();
    } catch (err) {
      console.error('Error generating assets:', err);
      toast({
        title: "Generation Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    assets,
    isLoading,
    error,
    generateAssets
  };
};