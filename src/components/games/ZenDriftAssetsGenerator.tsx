
import { useState } from "react";
import { Button } from "../ui/button";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";

export const ZenDriftAssetsGenerator = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAssets = async () => {
    setIsGenerating(true);
    try {
      console.log('Calling generate-assets function...');
      const { data, error } = await supabase.functions.invoke(
        'generate-assets',
        {
          body: {
            type: 'zen-drift',
            description: 'A minimalist and serene landscape for a peaceful driving experience. The scene should feature elegant curves, zen garden elements, and a calming color palette.',
            style: 'zen-like, artistic, minimalist, ethereal'
          }
        }
      );

      if (error) {
        console.error('Function error:', error);
        throw error;
      }
      
      console.log('Generation response:', data);
      
      toast({
        title: 'Success!',
        description: 'Generated new Zen Drift assets successfully!',
      });
    } catch (error) {
      console.error('Error generating assets:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate assets',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      onClick={generateAssets} 
      disabled={isGenerating}
      className="gap-2 bg-gradient-to-r from-primary via-secondary to-accent hover:shadow-lg transition-all duration-300"
    >
      {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
      {!isGenerating && <Sparkles className="h-4 w-4 animate-pulse" />}
      {isGenerating ? 'Generating Zen Drift Assets...' : 'Generate Zen Drift Assets'}
    </Button>
  );
};
