import React from 'react';
import { IonCard } from '@ionic/react';
import styled from '@emotion/styled';
import { scaleIn } from '../utils/animations';

const StyledCard = styled(IonCard)`
  animation: ${scaleIn} 0.3s ease-out;
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
  
  &:active {
    transform: scale(0.98);
  }
  
  &.hover-effect:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
`;

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  hoverEffect = true,
  onClick
}) => {
  return (
    <StyledCard 
      className={`${className} ${hoverEffect ? 'hover-effect' : ''}`}
      onClick={onClick}
    >
      {children}
    </StyledCard>
  );
};
