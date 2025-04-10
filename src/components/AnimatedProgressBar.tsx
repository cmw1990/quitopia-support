import React from 'react';
import { IonProgressBar } from '@ionic/react';
import styled from '@emotion/styled';
import { progressBarAnimation } from '../utils/animations';

const StyledProgressBar = styled(IonProgressBar)`
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  
  &::part(progress) {
    background: linear-gradient(
      90deg,
      var(--ion-color-primary) 0%,
      var(--ion-color-primary-tint) 50%,
      var(--ion-color-primary) 100%
    );
    background-size: 200% 100%;
    animation: ${progressBarAnimation} 2s ease infinite;
  }
  
  &.success::part(progress) {
    background: linear-gradient(
      90deg,
      var(--ion-color-success) 0%,
      var(--ion-color-success-tint) 50%,
      var(--ion-color-success) 100%
    );
    background-size: 200% 100%;
  }
`;

interface AnimatedProgressBarProps {
  value: number;
  color?: string;
  className?: string;
}

export const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  value,
  color = 'primary',
  className = ''
}) => {
  return (
    <StyledProgressBar
      value={value}
      className={`${className} ${color}`}
    />
  );
};
