
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Image } from "lucide-react";

export const GenerateBackgroundsButton = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAllBackgrounds = async () => {
    setIsGenerating(true);
    try {
      console.log('Calling generate-assets function...');
      const response = await supabase.functions.invoke(
        'generate-assets',
        {
          body: {
            type: 'meditation-backgrounds',
            description: 'Serene and calming meditation background with ethereal elements and soft colors',
            style: 'ethereal, dreamlike, soft colors, minimalist zen style'
          }
        }
      );

      if (response.error) throw response.error;
      
      console.log('Generation response:', response.data);

      toast({
        title: 'Background Generation Complete',
        description: 'Successfully generated new meditation background',
      });

    } catch (error) {
      console.error('Error generating backgrounds:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate backgrounds',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={generateAllBackgrounds}
      disabled={isGenerating}
      variant="outline"
      className="gap-2"
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Image className="h-4 w-4" />
      )}
      {isGenerating ? 'Generating Backgrounds...' : 'Generate All Backgrounds'}
    </Button>
  );
};

export default GenerateBackgroundsButton;
