import React from 'react';
import { Helmet } from 'react-helmet-async';

const SoundsPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Focus Soundscapes - EasierFocus</title>
        <meta name="description" content="Use ambient sounds and music to enhance your focus sessions." />
      </Helmet>
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-semibold mb-4">Focus Soundscapes</h1>
        <p className="text-muted-foreground">This page will feature a library of ambient sounds (nature, white noise, binaural beats) to aid concentration. (Placeholder)</p>
        {/* TODO: Implement Sound Player UI */}
      </div>
    </>
  );
};

export default SoundsPage; 