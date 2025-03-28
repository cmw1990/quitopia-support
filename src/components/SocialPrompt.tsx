import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Button } from './ui';
import { SocialShareDialog } from './SocialShareDialog';
import { Share2, X } from 'lucide-react';

interface SocialPromptProps {
  daysSmokeFreee: number;
  cigarettesAvoided: number;
  moneySaved: number;
  onDismiss?: () => void;
}

export const SocialPrompt: React.FC<SocialPromptProps> = ({
  daysSmokeFreee,
  cigarettesAvoided,
  moneySaved,
  onDismiss
}) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [shareItem, setShareItem] = useState<any>(null);
  const [dismissedUntil, setDismissedUntil] = useState<number | null>(null);
  
  // Determine if we should show the prompt based on user's progress
  useEffect(() => {
    const lastDismissed = localStorage.getItem('socialPromptDismissedUntil');
    const lastDismissedTime = lastDismissed ? parseInt(lastDismissed, 10) : 0;
    
    if (Date.now() < lastDismissedTime) {
      setDismissedUntil(lastDismissedTime);
      return;
    }
    
    // Show prompt on milestone days
    const milestones = [1, 3, 7, 14, 30, 60, 90, 100, 180, 365];
    const isMilestone = milestones.includes(daysSmokeFreee);
    
    // Always show on milestones, otherwise show based on random chance
    // This makes it feel more spontaneous and less annoying
    const shouldShow = isMilestone || (Math.random() < 0.3 && daysSmokeFreee > 0);
    setShowPrompt(shouldShow);
    
    if (shouldShow) {
      prepareShareData();
    }
  }, [daysSmokeFreee, cigarettesAvoided, moneySaved]);
  
  const prepareShareData = () => {
    // Different messages for different milestone days
    let title = `${daysSmokeFreee} Days Smoke-Free Journey`;
    let description = `I've avoided ${cigarettesAvoided} cigarettes and saved $${moneySaved.toFixed(2)} on my journey to a healthier life!`;
    
    if (daysSmokeFreee === 1) {
      title = "My First Day Smoke-Free!";
      description = "I've taken the first step to a healthier life with Mission Fresh!";
    } else if (daysSmokeFreee === 7) {
      title = "One Week Smoke-Free Achievement!";
      description = `One week down! I've avoided ${cigarettesAvoided} cigarettes and saved $${moneySaved.toFixed(2)} with Mission Fresh.`;
    } else if (daysSmokeFreee === 30) {
      title = "One Month Smoke-Free Milestone!";
      description = `I've been smoke-free for a month! That's ${cigarettesAvoided} cigarettes avoided and $${moneySaved.toFixed(2)} saved with Mission Fresh.`;
    } else if (daysSmokeFreee === 100) {
      title = "100 Days Smoke-Free!";
      description = `Triple digits! 100 days smoke-free, ${cigarettesAvoided} cigarettes avoided, and $${moneySaved.toFixed(2)} saved with Mission Fresh!`;
    } else if (daysSmokeFreee === 365) {
      title = "One Year Smoke-Free Anniversary!";
      description = `I'm celebrating one year smoke-free! I've avoided ${cigarettesAvoided} cigarettes and saved $${moneySaved.toFixed(2)} with Mission Fresh. Here's to many more!`;
    }
    
    setShareItem({
      title,
      description,
    });
  };
  
  const handleDismiss = () => {
    // Dismiss for 24 hours
    const dismissUntil = Date.now() + (24 * 60 * 60 * 1000);
    localStorage.setItem('socialPromptDismissedUntil', dismissUntil.toString());
    setDismissedUntil(dismissUntil);
    setShowPrompt(false);
    
    if (onDismiss) {
      onDismiss();
    }
  };
  
  if (!showPrompt || dismissedUntil) {
    return null;
  }
  
  return (
    <Card className="shadow-lg border-gray-200 mb-6 relative overflow-hidden">
      <div className="absolute top-2 right-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 rounded-full" 
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </Button>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Share Your Progress!</CardTitle>
        <CardDescription>
          {daysSmokeFreee === 1 ? (
            "Celebrate your first day of being smoke-free!"
          ) : daysSmokeFreee % 7 === 0 ? (
            `You've completed ${daysSmokeFreee / 7} week${daysSmokeFreee > 7 ? 's' : ''} smoke-free!`
          ) : (
            "You're making incredible progress on your smoke-free journey."
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="space-y-2">
          <p className="text-sm">
            Share your achievement with friends and inspire others on their health journey.
          </p>
          
          <div className="bg-indigo-50 dark:bg-indigo-950/50 p-3 rounded-md text-sm">
            <div className="font-medium text-indigo-700 dark:text-indigo-400 mb-1">Your Stats:</div>
            <ul className="space-y-1 text-indigo-600 dark:text-indigo-300">
              <li>🎯 {daysSmokeFreee} days smoke-free</li>
              <li>🚭 {cigarettesAvoided} cigarettes avoided</li>
              <li>💰 ${moneySaved.toFixed(2)} saved</li>
            </ul>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 flex justify-end">
        <SocialShareDialog
          item={shareItem}
          trigger={
            <Button className="w-full sm:w-auto">
              <Share2 className="mr-2 h-4 w-4" />
              Share My Progress
            </Button>
          }
        />
      </CardFooter>
    </Card>
  );
}; 