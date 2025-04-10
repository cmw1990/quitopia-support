import React from 'react';
import { Helmet } from 'react-helmet-async';

const ImpulseControlPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Impulse Management - EasierFocus</title>
        <meta name="description" content="Tools and strategies to manage impulsivity and improve self-regulation." />
      </Helmet>
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-semibold mb-4">Impulse Management Tools</h1>
        <p className="text-muted-foreground">This section, likely integrated within Strategies or another relevant area, will provide tools like 'Pause & Reflect' prompts and behavior tracking to manage impulsivity. (Placeholder)</p>
        {/* TODO: Implement Impulse Control features */}
      </div>
    </>
  );
};

export default ImpulseControlPage; 