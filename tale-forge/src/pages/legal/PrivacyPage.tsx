import React from 'react';
import Text from '@/components/atoms/Text';

const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <Text variant="h1" weight="bold" className="text-3xl mb-8">
        Privacy Policy
      </Text>
      
      <Text variant="p" color="secondary" className="mb-6">
        Last updated: August 19, 2025
      </Text>
      
      <div className="prose max-w-none">
        <Text variant="h2" weight="semibold" className="text-xl mt-8 mb-4">
          1. Introduction
        </Text>
        <Text variant="p" className="mb-4">
          Welcome to Tale Forge ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
        </Text>
        
        <Text variant="h2" weight="semibold" className="text-xl mt-8 mb-4">
          2. Information We Collect
        </Text>
        <Text variant="p" className="mb-4">
          We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and services, participate in activities on the Services, or otherwise contact us.
        </Text>
        <Text variant="p" className="mb-4">
          The personal information we collect may include:
        </Text>
        <ul className="list-disc pl-8 mb-4">
          <li>Name</li>
          <li>Email address</li>
          <li>Account passwords</li>
          <li>Payment information</li>
          <li>Child's name and age (for story personalization)</li>
        </ul>
        
        <Text variant="h2" weight="semibold" className="text-xl mt-8 mb-4">
          3. How We Use Your Information
        </Text>
        <Text variant="p" className="mb-4">
          We use personal information collected via our Services for a variety of business purposes described below:
        </Text>
        <ul className="list-disc pl-8 mb-4">
          <li>To facilitate account creation and logon process</li>
          <li>To provide and improve our services</li>
          <li>To personalize user experience</li>
          <li>To process payments and manage subscriptions</li>
          <li>To send administrative information</li>
          <li>To protect our services and users</li>
        </ul>
        
        <Text variant="h2" weight="semibold" className="text-xl mt-8 mb-4">
          4. Children's Privacy
        </Text>
        <Text variant="p" className="mb-4">
          We take children's privacy seriously. We do not knowingly collect personal information from children under the age of 13 without parental consent. If we become aware that we have collected personal information from a child under 13 without verification of parental consent, we will take steps to remove that information from our servers.
        </Text>
        
        <Text variant="h2" weight="semibold" className="text-xl mt-8 mb-4">
          5. Data Security
        </Text>
        <Text variant="p" className="mb-4">
          We implement appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.
        </Text>
        
        <Text variant="h2" weight="semibold" className="text-xl mt-8 mb-4">
          6. Your Privacy Rights
        </Text>
        <Text variant="p" className="mb-4">
          In some regions, such as the European Economic Area (EEA) and United Kingdom (UK), you have rights that allow you greater access to and control over your personal information. You may review, change, or terminate your account at any time.
        </Text>
        
        <Text variant="h2" weight="semibold" className="text-xl mt-8 mb-4">
          7. Contact Us
        </Text>
        <Text variant="p" className="mb-4">
          If you have questions or comments about this policy, you may email us at privacy@taleforge.com.
        </Text>
      </div>
    </div>
  );
};

export default PrivacyPage;