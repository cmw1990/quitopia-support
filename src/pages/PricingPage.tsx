import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const PricingPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Pricing - EasierFocus</title>
        <meta name="description" content="Explore EasierFocus subscription plans and choose the one that fits your needs." />
      </Helmet>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">Pricing Plans</h1>
        <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Unlock powerful tools to enhance your focus and productivity. Choose the plan that's right for you.
        </p>
        {/* Placeholder for actual pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>Get started with essential focus tools.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-4xl font-bold mb-4">$0<span className="text-lg font-normal text-muted-foreground">/month</span></p>
              <ul className="space-y-2 text-muted-foreground">
                <li>Basic Pomodoro Timer</li>
                <li>Mood & Energy Tracking (Limited History)</li>
                <li>Community Access (Read-only)</li>
              </ul>
            </CardContent>
            {/* Add Button later */}
          </Card>
          <Card className="border-primary flex flex-col">
             <CardHeader>
              <CardTitle>Premium</CardTitle>
              <CardDescription>Unlock the full suite of focus-enhancing features.</CardDescription>
            </CardHeader>
             <CardContent className="flex-grow">
              <p className="text-4xl font-bold mb-4">$9.99<span className="text-lg font-normal text-muted-foreground">/month</span></p>
               <ul className="space-y-2 text-muted-foreground">
                <li>All Free features, plus:</li>
                <li>Advanced Task Manager</li>
                <li>AI Pomodoro & Flow Timer</li>
                <li>Intelligent Distraction Blocker</li>
                <li>Full Analytics & Insights</li>
                <li>Personalized Strategies</li>
                <li>Achievements & Gamification</li>
                <li>Full Community Access</li>
                <li>And much more...</li>
              </ul>
            </CardContent>
             {/* Add Button later */}
          </Card>
           <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Teams/Enterprise</CardTitle>
              <CardDescription>Custom solutions for organizations.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
               <p className="text-lg mb-4">Contact us for tailored plans and volume discounts.</p>
               {/* Add Contact Button later */}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default PricingPage; 