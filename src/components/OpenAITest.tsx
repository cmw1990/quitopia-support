import { useState } from "react";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export const OpenAITest = () => {
  const { toast } = useToast();
  const [isTesting, setIsTesting] = useState(false);

  const testOpenAI = async () => {
    setIsTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        'test-openai',
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (error) {
        console.error('Supabase Function Error:', error);
        throw new Error(error.message || 'Failed to test OpenAI connection');
      }
      
      console.log('Test response:', data);
      
      toast({
        title: 'Success!',
        description: 'The OpenAI API key is working correctly!',
      });
    } catch (error) {
      console.error('Error testing OpenAI:', error);
      
      // Extract the error message from the response if available
      let errorMessage = error.message;
      try {
        if (error.message.includes('{')) {
          const errorData = JSON.parse(error.message);
          errorMessage = errorData.message || errorMessage;
        }
      } catch (e) {
        // If parsing fails, use the original error message
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Button 
      onClick={testOpenAI} 
      disabled={isTesting}
      className="gap-2"
    >
      {isTesting && <Loader2 className="h-4 w-4 animate-spin" />}
      Test OpenAI Connection
    </Button>
  );
};

export default OpenAITest;
