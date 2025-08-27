import React from 'react';
import { PageLayout, TypographyLayout } from '@/components/layout';

const TermsPage: React.FC = () => {
  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url('/images/main.astronaut.jpg')` }}
    >
      <div className="min-h-screen bg-gradient-to-b from-slate-950/95 via-slate-950/90 to-purple-950/95">
        <PageLayout>
          <div className="max-w-4xl mx-auto py-16">
            <div className="bg-slate-900/80 backdrop-blur-lg rounded-2xl p-8 md:p-12 border border-white/10">
              <TypographyLayout variant="hero" className="text-white mb-8 text-center">
                Terms of Service
              </TypographyLayout>
              
              <TypographyLayout variant="body" className="text-gray-400 mb-8 text-center">
                Last updated: August 19, 2025
              </TypographyLayout>
              
              <div className="space-y-8">
                <section>
                  <TypographyLayout variant="section" className="text-orange-400 mb-4">
                    1. Agreement to Terms
                  </TypographyLayout>
                  <TypographyLayout variant="body" className="text-gray-300 leading-relaxed">
                    These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Tale Forge ("we," "us," or "our"), concerning your access to and use of our website and services.
                  </TypographyLayout>
                </section>
                
                <section>
                  <TypographyLayout variant="section" className="text-orange-400 mb-4">
                    2. Intellectual Property Rights
                  </TypographyLayout>
                  <TypographyLayout variant="body" className="text-gray-300 leading-relaxed">
                    Unless otherwise indicated, we or our licensors own the intellectual property rights for all material on Tale Forge. All intellectual property rights are reserved. You may view and/or print pages for your personal use subject to restrictions set in these terms.
                  </TypographyLayout>
                </section>
                
                <section>
                  <TypographyLayout variant="section" className="text-orange-400 mb-4">
                    3. User Content
                  </TypographyLayout>
                  <TypographyLayout variant="body" className="text-gray-300 mb-4 leading-relaxed">
                    By submitting content to Tale Forge, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, adapt, publish, translate and distribute your content in any existing or future media.
                  </TypographyLayout>
                  <TypographyLayout variant="body" className="text-gray-300 mb-3">
                    You represent and warrant that:
                  </TypographyLayout>
                  <ul className="list-disc pl-8 space-y-2 text-gray-300">
                    <li>You own or have the necessary licenses, rights, consents, and permissions to upload and use the content;</li>
                    <li>The content does not infringe upon any third-party rights;</li>
                    <li>The content complies with all applicable laws and regulations;</li>
                    <li>The content does not contain any defamatory, obscene, or offensive material.</li>
                  </ul>
                </section>
                
                <section>
                  <TypographyLayout variant="section" className="text-orange-400 mb-4">
                    4. Prohibited Activities
                  </TypographyLayout>
                  <TypographyLayout variant="body" className="text-gray-300 mb-4 leading-relaxed">
                    You may not access or use the services for any purpose except those expressly permitted. You agree not to:
                  </TypographyLayout>
                  <ul className="list-disc pl-8 space-y-2 text-gray-300">
                    <li>Use the services in violation of any laws or regulations</li>
                    <li>Upload or transmit viruses or malicious code</li>
                    <li>Interfere with or disrupt the services</li>
                    <li>Attempt to gain unauthorized access to any part of the services</li>
                    <li>Use the services to harass, abuse, or harm another person</li>
                  </ul>
                </section>
                
                <section>
                  <TypographyLayout variant="section" className="text-orange-400 mb-4">
                    5. Purchases and Payments
                  </TypographyLayout>
                  <TypographyLayout variant="body" className="text-gray-300 leading-relaxed">
                    All purchases are subject to product availability. We reserve the right to refuse any order placed with us. Prices for our products are subject to change without notice. Payment must be received prior to acceptance of an order.
                  </TypographyLayout>
                </section>
                
                <section>
                  <TypographyLayout variant="section" className="text-orange-400 mb-4">
                    6. Limitation of Liability
                  </TypographyLayout>
                  <TypographyLayout variant="body" className="text-gray-300 leading-relaxed">
                    To the fullest extent permitted by law, Tale Forge shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
                  </TypographyLayout>
                </section>
                
                <section>
                  <TypographyLayout variant="section" className="text-orange-400 mb-4">
                    7. Termination
                  </TypographyLayout>
                  <TypographyLayout variant="body" className="text-gray-300 leading-relaxed">
                    We may terminate or suspend your account and bar access to the services immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
                  </TypographyLayout>
                </section>
                
                <section>
                  <TypographyLayout variant="section" className="text-orange-400 mb-4">
                    8. Contact Information
                  </TypographyLayout>
                  <TypographyLayout variant="body" className="text-gray-300 leading-relaxed">
                    If you have any questions about these Terms of Service, please contact us at legal@taleforge.com.
                  </TypographyLayout>
                </section>
              </div>
            </div>
          </div>
        </PageLayout>
      </div>
    </div>
  );
};

export default TermsPage;