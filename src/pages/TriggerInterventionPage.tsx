import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container } from '../components/ui/container';
import { Button } from '../components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { TriggerIntervention } from '../components/health/TriggerIntervention';
import { SessionWrapper } from '../contexts/SessionContext';
import { PageTitle } from '../components/ui/page-title';

export function TriggerInterventionPage() {
  const { triggerType } = useParams<{ triggerType?: string }>();
  const navigate = useNavigate();
  
  // Map URL parameter to readable trigger name
  const getTriggerDisplayName = () => {
    if (!triggerType) return 'Craving';
    
    return triggerType
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Map URL parameter to actual trigger type
  const getNormalizedTriggerType = () => {
    if (!triggerType) return 'unknown';
    
    if (triggerType === 'after-meal') {
      return 'after meal';
    }
    
    return triggerType.replace(/-/g, ' ');
  };
  
  return (
    <Container>
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="mr-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <PageTitle 
          title={`${getTriggerDisplayName()} Intervention`} 
          subtitle="Real-time tools to manage your craving"
        />
      </div>
      
      <div className="max-w-xl mx-auto">
        <SessionWrapper>
          {(session) => (
            <TriggerIntervention 
              session={session}
              triggerType={getNormalizedTriggerType()}
              intensity={6}
              onComplete={(success) => {
                if (success) {
                  setTimeout(() => {
                    navigate('/health/cravings');
                  }, 3000);
                }
              }}
            />
          )}
        </SessionWrapper>
      </div>
    </Container>
  );
} 