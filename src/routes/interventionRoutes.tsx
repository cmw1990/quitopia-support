import React from 'react';
import { RouteObject } from 'react-router-dom';
import { SessionWrapper } from '../contexts/SessionContext';
import { Trigger404 } from '../components/health/TriggerIntervention/Trigger404';
import { TriggerIntervention } from '../components/health/TriggerIntervention';

// Wrap component with session
const TriggerInterventionWithSession = ({ triggerType, intensity }: { triggerType?: string; intensity?: number }) => (
  <SessionWrapper>
    {(session) => (
      <TriggerIntervention 
        session={session} 
        triggerType={triggerType} 
        intensity={intensity} 
      />
    )}
  </SessionWrapper>
);

// Routes for different trigger interventions
export const interventionRoutes: RouteObject[] = [
  {
    path: 'interventions',
    children: [
      {
        path: '',
        element: <TriggerInterventionWithSession />
      },
      {
        path: 'stress',
        element: <TriggerInterventionWithSession triggerType="stress" intensity={7} />
      },
      {
        path: 'social',
        element: <TriggerInterventionWithSession triggerType="social" intensity={6} />
      },
      {
        path: 'boredom',
        element: <TriggerInterventionWithSession triggerType="boredom" intensity={5} />
      },
      {
        path: 'after-meal',
        element: <TriggerInterventionWithSession triggerType="after meal" intensity={8} />
      },
      {
        path: 'habit',
        element: <TriggerInterventionWithSession triggerType="habit" intensity={6} />
      },
      {
        path: ':triggerType',
        element: <Trigger404 />
      }
    ]
  }
]; 