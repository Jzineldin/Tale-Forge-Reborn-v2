import React, { useState } from 'react';
import Text from '@/components/atoms/Text';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';

const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError(false);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      
      setSubmitSuccess(true);
    } catch (error) {
      setSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <Text variant="h1" weight="bold" className="text-3xl mb-8">
        Contact Us
      </Text>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <Text variant="h2" weight="semibold" className="text-xl mb-6">
            Get in Touch
          </Text>
          
          <Text variant="p" className="mb-6">
            We'd love to hear from you! Whether you have a question about our services, need help with your account, or just want to share your feedback, our team is ready to help.
          </Text>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-indigo-100 rounded-lg p-3">
                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <Text variant="h3" weight="semibold" className="mb-1">
                  Email
                </Text>
                <Text variant="p" color="secondary">
                  support@taleforge.com
                </Text>
                <Text variant="p" color="secondary">
                  sales@taleforge.com
                </Text>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-indigo-100 rounded-lg p-3">
                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="ml-4">
                <Text variant="h3" weight="semibold" className="mb-1">
                  Phone
                </Text>
                <Text variant="p" color="secondary">
                  +1 (555) 123-4567
                </Text>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-indigo-100 rounded-lg p-3">
                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <Text variant="h3" weight="semibold" className="mb-1">
                  Office
                </Text>
                <Text variant="p" color="secondary">
                  123 Story Lane
                </Text>
                <Text variant="p" color="secondary">
                  San Francisco, CA 94107
                </Text>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <Text variant="h2" weight="semibold" className="text-xl mb-6">
            Send us a Message
          </Text>
          
          {submitSuccess && (
            <div className="bg-green-50 text-green-700 p-4 rounded mb-6">
              Thank you for your message! We'll get back to you as soon as possible.
            </div>
          )}
          
          {submitError && (
            <div className="bg-red-50 text-red-700 p-4 rounded mb-6">
              There was an error sending your message. Please try again.
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <Input
              label="Subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            
            <Button
              type="submit"
              variant="primary"
              size="large"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;