import React from 'react';
import { Helmet } from 'react-helmet';
import { EnhancedEnergyManagement } from '../components/energy/EnhancedEnergyManagement';

const Energy: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Energy Management | Easier Focus</title>
        <meta name="description" content="Track, analyze, and optimize your mental, physical, and emotional energy levels with personalized recommendations, anti-fatigue interventions, and ultradian rhythm tracking." />
      </Helmet>
      <EnhancedEnergyManagement />
    </>
  );
};

export default Energy; 