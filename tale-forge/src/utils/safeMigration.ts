import { supabase } from '@/lib/supabase';

// Safe migration utility - READ ONLY operations first
export const examineCurrentSchema = async () => {
  console.log('🔍 SAFELY examining current database structure...');
  
  try {
    // First, let's discover what tables actually exist using information_schema
    console.log('🔍 Discovering existing tables...');
    
    const { data: tablesData, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    console.log('📋 Information schema query result:', tablesData, tablesError);
    
    // Fallback: try common table names that might exist
    const tablesToCheck = [
      'users', 
      'profiles', 
      'stories', 
      'tale_segments',
      'user_stories',
      'subscriptions',
      'User', // Capital U
      'Story', // Capital S  
      'Profile',
      'user_profiles',
      'story_data',
      'tales',
      'user_accounts'
    ];
    
    const results = {
      discoveredTables: tablesData || [],
      existingTables: [],
      userInfo: null,
      storyInfo: null,
      totalUsers: 0,
      totalStories: 0,
      authUsersCount: 0
    };
    
    // If we got table names from information_schema, use those first
    let tablesToTry = tablesToCheck;
    if (tablesData && tablesData.length > 0) {
      const discoveredTableNames = tablesData.map(t => t.table_name);
      console.log('📋 Discovered tables:', discoveredTableNames);
      tablesToTry = [...discoveredTableNames, ...tablesToCheck];
    }
    
    // Check each table safely
    for (const tableName of tablesToTry) {
      try {
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact' })
          .limit(1);
        
        if (!error) {
          results.existingTables.push({
            name: tableName,
            recordCount: count,
            sampleStructure: data?.[0] ? Object.keys(data[0]) : []
          });
          
          console.log(`✅ Found table: ${tableName} (${count} records)`);
          
          // Get sample user data structure (try various user table names)
          if ((tableName.toLowerCase().includes('user') || tableName.toLowerCase() === 'profile') && count > 0) {
            results.userInfo = {
              tableName: tableName,
              count: count,
              sampleColumns: Object.keys(data[0]),
              sampleRecord: data[0] // Will help us understand the structure
            };
            results.totalUsers = Math.max(results.totalUsers, count);
          }
          
          // Get sample story data structure (try various story table names)
          if ((tableName.toLowerCase().includes('story') || tableName.toLowerCase().includes('tale')) && count > 0) {
            results.storyInfo = {
              tableName: tableName,
              count: count,
              sampleColumns: Object.keys(data[0]),
              sampleRecord: data[0]
            };
            results.totalStories = Math.max(results.totalStories, count);
          }
        }
      } catch (err) {
        console.log(`❌ Table not accessible: ${tableName}`);
      }
    }
    
    // Also check auth.users through different methods
    try {
      // Method 1: Try to get session and count auth users indirectly
      const { data: session } = await supabase.auth.getSession();
      if (session?.session) {
        console.log('✅ Auth system is working, user is authenticated');
        results.authUsersCount = 'authenticated (count unknown without service role)';
      }
      
      // Method 2: Try admin functions if available
      try {
        const { data: authUsers } = await supabase.auth.admin.listUsers();
        if (authUsers?.users) {
          console.log(`✅ Found ${authUsers.users.length} users in auth.users`);
          results.authUsersCount = authUsers.users.length;
        }
      } catch (adminErr) {
        console.log('ℹ️ Admin functions not available (need service role key for full access)');
      }
    } catch (err) {
      console.log('❌ Cannot access auth system:', err);
    }
    
    console.log('📊 Current database analysis:', results);
    return results;
    
  } catch (error) {
    console.error('❌ Error examining schema:', error);
    return { error, success: false };
  }
};

// Test connection and auth status
export const testConnection = async () => {
  try {
    console.log('🔗 Testing Supabase connection...');
    
    // Test current auth session first (most reliable)
    const { data: session } = await supabase.auth.getSession();
    console.log('🔐 Current auth session:', session?.session ? 'Active' : 'None');
    
    // Try to access any table to test connection (don't assume 'users' exists)
    let connectionWorking = false;
    const testTables = ['profiles', 'users', 'stories', 'information_schema.tables'];
    
    for (const tableName of testTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!error) {
          console.log(`✅ Connection test successful using table: ${tableName}`);
          connectionWorking = true;
          break;
        }
      } catch (err) {
        continue;
      }
    }
    
    if (!connectionWorking) {
      // Even if tables don't exist, if we can get session, connection is working
      if (session?.session) {
        console.log('✅ Connection working (auth session active, tables may be empty)');
        connectionWorking = true;
      }
    }
    
    return { 
      success: connectionWorking, 
      hasSession: !!session?.session,
      sessionUser: session?.session?.user?.email
    };
    
  } catch (error) {
    console.error('❌ Connection test error:', error);
    return { success: false, error };
  }
};

// SAFE: Only examine data, no modifications
export const getUserSample = async (limit = 3) => {
  try {
    console.log(`🔍 Getting sample of users (limit: ${limit})...`);
    
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .limit(limit);
    
    if (error) {
      console.error('❌ Error fetching user sample:', error);
      return null;
    }
    
    // Remove any sensitive data from logs
    const safeSample = users?.map(user => ({
      id: user.id,
      email: user.email ? `${user.email.substring(0, 3)}***` : 'no email',
      columns: Object.keys(user)
    }));
    
    console.log('👥 User sample structure:', safeSample);
    return users;
    
  } catch (error) {
    console.error('❌ Error in getUserSample:', error);
    return null;
  }
};

// SAFE: Only examine data, no modifications  
export const getStorySample = async (limit = 3) => {
  try {
    console.log(`🔍 Getting sample of stories (limit: ${limit})...`);
    
    // Try different possible story table names
    const storyTables = ['stories', 'user_stories', 'tale_segments'];
    
    for (const tableName of storyTables) {
      try {
        const { data: stories, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(limit);
        
        if (!error && stories?.length > 0) {
          const safeSample = stories.map(story => ({
            id: story.id,
            title: story.title || story.name || 'untitled',
            columns: Object.keys(story)
          }));
          
          console.log(`📚 Story sample from ${tableName}:`, safeSample);
          return { tableName, stories };
        }
      } catch (err) {
        continue;
      }
    }
    
    console.log('❌ No accessible story tables found');
    return null;
    
  } catch (error) {
    console.error('❌ Error in getStorySample:', error);
    return null;
  }
};