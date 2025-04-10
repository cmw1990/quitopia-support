
import { useState } from "react";
import { Button } from "./ui/button";
import { supabaseRequest } from '@/utils/supabaseRequest'; // Corrected import
import { useToast } from "./hooks/use-toast";
import { Loader2, Sparkles, Trash } from "lucide-react";

const isDevelopment = import.meta.env.DEV;

export const GameAssetsGenerator = () => {
  if (!isDevelopment) return null;
  
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteExistingAssets = async (batch: string) => {
    try {
      console.log(`Deleting assets for ${batch}...`);
      // Use supabaseRequest, handle response
      const { data: files, error: listError } = await supabaseRequest<any[]>( // Assuming response is array of file objects
        '/storage/v1/object/list/game-assets',
        {
          method: 'POST',
           headers: { 'Content-Type': 'application/json' }, // Ensure Content-Type
          body: JSON.stringify({ prefix: batch })
        }
        // No session argument needed
      );

      if (listError) throw listError;

      if (files && files.length > 0) {
        const filePaths = files.map((file: any) => `${batch}/${file.name}`);
        // Use supabaseRequest, handle response
        const { error: deleteError } = await supabaseRequest(
          '/storage/v1/object',
          {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }, // Ensure Content-Type
            body: JSON.stringify({ prefixes: filePaths })
          }
          // No session argument needed
        );

        if (deleteError) throw deleteError;
        console.log(`Deleted ${filePaths.length} files from ${batch}`);
      }
    } catch (error: any) {
      console.error(`Error deleting assets for ${batch}:`, error);
      throw error;
    }
  };

  const generateAssets = async () => {
    setIsDeleting(true);
    try {
      const batches = [
        {
          name: 'balloon',
          description: 'A serene and ethereal hot air balloon floating in a dreamy sky. The balloon should be elegant and ornate with intricate patterns, rendered in soft, calming colors. The background should feature gentle clouds, distant mountains, and a peaceful gradient from dawn colors to twilight hues. The style should be artistic and zen-like, perfect for a meditation app.',
        },
        {
          name: 'pufferfish',
          description: 'A beautiful and peaceful underwater scene with a zen-like atmosphere. Create a cute and friendly pufferfish character with gentle expressions and soft, calming colors. The underwater environment should include ethereal light rays piercing through crystal clear water, delicate coral formations in pastel colors, gracefully swaying seaweed, and floating particles that create a dreamy, meditative atmosphere. Small fish should be elegant and flowing, while the predator should be subtly present but not threatening. The background should feature a serene underwater landscape with distant coral reefs and gentle water caustics. The art style should be both artistic and soothing, perfect for a meditation experience.',
        },
        {
          name: 'zen-drift',
          description: 'A minimalist and serene landscape for a peaceful driving experience. The scene should feature elegant curves, zen garden elements, and a calming color palette. Include subtle elements like cherry blossoms, gentle mist, and smooth stone pathways. The style should evoke tranquility and mindfulness.',
        }
      ];
      
      // Delete all existing assets first
      for (const batch of batches) {
        await deleteExistingAssets(batch.name);
      }

      setIsDeleting(false);
      setIsGenerating(true);
      
      // Generate new assets
      for (const batch of batches) {
        try {
          console.log(`Starting process for ${batch.name}...`);
          
          console.log(`Invoking edge function for ${batch.name}...`);
          
          // Use supabaseRequest, handle response
          const { data, error } = await supabaseRequest<any>( // Use specific type if known
            '/functions/v1/generate-assets',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }, // Ensure Content-Type
              body: JSON.stringify({
                type: 'game-assets',
                batch: batch.name,
                description: batch.description,
                style: "zen-like, artistic, dreamy, ethereal, Studio Ghibli inspired"
              })
            }
            // No session argument needed
          );

          if (error) {
            console.error(`Error generating ${batch.name} assets:`, error);
            toast({
              title: `Error generating ${batch.name} assets`,
              description: error.message || 'Unknown error occurred',
              variant: 'destructive',
            });
            continue;
          }
          
          console.log(`${batch.name} generation response:`, data);
          
          toast({
            title: 'Success',
            description: `Generated assets for ${batch.name}`,
          });
          
          if (batch !== batches[batches.length - 1]) {
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
        } catch (batchError: any) {
          console.error(`Error processing batch ${batch.name}:`, batchError);
          toast({
            title: `Error with ${batch.name}`,
            description: batchError.message || 'Failed to process batch',
            variant: 'destructive',
          });
          continue;
        }
      }

      toast({
        title: 'Success!',
        description: 'Game assets generation completed! Please refresh the page to see the new assets.',
      });
    } catch (error: any) {
      console.error('Error generating game assets:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate game assets',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      onClick={generateAssets} 
      disabled={isGenerating || isDeleting}
      className="gap-2 bg-gradient-to-r from-primary via-secondary to-accent hover:shadow-lg transition-all duration-300"
    >
      {isDeleting && <Trash className="h-4 w-4 animate-pulse text-red-500" />}
      {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
      {!isGenerating && !isDeleting && <Sparkles className="h-4 w-4 animate-pulse" />}
      {isDeleting ? 'Cleaning up old assets...' : 
       isGenerating ? 'Generating Game Assets...' : 
       'Generate Game Assets'}
    </Button>
  );
};

export default GameAssetsGenerator;
