import React from 'react';
import { LandingLayout } from '../../components/layout/LandingLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Send } from 'lucide-react';

const ContactPage: React.FC = () => {
  // TODO: Implement form submission logic (e.g., API call, email service)
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Form submitted');
    // Add submission logic here
  };

  return (
    <LandingLayout>
      <div className="container mx-auto px-4 py-16 md:py-24">
        <h1 className="text-4xl font-bold tracking-tight text-center mb-4">
          Contact Us
        </h1>
        <p className="text-lg text-muted-foreground text-center mb-8 md:mb-12 max-w-2xl mx-auto">
          Have questions, feedback, or suggestions? We'd love to hear from you. Fill out the form below, and we'll get back to you as soon as possible.
        </p>
        
        <div className="max-w-xl mx-auto bg-card p-8 rounded-lg shadow-md border border-border/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" type="text" placeholder="Your Name" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your.email@example.com" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" type="text" placeholder="How can we help?" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" placeholder="Your message..." required rows={5} className="mt-1" />
            </div>
            <Button type="submit" className="w-full">
              <Send className="mr-2 h-4 w-4" /> Send Message
            </Button>
          </form>
        </div>
      </div>
    </LandingLayout>
  );
};

export default ContactPage;
