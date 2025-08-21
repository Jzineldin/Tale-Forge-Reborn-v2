import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthContext';

const DataConnectionTest: React.FC = () => {
  const { user } = useAuth();
  const [connectionTest, setConnectionTest] = useState({
    authStatus: '',
    userCount: 0,
    storyCount: 0,
    userStories: 0,
    errors: [] as string[]
  });

  useEffect(() => {
    const testConnection = async () => {
      const errors: string[] = [];
      let authStatus = 'Not authenticated';
      let userCount = 0;
      let storyCount = 0;
      let userStories = 0;

      try {
        // Test auth status
        const { data: session } = await supabase.auth.getSession();
        authStatus = session.session ? `Authenticated as ${session.session.user.email}` : 'Not authenticated';

        // Test total users count from user_profiles table (has all 115 users)
        try {
          const { count, error: userError } = await supabase
            .from('user_profiles')
            .select('*', { count: 'exact', head: true });
          
          if (userError) {
            errors.push(`User_profiles query error: ${userError.message}`);
          } else {
            userCount = count || 0;
          }
        } catch (err) {
          errors.push(`User_profiles fetch failed: ${err}`);
        }

        // Also check user_profiles table for comparison
        try {
          const { count, error: userProfilesError } = await supabase
            .from('user_profiles')
            .select('*', { count: 'exact', head: true });
          
          if (userProfilesError) {
            errors.push(`User_profiles query error: ${userProfilesError.message}`);
          } else {
            // We'll show this in the UI
            (window as any).userProfilesCount = count || 0;
          }
        } catch (err) {
          errors.push(`User_profiles fetch failed: ${err}`);
        }

        // Test total stories count
        try {
          const { count, error: storyError } = await supabase
            .from('stories')
            .select('*', { count: 'exact', head: true });
          
          if (storyError) {
            errors.push(`Stories query error: ${storyError.message}`);
          } else {
            storyCount = count || 0;
          }
        } catch (err) {
          errors.push(`Stories fetch failed: ${err}`);
        }

        // Test user's stories if authenticated
        if (user?.id) {
          try {
            const { count, error: userStoryError } = await supabase
              .from('stories')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.id);
            
            if (userStoryError) {
              errors.push(`User stories query error: ${userStoryError.message}`);
            } else {
              userStories = count || 0;
            }
          } catch (err) {
            errors.push(`User stories fetch failed: ${err}`);
          }
        }

      } catch (error) {
        errors.push(`Connection test failed: ${error}`);
      }

      setConnectionTest({
        authStatus,
        userCount,
        storyCount,
        userStories,
        errors
      });
    };

    testConnection();
  }, [user]);

  return (
    <div className="glass-enhanced backdrop-blur-lg bg-black/20 border border-white/20 rounded-2xl p-6 mb-6">
      <h3 className="text-xl font-bold text-white mb-4">🔍 Database Connection Test</h3>
      
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-white/70">Auth Status:</span>
          <span className="text-white">{connectionTest.authStatus}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-white/70">Total Users:</span>
          <span className="text-amber-400 font-bold">{connectionTest.userCount}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-white/70">Total Stories:</span>
          <span className="text-amber-400 font-bold">{connectionTest.storyCount}</span>
        </div>
        
        {user && (
          <div className="flex justify-between">
            <span className="text-white/70">Your Stories:</span>
            <span className="text-blue-400 font-bold">{connectionTest.userStories}</span>
          </div>
        )}
        
        <div className="flex justify-between">
          <span className="text-white/70">Current User ID:</span>
          <span className="text-white text-xs">{user?.id || 'None'}</span>
        </div>
      </div>
      
      {connectionTest.errors.length > 0 && (
        <div className="mt-4 p-4 bg-red-500/20 border border-red-400/30 rounded-lg">
          <h4 className="text-red-400 font-semibold mb-2">Errors:</h4>
          <ul className="text-red-300 text-xs space-y-1">
            {connectionTest.errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DataConnectionTest;