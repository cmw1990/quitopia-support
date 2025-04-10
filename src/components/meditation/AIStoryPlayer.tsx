import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, PlayCircle, PauseCircle, Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";

interface AIStoryPlayerProps {
  theme?: string;
  duration?: number;
}

export const AIStoryPlayer = ({ theme = "nature", duration = 5 }: AIStoryPlayerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [storyText, setStoryText] = useState<string>("");
  const { toast } = useToast();
  const { session } = useAuth();

  const handleGenerateStory = async () => {
    try {
      setIsLoading(true);

      // Check if user has premium access
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('tier')
        .eq('user_id', session?.user?.id)
        .single();

      if (!subscription || subscription.tier === 'free') {
        toast({
          title: "Premium Feature",
          description: "AI-narrated stories are available for premium users only.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('generate-meditation-story', {
        body: { theme, duration }
      });

      if (error) throw error;

      setStoryText(data.story);

      // Create audio from base64
      const blob = new Blob(
        [Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))],
        { type: 'audio/mp3' }
      );
      const url = URL.createObjectURL(blob);
      const newAudio = new Audio(url);
      
      newAudio.volume = volume;
      setAudio(newAudio);

      toast({
        title: "Story Generated",
        description: "Your meditation story is ready to play.",
      });
    } catch (error) {
      console.error('Error generating story:', error);
      toast({
        title: "Error",
        description: "Failed to generate meditation story. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlay = () => {
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!audio) return;
    
    if (isMuted) {
      audio.volume = volume;
    } else {
      audio.volume = 0;
    }
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audio) {
      audio.volume = newVolume;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-Narrated Meditation Story</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!audio ? (
          <Button 
            onClick={handleGenerateStory} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Story...
              </>
            ) : (
              'Generate New Story'
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground whitespace-pre-wrap">
              {storyText}
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <PauseCircle className="h-6 w-6" />
                ) : (
                  <PlayCircle className="h-6 w-6" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
              >
                {isMuted ? (
                  <VolumeX className="h-6 w-6" />
                ) : (
                  <Volume2 className="h-6 w-6" />
                )}
              </Button>
              <div className="flex-1">
                <Slider
                  value={[volume]}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                />
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleGenerateStory}
              disabled={isLoading}
              size="sm"
            >
              Generate New Story
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};