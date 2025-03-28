import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { AlertTriangle } from 'lucide-react';

export const Trigger404: React.FC = () => {
  const { triggerType } = useParams<{ triggerType: string }>();
  const navigate = useNavigate();
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-center mb-2">
          <AlertTriangle className="h-10 w-10 text-amber-500" />
        </div>
        <CardTitle className="text-center">Invalid Trigger Type</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground">
          The trigger type "{triggerType}" is not recognized. Please select from one of our supported trigger types.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button 
          onClick={() => navigate('/health/cravings')}
          className="w-full"
        >
          Go to Craving Tracker
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate('/interventions')}
          className="w-full"
        >
          General Intervention
        </Button>
      </CardFooter>
    </Card>
  );
}; 