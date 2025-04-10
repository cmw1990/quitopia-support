import React from 'react';
import { LandingLayout } from '../../components/layout/LandingLayout'; // Use relative path

const AboutPage: React.FC = () => {
  return (
    <LandingLayout>
      <div className="container mx-auto px-4 py-16 md:py-24">
        <h1 className="text-4xl font-bold tracking-tight text-center mb-8 md:mb-12">
          About Easier Focus
        </h1>
        <div className="max-w-3xl mx-auto space-y-6 text-lg text-muted-foreground text-center">
          <p>
            Welcome to Easier Focus, your dedicated partner in navigating the complexities of ADHD, focus challenges, chronic fatigue, and energy management.
          </p>
          <p>
            Our mission is to empower individuals by providing intuitive tools and strategies designed to enhance productivity, reduce distractions, and promote sustainable energy levels throughout the day. We believe that everyone deserves the opportunity to achieve their goals without feeling overwhelmed or exhausted.
          </p>
          <p>
            Easier Focus was born from personal experience and a deep understanding of the daily hurdles faced by those managing these conditions. We combine evidence-based techniques like the Pomodoro method and task breakdown with innovative energy tracking and distraction blocking features, all wrapped in a supportive and user-friendly interface.
          </p>
          <p>
            Join our community and discover a more focused, energized, and balanced way to work and live.
          </p>
          {/* TODO: Add more content - team, values, detailed history? */}
        </div>
      </div>
    </LandingLayout>
  );
};

export default AboutPage;
