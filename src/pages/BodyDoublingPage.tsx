import React from 'react';
import { BodyDoubling } from '../components/focus/body-doubling';
import { Helmet } from 'react-helmet';

const BodyDoublingPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Body Doubling | Easier Focus</title>
        <meta name="description" content="Enhance your focus with virtual accountability partners. Join or host body doubling sessions to improve productivity and reduce procrastination." />
      </Helmet>
      <BodyDoubling />
    </>
  );
};

export default BodyDoublingPage; 