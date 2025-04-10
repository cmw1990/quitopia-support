import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/supabase-client';
import { useToast } from '@/hooks/use-toast';

export interface GameAsset {
  url: string;
  type: string;
  loaded: boolean;
}

interface AssetCache {
  [key: string]: {
    url: string;
    timestamp: number;
  };
}

const CACHE_DURATION = 1000 * 60 * 60; // 1 hour
let assetCache: AssetCache = {};

export const useGameAssets = (gameType: string) => {
  const [assets, setAssets] = useState<Record<string, GameAsset>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const isCacheValid = (timestamp: number) => {
    return Date.now() - timestamp < CACHE_DURATION;
  };

  const loadImage = async (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => {
        console.error(`Failed to load image from URL: ${url}`);
        resolve(false);
      };
      img.src = url;
    });
  };

  const fetchAsset = async (type: string, retryCount = 0): Promise<string | null> => {
    try {
      // Check cache first
      const cached = assetCache[`${gameType}/${type}`];
      if (cached && isCacheValid(cached.timestamp)) {
        console.log(`Using cached asset for ${gameType}/${type}`);
        const isValid = await loadImage(cached.url);
        if (isValid) {
          return cached.url;
        } else {
          console.log(`Cached image invalid for ${gameType}/${type}, refetching...`);
          delete assetCache[`${gameType}/${type}`];
        }
      }

      console.log(`Fetching asset for ${gameType}/${type}`);
      const { data: urlData } = await supabase
        .storage
        .from('game-assets')
        .getPublicUrl(`${gameType}/${type}.png`);

      if (!urlData?.publicUrl) {
        throw new Error(`No public URL received for ${type}`);
      }

      // Pre-load image
      const loaded = await loadImage(urlData.publicUrl);
      if (!loaded) {
        throw new Error(`Failed to load image for ${type}`);
      }

      // Update cache
      assetCache[`${gameType}/${type}`] = {
        url: urlData.publicUrl,
        timestamp: Date.now()
      };

      return urlData.publicUrl;
    } catch (err) {
      console.error(`Error loading ${type}, attempt ${retryCount + 1}:`, err);
      
      // Only retry once to avoid infinite loops
      if (retryCount < 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchAsset(type, retryCount + 1);
      }
      
      // Return placeholder URL after retry fails
      return '/placeholder.svg';
    }
  };

  useEffect(() => {
    const loadAssets = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const assetTypes = getAssetTypesForGame(gameType);
        const loadedAssets: Record<string, GameAsset> = {};
        let failedCount = 0;

        await Promise.all(
          assetTypes.map(async (type) => {
            try {
              const url = await fetchAsset(type);
              loadedAssets[type] = {
                url: url || '/placeholder.svg',
                type,
                loaded: !!url && url !== '/placeholder.svg'
              };
              if (!url || url === '/placeholder.svg') {
                failedCount++;
              }
            } catch (assetError) {
              console.error(`Failed to load ${type} asset:`, assetError);
              failedCount++;
              loadedAssets[type] = {
                url: '/placeholder.svg',
                type,
                loaded: false
              };
            }
          })
        );

        setAssets(loadedAssets);
        
        if (failedCount > 0) {
          const message = `Some game assets failed to load. The game will continue with placeholder images.`;
          console.warn(message);
          toast({
            title: "Some Assets Missing",
            description: message,
            variant: "default",
          });
          setError(message);
        }
      } catch (err) {
        console.error('Failed to load game assets:', err);
        // Don't block the game from starting, just show a warning
        setError('Some assets failed to load but the game can still be played.');
      } finally {
        // Always set loading to false so games can start
        setIsLoading(false);
      }
    };

    loadAssets();
  }, [gameType, toast]);

  return { assets, isLoading, error };
};

const getAssetTypesForGame = (gameType: string): string[] => {
  switch (gameType) {
    case 'balloon':
      return ['balloon', 'background'];
    case 'zen-drift':
      return ['car', 'background', 'effects'];
    case 'pufferfish':
      return ['pufferfish', 'bubbles', 'coral', 'seaweed', 'smallFish', 'predator', 'background'];
    default:
      console.warn(`No asset types defined for game type: ${gameType}`);
      return [];
  }
};