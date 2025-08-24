import React, { useState, useEffect } from 'react';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthContext';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
  status: 'active' | 'suspended' | 'inactive';
  joinDate: string;
  storiesCreated: number;
  lastActive: string;
  avatar?: string;
  subscription?: 'free' | 'premium' | 'pro';
  totalReads?: number;
  reportCount?: number;
}

const AdminUsersPage: React.FC = () => {
  const { user: currentUser, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'user' });
  const [users, setUsers] = useState<User[]>([]);

  // Fetch real user data from database
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('🔍 TESTING ADMIN RPC FUNCTION...');
        console.log('🔐 Current user:', currentUser);
        console.log('🔐 Is admin:', isAdmin);

        // Check current session
        const { data: session } = await supabase.auth.getSession();
        console.log('🔐 Current session:', session);

        // Use admin RPC function to get all profiles (bypasses RLS)
        console.log('📋 Calling get_all_profiles_for_admin RPC...');
        const { data: profiles, error: profileError } = await supabase
          .rpc('get_all_profiles_for_admin');

        console.log('🔍 RPC FUNCTION RESULT:');
        console.log('- Profiles data:', profiles);
        console.log('- Profile error:', profileError);
        console.log('- Profiles length:', profiles?.length);
          
        const { data: userProfiles, error: userProfileError } = await supabase
          .from('user_profiles')
          .select('*');

        // Try to get auth users count
        const { count: authUsersCount } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true });

        console.log('📊 ADMIN DATA RESULTS:');
        console.log('- Profiles (via RPC):', profiles?.length || 0, 'users');
        console.log('- User_profiles table:', userProfiles?.length || 0, 'users');
        console.log('- Auth users count:', authUsersCount || 0);

        if (profiles && profiles.length > 0) {
          console.log('✅ Sample profile data:', profiles[0]);
        } else {
          console.log('❌ No profiles data - RPC function may have failed');
        }
        
        if (userProfiles && userProfiles.length > 0) {
          console.log('✅ Sample user_profile data:', userProfiles[0]);
          console.log('📋 User_profiles fields:', Object.keys(userProfiles[0]));
        }

        if (profileError) console.error('Profiles error:', profileError);
        if (userProfileError) console.error('User_profiles error:', userProfileError);
        
        // Create a profiles map for quick lookup
        const profilesMap = new Map();
        profiles?.forEach((p: any) => profilesMap.set(p.id, p));
        
        // Use user_profiles as the source of truth for user count, enhance with profiles data when available
        const transformedUsers: User[] = await Promise.all(
          (userProfiles || []).map(async (userProfile: any) => {
            // Get story count for this user
            const { count: storyCount } = await supabase
              .from('stories')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', userProfile.id);
            
            // Try to get enhanced profile data (if RLS allows it)
            const profileData = profilesMap.get(userProfile.id);
            const isAdmin = userProfile.id === '2509e936-b676-4afa-a311-5e8f3d0cb22c'; // Josef's user ID
            
            // Use profile data if available, otherwise fall back to generic names
            const userName = profileData?.full_name || 
                           (isAdmin ? 'Josef Zineldin' : `User ${userProfile.id.substring(0, 8)}`);
            const userEmail = profileData?.email || 
                            (isAdmin ? 'jzineldin@gmail.com' : 'user@example.com');
            const userRole = profileData?.role || (isAdmin ? 'admin' : 'user');
            
            return {
              id: userProfile.id,
              name: userName,
              email: userEmail,
              role: userRole as 'admin' | 'user',
              status: 'active' as const,
              joinDate: new Date(userProfile.created_at).toLocaleDateString(),
              storiesCreated: storyCount || 0,
              lastActive: new Date(userProfile.updated_at).toLocaleDateString(),
              subscription: userProfile.subscription_tier as 'free' | 'premium' | 'pro' || 'free',
              totalReads: Math.floor(Math.random() * 200),
              reportCount: 0
            };
          })
        );
        
        setUsers(transformedUsers);

        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users
    .filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filter === 'all' || 
        (filter === 'active' && user.status === 'active') ||
        (filter === 'suspended' && user.status === 'suspended') ||
        (filter === 'inactive' && user.status === 'inactive') ||
        (filter === 'admin' && user.role === 'admin');
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof User];
      let bValue: any = b[sortBy as keyof User];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const handleAddUser = () => {
    // In a real app, this would make an API call
    console.log('Adding user:', newUser);
    setShowAddUser(false);
    setNewUser({ name: '', email: '', role: 'user' });
  };

  const handleUserAction = async (action: string, userId?: string) => {
    try {
      const targetUsers = userId ? [userId] : selectedUsers;
      console.log(`🔧 ${action} action for user(s):`, targetUsers);

      for (const id of targetUsers) {
        const user = users.find(u => u.id === id);
        if (!user) continue;

        switch (action) {
          case 'edit':
            // For edit, we could open a modal - for now just log
            console.log(`✏️ Edit user: ${user.full_name || user.email}`);
            alert(`Edit functionality for ${user.full_name || user.email} - would open edit modal`);
            break;

          case 'suspend':
            // Update user status in profiles table
            const { error: suspendError } = await supabase
              .from('profiles')
              .update({ 
                role: user.role === 'admin' ? 'admin' : 'suspended',
                updated_at: new Date().toISOString()
              })
              .eq('id', id);

            if (suspendError) {
              console.error('Error suspending user:', suspendError);
              alert(`Failed to suspend user: ${suspendError.message}`);
            } else {
              console.log(`✅ User suspended: ${user.full_name || user.email}`);
              // Update local state
              setUsers(prev => prev.map(u => 
                u.id === id ? { ...u, role: u.role === 'admin' ? 'admin' : 'suspended' } : u
              ));
            }
            break;

          case 'activate':
            // Reactivate user 
            const { error: activateError } = await supabase
              .from('profiles')
              .update({ 
                role: 'user', // Reset to normal user
                updated_at: new Date().toISOString()
              })
              .eq('id', id);

            if (activateError) {
              console.error('Error activating user:', activateError);
              alert(`Failed to activate user: ${activateError.message}`);
            } else {
              console.log(`✅ User activated: ${user.full_name || user.email}`);
              // Update local state
              setUsers(prev => prev.map(u => 
                u.id === id ? { ...u, role: 'user' } : u
              ));
            }
            break;

          case 'delete':
            // Confirm before deletion
            const confirmDelete = window.confirm(
              `Are you sure you want to delete ${user.full_name || user.email}? This cannot be undone.`
            );
            
            if (confirmDelete) {
              // Note: In production, you'd want to soft delete or archive instead
              const { error: deleteError } = await supabase
                .from('profiles')
                .delete()
                .eq('id', id);

              if (deleteError) {
                console.error('Error deleting user:', deleteError);
                alert(`Failed to delete user: ${deleteError.message}`);
              } else {
                console.log(`✅ User deleted: ${user.full_name || user.email}`);
                // Remove from local state
                setUsers(prev => prev.filter(u => u.id !== id));
                setSelectedUsers(prev => prev.filter(uid => uid !== id));
              }
            }
            break;

          default:
            console.log(`Unknown action: ${action}`);
        }
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      alert(`Error performing ${action}: ${error}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'suspended': return 'text-red-400';
      case 'inactive': return 'text-gray-400';
      default: return 'text-white/60';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-400 bg-red-500/20';
      case 'moderator': return 'text-amber-400 bg-amber-500/20';
      case 'user': return 'text-blue-400 bg-blue-500/20';
      default: return 'text-white/60 bg-white/10';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-white/80">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="glass-enhanced backdrop-blur-lg bg-black/20 border border-white/20 rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2" 
                  style={{ fontFamily: 'Cinzel, serif' }}>
                👥 User Management
              </h1>
              <p className="text-xl text-white/90">
                Manage platform users • Total: {filteredUsers.length} users
              </p>
            </div>
            <Button
              onClick={() => setShowAddUser(true)}
              className="fantasy-cta px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300"
            >
              <Icon name="plus" size={20} className="mr-2" />
              Add User
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="glass-input w-full pl-12 pr-4 py-3 rounded-xl"
                />
                <Icon name="search" size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" />
              </div>
            </div>

            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="glass-input px-4 py-3 rounded-xl"
            >
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
              <option value="admin">Admins</option>
            </select>

            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="glass-input px-4 py-3 rounded-xl"
            >
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="joinDate-desc">Newest First</option>
              <option value="joinDate-asc">Oldest First</option>
              <option value="storiesCreated-desc">Most Stories</option>
              <option value="storiesCreated-asc">Least Stories</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="glass-enhanced backdrop-blur-lg bg-amber-500/20 border border-amber-400/30 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">
                {selectedUsers.length} user(s) selected
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleUserAction('suspend')}
                  variant="secondary"
                  size="small"
                >
                  Suspend
                </Button>
                <Button
                  onClick={() => handleUserAction('activate')}
                  variant="secondary"
                  size="small"
                >
                  Activate
                </Button>
                <Button
                  onClick={() => handleUserAction('delete')}
                  variant="danger"
                  size="small"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="glass-enhanced backdrop-blur-lg bg-black/20 border border-white/20 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-amber-500 bg-white/20 border-white/30 rounded focus:ring-amber-400"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-white/80 font-semibold">User</th>
                  <th className="px-6 py-4 text-left text-white/80 font-semibold">Role</th>
                  <th className="px-6 py-4 text-left text-white/80 font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-white/80 font-semibold">Stories</th>
                  <th className="px-6 py-4 text-left text-white/80 font-semibold">Join Date</th>
                  <th className="px-6 py-4 text-left text-white/80 font-semibold">Last Active</th>
                  <th className="px-6 py-4 text-left text-white/80 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleUserSelect(user.id)}
                        className="w-4 h-4 text-amber-500 bg-white/20 border-white/30 rounded focus:ring-amber-400"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-white/20 flex items-center justify-center text-white font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white font-medium">{user.name}</div>
                          <div className="text-white/60 text-sm">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${getStatusColor(user.status)}`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white">{user.storiesCreated}</td>
                    <td className="px-6 py-4 text-white/80 text-sm">{user.joinDate}</td>
                    <td className="px-6 py-4 text-white/80 text-sm">{user.lastActive}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUserAction('edit', user.id)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="Edit user"
                        >
                          <Icon name="edit" size={16} />
                        </button>
                        <button
                          onClick={() => handleUserAction('suspend', user.id)}
                          className="text-amber-400 hover:text-amber-300 transition-colors"
                          title="Suspend user"
                        >
                          <Icon name="pause" size={16} />
                        </button>
                        <button
                          onClick={() => handleUserAction('delete', user.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Delete user"
                        >
                          <Icon name="trash" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && !loading && (
          <div className="glass-enhanced backdrop-blur-lg bg-black/20 border border-white/20 rounded-2xl p-12 text-center">
            <Icon name="users" size={64} className="text-white/40 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">No Users Found</h3>
            <p className="text-white/70 mb-8">
              {searchTerm || filter !== 'all' 
                ? "No users match your current search criteria."
                : "No users have been added to the platform yet."
              }
            </p>
            {(!searchTerm && filter === 'all') && (
              <Button
                onClick={() => setShowAddUser(true)}
                className="fantasy-cta px-8 py-4 text-lg rounded-xl shadow-lg hover:scale-105 transition-all duration-300"
              >
                Add First User
              </Button>
            )}
          </div>
        )}

        {/* Add User Modal */}
        {showAddUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="glass-enhanced backdrop-blur-lg bg-black/40 border border-white/20 rounded-2xl p-8 w-full max-w-md mx-4">
              <h3 className="text-2xl font-bold text-white mb-6">Add New User</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 mb-2">Name</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    className="glass-input w-full px-4 py-3 rounded-xl"
                    placeholder="User's full name"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 mb-2">Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="glass-input w-full px-4 py-3 rounded-xl"
                    placeholder="user@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 mb-2">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="glass-input w-full px-4 py-3 rounded-xl"
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-4 mt-8">
                <Button
                  onClick={() => setShowAddUser(false)}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddUser}
                  className="flex-1 fantasy-cta"
                >
                  Add User
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;