import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Text from '@/components/atoms/Text';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';

const ResetPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Simulate API call to send reset password email
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage('Password reset instructions have been sent to your email address.');
    } catch (err) {
      setError('Failed to send reset instructions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white py-8 px-4 shadow rounded-lg sm:px-10">
        <Text variant="h1" weight="bold" className="text-2xl text-center mb-6">
          Reset your password
        </Text>
        
        <Text variant="p" color="secondary" className="text-center mb-6">
          Enter your email address and we'll send you instructions to reset your password.
        </Text>
        
        {message && (
          <div className="bg-green-50 text-green-700 p-3 rounded mb-4">
            {message}
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <Button
            type="submit"
            variant="primary"
            size="large"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send reset instructions'}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <button 
            onClick={() => navigate('/signin')}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Back to sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;