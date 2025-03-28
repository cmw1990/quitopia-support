import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { createNicotineLog, NicotineLog } from '../../api/healthServices';
import { Button } from '../ui/button';
import { Loader2, Cigarette, User, Zap, Flame, Clock, Heart, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '../ui/use-toast';

// Product types
const PRODUCT_TYPES = [
  { id: 'cigarette', name: 'Cigarette', icon: Cigarette },
  { id: 'vape', name: 'Vape', icon: Zap },
  { id: 'chew', name: 'Chewing Tobacco', icon: User },
  { id: 'snus', name: 'Snus', icon: Flame },
  { id: 'patch', name: 'Nicotine Patch', icon: Heart },
  { id: 'gum', name: 'Nicotine Gum', icon: User },
  { id: 'lozenge', name: 'Nicotine Lozenge', icon: User },
  { id: 'other', name: 'Other Nicotine Product', icon: User },
];

// Situation options
const SITUATION_OPTIONS = [
  'Morning routine',
  'With coffee',
  'After a meal',
  'While driving',
  'While drinking alcohol',
  'During a work break',
  'Feeling stressed',
  'Feeling anxious',
  'Feeling bored',
  'Socializing',
  'After exercise',
  'Before bed',
  'Other'
];

// Component for tracking nicotine consumption
export const NicotineTracker: React.FC = () => {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  
  // State for tracking steps and form data
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logData, setLogData] = useState<Partial<NicotineLog>>({
    product_type: '',
    quantity: 1,
    satisfaction_level: 5,
    situation: '',
    timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
  });
  
  // Handle product selection
  const handleProductSelect = (productType: string) => {
    setLogData(prev => ({ ...prev, product_type: productType }));
    setCurrentStep(2);
  };
  
  // Handle quantity change
  const handleQuantityChange = (quantity: number) => {
    setLogData(prev => ({ ...prev, quantity }));
    setCurrentStep(3);
  };
  
  // Handle satisfaction rating
  const handleSatisfactionChange = (level: number) => {
    setLogData(prev => ({ ...prev, satisfaction_level: level }));
    setCurrentStep(4);
  };
  
  // Handle situation selection
  const handleSituationSelect = (situation: string) => {
    setLogData(prev => ({ ...prev, situation }));
    setCurrentStep(5);
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to track your nicotine consumption",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const completeData: NicotineLog = {
        ...logData as NicotineLog,
        user_id: session.user.id
      };
      
      await createNicotineLog(completeData, session);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['nicotine-logs'] });
      
      // Reset form and show success
      setLogData({
        product_type: '',
        quantity: 1,
        satisfaction_level: 5,
        situation: '',
        timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
      });
      setCurrentStep(6); // Success step
      
      toast({
        title: "Consumption logged",
        description: "Your nicotine consumption has been successfully recorded",
        variant: "default"
      });
    } catch (error) {
      console.error("Error logging nicotine consumption:", error);
      toast({
        title: "Error",
        description: "Failed to log nicotine consumption. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Navigate to a specific step
  const goToStep = (step: number) => {
    if (step <= currentStep) {
      setCurrentStep(step);
    }
  };
  
  // Reset the form
  const resetForm = () => {
    setLogData({
      product_type: '',
      quantity: 1,
      satisfaction_level: 5,
      situation: '',
      timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
    });
    setCurrentStep(1);
  };
  
  // Helper function to get product name from id
  const getProductName = (productId: string): string => {
    const product = PRODUCT_TYPES.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };
  
  // Render based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Product selection
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">What did you consume?</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PRODUCT_TYPES.map((product) => {
                const Icon = product.icon;
                return (
                  <Button
                    key={product.id}
                    variant="outline"
                    className={`h-24 flex flex-col items-center justify-center p-2 ${
                      logData.product_type === product.id ? 'border-primary ring-2 ring-primary/20' : ''
                    }`}
                    onClick={() => handleProductSelect(product.id)}
                  >
                    <Icon className="h-6 w-6 mb-2" />
                    <span className="text-sm text-center">{product.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        );
        
      case 2: // Quantity
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">How many {getProductName(logData.product_type || '')}s?</h3>
            <div className="flex justify-center items-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                disabled={logData.quantity === 1}
                onClick={() => setLogData(prev => ({ ...prev, quantity: Math.max(1, (prev.quantity || 1) - 1) }))}
              >
                -
              </Button>
              <span className="text-4xl font-bold w-12 text-center">{logData.quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setLogData(prev => ({ ...prev, quantity: (prev.quantity || 1) + 1 }))}
              >
                +
              </Button>
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
              <Button onClick={() => handleQuantityChange(logData.quantity || 1)}>
                Next
              </Button>
            </div>
          </div>
        );
        
      case 3: // Satisfaction rating
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">How satisfying was it?</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Not at all</span>
                <span>Very satisfying</span>
              </div>
              <div className="grid grid-cols-10 gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                  <Button
                    key={level}
                    variant="outline"
                    className={`h-12 ${
                      logData.satisfaction_level === level ? 'bg-primary text-primary-foreground' : ''
                    }`}
                    onClick={() => setLogData(prev => ({ ...prev, satisfaction_level: level }))}
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setCurrentStep(2)}>
                Back
              </Button>
              <Button onClick={() => handleSatisfactionChange(logData.satisfaction_level || 5)}>
                Next
              </Button>
            </div>
          </div>
        );
        
      case 4: // Situation
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">What was the situation?</h3>
            <div className="grid grid-cols-2 gap-2">
              {SITUATION_OPTIONS.map((situation) => (
                <Button
                  key={situation}
                  variant="outline"
                  className={`h-auto py-2 justify-start ${
                    logData.situation === situation ? 'border-primary ring-2 ring-primary/20' : ''
                  }`}
                  onClick={() => handleSituationSelect(situation)}
                >
                  {situation}
                </Button>
              ))}
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setCurrentStep(3)}>
                Back
              </Button>
              <Button onClick={() => setCurrentStep(5)}>
                Next
              </Button>
            </div>
          </div>
        );
        
      case 5: // Review and submit
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Review and submit</h3>
            <div className="bg-muted p-4 rounded-md space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product</span>
                <span className="font-medium">{getProductName(logData.product_type || '')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity</span>
                <span className="font-medium">{logData.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Satisfaction</span>
                <span className="font-medium">{logData.satisfaction_level}/10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Situation</span>
                <span className="font-medium">{logData.situation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium">{format(new Date(), 'PP pp')}</span>
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setCurrentStep(4)}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Submit'
                )}
              </Button>
            </div>
          </div>
        );
        
      case 6: // Success
        return (
          <div className="space-y-6 text-center">
            <div className="rounded-full bg-green-100 p-3 w-16 h-16 mx-auto flex items-center justify-center">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-medium">Consumption Logged!</h3>
            <p className="text-muted-foreground">
              Your nicotine consumption has been recorded. Keep tracking to see your patterns and progress!
            </p>
            <div className="pt-4">
              <Button onClick={resetForm}>Log Another</Button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  // Progress indicator
  const renderProgressIndicator = () => {
    if (currentStep === 6) return null; // Don't show on success screen
    
    return (
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          {['Product', 'Quantity', 'Satisfaction', 'Situation', 'Review'].map((step, index) => (
            <button
              key={index}
              className={`text-xs font-medium ${
                currentStep > index + 1 ? 'text-primary' : currentStep === index + 1 ? 'text-primary' : 'text-muted-foreground'
              }`}
              onClick={() => goToStep(index + 1)}
            >
              {step}
            </button>
          ))}
        </div>
        <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
          <div
            className="bg-primary h-1 transition-all duration-300 ease-in-out"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>
      </div>
    );
  };
  
  return (
    <div className="w-full max-w-lg mx-auto p-4 md:p-6 bg-background border rounded-lg shadow-sm">
      {renderProgressIndicator()}
      {renderStepContent()}
    </div>
  );
};

export default NicotineTracker; 