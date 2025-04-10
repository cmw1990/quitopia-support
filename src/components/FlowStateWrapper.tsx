import React from 'react';
import { FlowState } from './FlowState';

/**
 * Wrapper component for FlowState to ensure it properly returns JSX.Element
 * This fixes type errors when using FlowState in other components
 */
export const FlowStateWrapper: React.FC = () => {
  return <FlowState />;
}; 