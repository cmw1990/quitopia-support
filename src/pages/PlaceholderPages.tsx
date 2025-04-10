import React from 'react';
// import { PublicLayout } from '@/layouts/PublicLayout'; // Removed Layout import
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PlaceholderPage: React.FC<{ title: string; content: string }> = ({ title, content }) => (
  // Layout is handled by the router configuration
  <div className="container mx-auto px-4 py-16">
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{content}</p>
        {/* Add more specific placeholder content later if needed */}
      </CardContent>
    </Card>
  </div>
);

export const PrivacyPage = () => <PlaceholderPage title="Privacy Policy" content="Our privacy policy details will be available here soon. We are committed to protecting your data." />;
export const TermsPage = () => <PlaceholderPage title="Terms of Service" content="Our terms of service will be available here soon." />;
export const AboutPage = () => <PlaceholderPage title="About Us" content="Learn more about the Easier Focus team and our mission here soon." />;
export const ContactPage = () => <PlaceholderPage title="Contact Us" content="Information on how to contact us will be available here soon." />;
export const BlogPage = () => <PlaceholderPage title="Blog" content="Our blog featuring focus tips, research, and updates is coming soon." />;
export const PricingPage = () => <PlaceholderPage title="Pricing" content="Details about our subscription plans and pricing will be available here soon." />;
// Add other placeholder pages if needed (e.g., Resources, Teams)
export const ResourcesPage = () => <PlaceholderPage title="Resources" content="A collection of helpful resources is coming soon." />;
export const TeamsPage = () => <PlaceholderPage title="EasierFocus for Teams" content="Information about our team plans is coming soon." />; 