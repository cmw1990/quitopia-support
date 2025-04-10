import React from 'react';
import { LandingLayout } from '../../components/layout/LandingLayout';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <LandingLayout>
      <div className="container mx-auto px-4 py-16 md:py-24">
        <h1 className="text-4xl font-bold tracking-tight text-center mb-8 md:mb-12">
          Privacy Policy
        </h1>
        <div className="prose prose-lg dark:prose-invert max-w-4xl mx-auto text-muted-foreground">
          {/* TODO: Replace placeholder content with actual Privacy Policy */}
          <p><strong>Last Updated: March 30, 2025</strong></p>
          
          <h2>Introduction</h2>
          <p>
            Easier Focus ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and application (collectively, the "Service"). Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the Service.
          </p>

          <h2>Information We Collect</h2>
          <p>
            We may collect personal information that you voluntarily provide to us when you register on the Service, express an interest in obtaining information about us or our products and services, when you participate in activities on the Service, or otherwise when you contact us.
          </p>
          <p>
            The personal information that we collect depends on the context of your interactions with us and the Service, the choices you make, and the products and features you use. The personal information we collect may include the following:
          </p>
          <ul>
            <li>Personal Identifiers: Name, email address, username, password.</li>
            <li>Usage Data: Information about how you use the Service, such as features accessed, time spent, performance data.</li>
            <li>Task and Focus Data: Information related to tasks you create, time tracked, focus sessions, energy levels logged (if using relevant features). This data is treated with utmost sensitivity.</li>
            <li>Device Information: Information about the device you use to access the Service, such as IP address, browser type, operating system.</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>
            We use the information we collect or receive:
          </p>
          <ul>
            <li>To create and manage your account.</li>
            <li>To provide, operate, and maintain our Service.</li>
            <li>To improve, personalize, and expand our Service.</li>
            <li>To understand and analyze how you use our Service.</li>
            <li>To develop new products, services, features, and functionality.</li>
            <li>To communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the Service, and for marketing and promotional purposes (with your consent where required).</li>
            <li>To process your transactions (if applicable).</li>
            <li>To find and prevent fraud.</li>
          </ul>

          <h2>Sharing Your Information</h2>
          <p>
            We do not sell your personal information. We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
          </p>
          <ul>
            <li>By Law or to Protect Rights: If required by law or if we believe disclosure is necessary to protect rights, property, or safety.</li>
            <li>Third-Party Service Providers: With vendors, consultants, and other third-party service providers who need access to such information to carry out work on our behalf (e.g., hosting, analytics, payment processing).</li>
            <li>Business Transfers: In connection with any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
            <li>With Your Consent: We may disclose your personal information for any other purpose with your consent.</li>
          </ul>

          {/* Add sections on Data Security, Data Retention, Your Rights, Children's Privacy, Changes to this Policy, Contact Us */}
          <h2>Data Security</h2>
          <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>

          <h2>Contact Us</h2>
          <p>If you have questions or comments about this Privacy Policy, please contact us at: [Your Contact Email/Form Link]</p>
        </div>
      </div>
    </LandingLayout>
  );
};

export default PrivacyPolicyPage;
