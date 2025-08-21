import React from 'react';
import Text from '@/components/atoms/Text';

const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <Text variant="h1" weight="bold" className="text-3xl mb-8">
        Terms of Service
      </Text>
      
      <Text variant="p" color="secondary" className="mb-6">
        Last updated: August 19, 2025
      </Text>
      
      <div className="prose max-w-none">
        <Text variant="h2" weight="semibold" className="text-xl mt-8 mb-4">
          1. Agreement to Terms
        </Text>
        <Text variant="p" className="mb-4">
          These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Tale Forge ("we," "us," or "our"), concerning your access to and use of our website and services.
        </Text>
        
        <Text variant="h2" weight="semibold" className="text-xl mt-8 mb-4">
          2. Intellectual Property Rights
        </Text>
        <Text variant="p" className="mb-4">
          Unless otherwise indicated, we or our licensors own the intellectual property rights for all material on Tale Forge. All intellectual property rights are reserved. You may view and/or print pages for your personal use subject to restrictions set in these terms.
        </Text>
        
        <Text variant="h2" weight="semibold" className="text-xl mt-8 mb-4">
          3. User Content
        </Text>
        <Text variant="p" className="mb-4">
          By submitting content to Tale Forge, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, adapt, publish, translate and distribute your content in any existing or future media.
        </Text>
        <Text variant="p" className="mb-4">
          You represent and warrant that:
        </Text>
        <ul className="list-disc pl-8 mb-4">
          <li>You own or have the necessary licenses, rights, consents, and permissions to upload and use the content;</li>
          <li>The content does not infringe upon any third-party rights;</li>
          <li>The content complies with all applicable laws and regulations;</li>
          <li>The content does not contain any defamatory, obscene, or offensive material.</li>
        </ul>
        
        <Text variant="h2" weight="semibold" className="text-xl mt-8 mb-4">
          4. Prohibited Activities
        </Text>
        <Text variant="p" className="mb-4">
          You may not access or use the services for any purpose except those expressly permitted. You agree not to:
        </Text>
        <ul className="list-disc pl-8 mb-4">
          <li>Systematically retrieve data or other content to create or compile a collection;</li>
          <li>Make any unauthorized use of the services;</li>
          <li>Engage in unauthorized framing of or linking to the services;</li>
          <li>Upload or transmit viruses or other malicious code;</li>
          <li>Harass, annoy, intimidate, or threaten any of our employees or agents.</li>
        </ul>
        
        <Text variant="h2" weight="semibold" className="text-xl mt-8 mb-4">
          5. Subscription and Payments
        </Text>
        <Text variant="p" className="mb-4">
          Certain features of our services may require payment of fees. All fees are non-refundable except as required by law. We reserve the right to change our pricing at any time.
        </Text>
        
        <Text variant="h2" weight="semibold" className="text-xl mt-8 mb-4">
          6. Termination
        </Text>
        <Text variant="p" className="mb-4">
          We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
        </Text>
        
        <Text variant="h2" weight="semibold" className="text-xl mt-8 mb-4">
          7. Limitation of Liability
        </Text>
        <Text variant="p" className="mb-4">
          In no event shall Tale Forge, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
        </Text>
        
        <Text variant="h2" weight="semibold" className="text-xl mt-8 mb-4">
          8. Changes to Terms
        </Text>
        <Text variant="p" className="mb-4">
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide at least 30 days' notice prior to any new terms taking effect.
        </Text>
        
        <Text variant="h2" weight="semibold" className="text-xl mt-8 mb-4">
          9. Contact Us
        </Text>
        <Text variant="p" className="mb-4">
          If you have any questions about these Terms, please contact us at terms@taleforge.com.
        </Text>
      </div>
    </div>
  );
};

export default TermsPage;