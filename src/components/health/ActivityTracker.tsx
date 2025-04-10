import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, PlayCircle, StopCircle } from 'lucide-react';
import { MotionService } from '@/services/MotionService';
import { useToast } from '@/hooks/use-toast';

export const ActivityTracker = () => {
  const [isTracking, setIsTracking] = useState(false);
  const { toast } = useToast();
  const motionService = MotionService.getInstance();

  const toggleTracking = async () => {
    try {
      if (!isTracking) {
        await motionService.startAccelerometerListening();
        setIsTracking(true);
        toast({
          title: "Activity Tracking Started",
          description: "Now monitoring your movement activity",
        });
      } else {
        await motionService.stopAccelerometerListening();
        setIsTracking(false);
        toast({
          title: "Activity Tracking Stopped",
          description: "Movement monitoring has been stopped",
        });
      }
    } catch (error) {
      console.error('Error toggling tracking:', error);
      toast({
        title: "Error",
        description: "Failed to toggle activity tracking",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    return () => {
      motionService.stopAccelerometerListening();
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="size-5 text-primary" />
          Activity Tracking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <Button 
            onClick={toggleTracking}
            className="w-full"
            variant={isTracking ? "destructive" : "default"}
          >
            {isTracking ? (
              <>
                <StopCircle className="size-4 mr-2" />
                Stop Tracking
              </>
            ) : (
              <>
                <PlayCircle className="size-4 mr-2" />
                Start Tracking
              </>
            )}
          </Button>
          {isTracking && (
            <p className="text-sm text-muted-foreground">
              Currently monitoring your movement activity...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};