import React from 'react';
import { LandingLayout } from '../../components/layout/LandingLayout';

const TermsOfServicePage: React.FC = () => {
  return (
    <LandingLayout>
      <div className="container mx-auto px-4 py-16 md:py-24">
        <h1 className="text-4xl font-bold tracking-tight text-center mb-8 md:mb-12">
          Terms of Service
        </h1>
        <div className="prose prose-lg dark:prose-invert max-w-4xl mx-auto text-muted-foreground">
          {/* TODO: Replace placeholder content with actual Terms of Service */}
          <p><strong>Last Updated: March 30, 2025</strong></p>
          
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Easier Focus website and application (the "Service"), provided by [Your Company Name] ("we," "us," or "our"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to all of these Terms, do not use the Service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            Easier Focus provides tools and resources designed to aid in focus, task management, energy tracking, and distraction blocking, particularly beneficial for individuals managing ADHD, focus challenges, or fatigue. The Service includes web and potentially mobile applications.
          </p>

          <h2>3. User Accounts</h2>
          <p>
            To access certain features of the Service, you may be required to create an account. You are responsible for maintaining the confidentiality of your account password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
          </p>

          <h2>4. User Conduct</h2>
          <p>
            You agree not to use the Service for any unlawful purpose or in any way that interrupts, damages, or impairs the Service. You agree to comply with all applicable laws regarding your use of the Service.
          </p>

          <h2>5. Intellectual Property</h2>
          <p>
            All content included on the Service, such as text, graphics, logos, icons, images, and software, is the property of [Your Company Name] or its content suppliers and protected by international copyright laws. The compilation of all content on this site is the exclusive property of [Your Company Name].
          </p>

          <h2>6. Disclaimers</h2>
          <p>
            The Service is provided on an "as is" and "as available" basis. We make no warranties, expressed or implied, regarding the operation or availability of the Service or the information, content, materials, or products included on the Service. Easier Focus does not provide medical advice. Consult with a qualified healthcare professional for any health concerns or before making any decisions related to your health or treatment.
          </p>

          <h2>7. Limitation of Liability</h2>
          <p>
            In no event shall [Your Company Name], nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </p>

          <h2>8. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
          </p>

          <h2>9. Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the laws of [Your Jurisdiction, e.g., State of California, USA], without regard to its conflict of law provisions.
          </p>

          <h2>10. Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at: [Your Contact Email/Form Link]</p>
        </div>
      </div>
    </LandingLayout>
  );
};

export default TermsOfServicePage;
