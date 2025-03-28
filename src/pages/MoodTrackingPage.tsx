import React from 'react';
import { MoodTracker } from '@/components/health/MoodTracker';
import { useSession } from '@supabase/auth-helpers-react';
import { PageLayout } from '@/components/layouts/PageLayout';

const MoodTrackingPage: React.FC = () => {
  const session = useSession();
  
  return (
    <PageLayout
      title="Mood Tracking"
      description="Track your mood changes throughout your quit journey"
    >
      <div className="container mx-auto py-6 space-y-6">
        <MoodTracker session={session} />
      </div>
    </PageLayout>
  );
};

export default MoodTrackingPage; 