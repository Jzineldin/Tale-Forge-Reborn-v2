import React from 'react';
import { PageLayout, TypographyLayout } from '@/components/layout';

const PrivacyPage: React.FC = () => {
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
                Privacy Policy
              </TypographyLayout>
              
              <TypographyLayout variant="body" className="text-gray-400 mb-8 text-center">
                Last updated: August 19, 2025
              </TypographyLayout>
              
              <div className="space-y-8">
                <section>
                  <TypographyLayout variant="section" className="text-orange-400 mb-4">
                    1. Introduction
                  </TypographyLayout>
                  <TypographyLayout variant="body" className="text-gray-300 leading-relaxed">
                    Welcome to Tale Forge ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
                  </TypographyLayout>
                </section>
                
                <section>
                  <TypographyLayout variant="section" className="text-orange-400 mb-4">
                    2. Information We Collect
                  </TypographyLayout>
                  <TypographyLayout variant="body" className="text-gray-300 mb-4 leading-relaxed">
                    We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and services, participate in activities on the Services, or otherwise contact us.
                  </TypographyLayout>
                  <TypographyLayout variant="body" className="text-gray-300 mb-3">
                    The personal information we collect may include:
                  </TypographyLayout>
                  <ul className="list-disc pl-8 space-y-2 text-gray-300">
                    <li>Name</li>
                    <li>Email address</li>
                    <li>Account passwords</li>
                    <li>Payment information</li>
                    <li>Child's name and age (for story personalization)</li>
                  </ul>
                </section>
                
                <section>
                  <TypographyLayout variant="section" className="text-orange-400 mb-4">
                    3. How We Use Your Information
                  </TypographyLayout>
                  <TypographyLayout variant="body" className="text-gray-300 mb-4 leading-relaxed">
                    We use personal information collected via our Services for a variety of business purposes described below:
                  </TypographyLayout>
                  <ul className="list-disc pl-8 space-y-2 text-gray-300">
                    <li>To facilitate account creation and logon process</li>
                    <li>To provide and improve our services</li>
                    <li>To personalize user experience</li>
                    <li>To process payments and manage subscriptions</li>
                    <li>To send administrative information</li>
                    <li>To protect our services and users</li>
                  </ul>
                </section>
                
                <section>
                  <TypographyLayout variant="section" className="text-orange-400 mb-4">
                    4. Children's Privacy
                  </TypographyLayout>
                  <TypographyLayout variant="body" className="text-gray-300 leading-relaxed">
                    We take children's privacy seriously. We do not knowingly collect personal information from children under the age of 13 without parental consent. If we become aware that we have collected personal information from a child under 13 without verification of parental consent, we will take steps to remove that information from our servers.
                  </TypographyLayout>
                </section>
                
                <section>
                  <TypographyLayout variant="section" className="text-orange-400 mb-4">
                    5. Data Security
                  </TypographyLayout>
                  <TypographyLayout variant="body" className="text-gray-300 leading-relaxed">
                    We implement appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.
                  </TypographyLayout>
                </section>
                
                <section>
                  <TypographyLayout variant="section" className="text-orange-400 mb-4">
                    6. Your Privacy Rights
                  </TypographyLayout>
                  <TypographyLayout variant="body" className="text-gray-300 leading-relaxed">
                    In some regions, such as the European Economic Area (EEA) and United Kingdom (UK), you have rights that allow you greater access to and control over your personal information. You may review, change, or terminate your account at any time.
                  </TypographyLayout>
                </section>
                
                <section>
                  <TypographyLayout variant="section" className="text-orange-400 mb-4">
                    7. Contact Us
                  </TypographyLayout>
                  <TypographyLayout variant="body" className="text-gray-300 leading-relaxed">
                    If you have questions or comments about this policy, you may email us at privacy@taleforge.com.
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

export default PrivacyPage;