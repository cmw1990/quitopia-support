import React from 'react';
import { FocusJournal as FocusJournalComponent } from '@/components/focus/journal/FocusJournal';
import { Helmet } from 'react-helmet-async';

const FocusJournal: React.FC = () => {
  return (
    <div className="container mx-auto py-6">
      <Helmet>
        <title>Focus Journal | Easier Focus</title>
        <meta name="description" content="Track your focus sessions, challenges, and insights to improve your productivity" />
      </Helmet>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Focus Journal</h1>
        <p className="text-muted-foreground mt-2">
          Record your focus journey, track patterns, and discover what works for you
        </p>
      </div>
      
      <div className="grid gap-6">
        <FocusJournalComponent />
      </div>
    </div>
  );
};

export default FocusJournal; 