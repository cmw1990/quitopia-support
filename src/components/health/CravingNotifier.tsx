import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Zap, X } from 'lucide-react';
import { predictCravingTimes } from '@/api/cravingService';
import { useToast } from '@/components/ui/use-toast';

interface CravingNotifierProps {
  userId: string;
}

export const CravingNotifier: React.FC<CravingNotifierProps> = ({ userId }) => {
  const [showAlert, setShowAlert] = useState(false);
  const [currentPrediction, setCurrentPrediction] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Query for craving time predictions
  const { data: predictions } = useQuery({
    queryKey: ['craving-predictions', userId],
    queryFn: () => predictCravingTimes(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 15, // 15 minutes
    refetchInterval: 1000 * 60 * 30, // 30 minutes
  });
  
  // Check for high-risk times
  useEffect(() => {
    if (!predictions || predictions.length === 0) return;
    
    // Get current hour
    const currentHour = new Date().getHours();
    
    // Find if current hour is a high-risk time
    const currentTimePrediction = predictions.find(prediction => {
      const [startHour] = prediction.timeframe.split(' - ')[0].split(':').map(Number);
      return currentHour === startHour;
    });
    
    // Only show alert for high or medium risk times
    if (currentTimePrediction && 
        (currentTimePrediction.riskLevel === 'high' || currentTimePrediction.riskLevel === 'medium')) {
      setCurrentPrediction(currentTimePrediction);
      setShowAlert(true);
      
      // Also show a toast notification
      toast({
        title: "Craving Alert",
        description: "This is typically a high-risk time for cravings. Prepare to use coping strategies."
      });
      
      // If we want to add an action, we'll handle it separately
      setTimeout(() => {
        const actionButton = document.createElement('button');
        actionButton.className = 'bg-secondary text-sm py-1 px-2 rounded';
        actionButton.textContent = 'Get Help';
        actionButton.onclick = () => navigate('/interventions');
        
        const toastElement = document.querySelector('.toast-container .toast:last-child .toast-description');
        if (toastElement) {
          const actionContainer = document.createElement('div');
          actionContainer.className = 'mt-2';
          actionContainer.appendChild(actionButton);
          toastElement.appendChild(actionContainer);
        }
      }, 100);
    } else {
      setShowAlert(false);
    }
  }, [predictions, toast, navigate]);
  
  if (!showAlert || !currentPrediction) {
    return null;
  }
  
  return (
    <Alert className="mb-4">
      <div className="flex items-start">
        <Zap className="h-4 w-4 mt-0.5 text-amber-500" />
        <div className="ml-2 flex-1">
          <AlertTitle>Craving Alert</AlertTitle>
          <AlertDescription className="mt-1">
            This time of day is typically a {currentPrediction.riskLevel} risk period for cravings based on your patterns. 
            Consider using the recommended "{currentPrediction.recommendedIntervention}" intervention.
          </AlertDescription>
          <div className="mt-2 flex space-x-2">
            <Button 
              size="sm" 
              onClick={() => navigate(`/interventions/${currentPrediction.recommendedIntervention}`)}
            >
              Start Intervention
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAlert(false)}
            >
              Dismiss
            </Button>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="ml-2 h-6 w-6 p-0" 
          onClick={() => setShowAlert(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
}; 