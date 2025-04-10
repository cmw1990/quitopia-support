import { useGameAssets } from '@/hooks/use-game-assets';

export interface BalloonAssets {
  balloon: string;
  background: string;
}

export const useBalloonAssets = () => {
  const { assets, isLoading, error } = useGameAssets('balloon');
  
  console.log('Loading balloon assets:', { assets, isLoading, error });
  
  // Only return valid assets when they are actually loaded
  const validAssets: BalloonAssets = {
    balloon: assets?.balloon?.url || '',
    background: assets?.background?.url || ''
  };

  return {
    assets: validAssets,
    isLoading,
    error
  };
};