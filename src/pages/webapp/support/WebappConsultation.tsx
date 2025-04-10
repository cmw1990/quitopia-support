import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';

export const WebappConsultation: React.FC = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Expert Consultation</CardTitle>
          <CardDescription>Book a session with our wellness experts</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Available Experts</h3>
            {/* Expert list would be dynamically populated */}
            <div className="space-y-2">
              {['Wellness Coach', 'Nutritionist', 'Sleep Specialist', 'Mental Health Counselor'].map((expert) => (
                <Card key={expert}>
                  <CardContent className="flex justify-between items-center p-4">
                    <span>{expert}</span>
                    <Button variant="outline">Book</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Select Date</h3>
            <Calendar mode="single" className="rounded-md border" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
