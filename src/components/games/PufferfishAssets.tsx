import { useState, useEffect } from 'react';
import { SUPABASE_URL, SUPABASE_KEY } from '@/integrations/supabase/db-client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthProvider';

export interface PufferfishAssets {
  pufferfish: string;
  bubbles: string;
  seaweed: string;
  smallFish: string;
  predator: string;
  background: string;
  coral: string;  // Added coral property
}

export const usePufferfishAssets = () => {
  const { session } = useAuth();
  const [assets, setAssets] = useState<PufferfishAssets>({
    pufferfish: '/placeholder.svg',
    bubbles: '/placeholder.svg',
    seaweed: '/placeholder.svg',
    smallFish: '/placeholder.svg',
    predator: '/placeholder.svg',
    background: '/placeholder.svg',
    coral: '/placeholder.svg'  // Added coral initialization
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const assetNames = ['pufferfish', 'bubbles', 'seaweed', 'smallFish', 'predator', 'background', 'coral'];  // Added coral to assetNames
        const loadedAssets: Partial<PufferfishAssets> = {};

        for (const name of assetNames) {
          const response = await fetch(
            `${SUPABASE_URL}/storage/v1/object/public/game-assets/pufferfish/${name}.png`,
            {
              headers: {
                'apikey': SUPABASE_KEY
              }
            }
          );

          if (response.ok) {
            loadedAssets[name as keyof PufferfishAssets] = response.url;
          }
        }

        // Only update if we have all assets
        if (Object.keys(loadedAssets).length === assetNames.length) {
          setAssets(loadedAssets as PufferfishAssets);
        } else {
          throw new Error('Some assets failed to load');
        }
      } catch (err) {
        console.error('Error loading pufferfish assets:', err);
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
        `${SUPABASE_URL}/functions/v1/generate-pufferfish-assets`,
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