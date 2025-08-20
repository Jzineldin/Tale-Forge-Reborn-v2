import React, { useState } from 'react';
import { useAuth } from '@/providers/AuthContext';
import Text from '@/components/atoms/Text';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: Implement profile update API call
      console.log('Saving profile...', { fullName, username, bio });
      alert('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFullName(user?.full_name || '');
    setUsername(user?.username || '');
    setBio(user?.bio || '');
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="glass-enhanced p-6 rounded-2xl">
          <h1 className="fantasy-heading text-3xl font-bold mb-2">
            My Profile
          </h1>
          <p className="text-white/70">
            Manage your personal information and storytelling preferences
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <div className="glass-enhanced p-8 rounded-2xl">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start mb-8">
            <div className="relative mb-4 sm:mb-0">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <button className="absolute -bottom-2 -right-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full p-2 shadow-lg transition-colors">
                <Icon name="camera" size={16} />
              </button>
            </div>
            
            <div className="sm:ml-6 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-white mb-1">
                {user?.full_name || user?.email}
              </h2>
              <p className="text-amber-400 mb-2">
                @{user?.username || 'storyteller'}
              </p>
              <p className="text-white/70 text-sm">
                Member since {new Date(user?.created_at || Date.now()).toLocaleDateString()}
              </p>
            </div>

            <div className="sm:ml-auto mt-4 sm:mt-0">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="fantasy-cta px-6 py-2 text-sm rounded-lg flex items-center"
                >
                  <Icon name="edit" size={16} className="mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancel}
                    className="glass-card text-white border-2 border-white/30 hover:border-white/50 px-4 py-2 text-sm rounded-lg transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="fantasy-cta px-4 py-2 text-sm rounded-lg flex items-center disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Icon name="check" size={16} className="mr-2" />
                    )}
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={!isEditing}
                className="w-full glass-card border border-white/20 focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 rounded-lg px-4 py-3 text-white placeholder-white/50 bg-transparent transition-all duration-300 disabled:opacity-60"
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled={true}
                className="w-full glass-card border border-white/20 rounded-lg px-4 py-3 text-white/60 bg-transparent opacity-60 cursor-not-allowed"
                placeholder="Email cannot be changed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={!isEditing}
                className="w-full glass-card border border-white/20 focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 rounded-lg px-4 py-3 text-white placeholder-white/50 bg-transparent transition-all duration-300 disabled:opacity-60"
                placeholder="Choose a unique username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Account Type
              </label>
              <div className="glass-card border border-amber-400/30 rounded-lg px-4 py-3 flex items-center">
                <Icon name="star" size={20} className="text-amber-400 mr-2" />
                <span className="text-amber-300 font-medium">
                  {user?.role === 'admin' ? 'Administrator' : 'Storyteller'}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-white/80 mb-2">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={!isEditing}
              rows={4}
              className="w-full glass-card border border-white/20 focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 rounded-lg px-4 py-3 text-white placeholder-white/50 bg-transparent transition-all duration-300 disabled:opacity-60"
              placeholder="Tell us about your storytelling journey..."
            />
          </div>

          {/* Storytelling Preferences */}
          <div className="border-t border-white/20 pt-8">
            <h3 className="fantasy-heading text-xl font-bold mb-6">
              Storytelling Preferences
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="glass-card bg-white/5 border border-white/10 rounded-lg p-6 text-center">
                <div className="text-amber-400 mb-4">
                  <Icon name="book" size={32} />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Stories Created</h4>
                <p className="text-3xl font-bold text-amber-400">12</p>
                <p className="text-white/60 text-sm">This month</p>
              </div>
              
              <div className="glass-card bg-white/5 border border-white/10 rounded-lg p-6 text-center">
                <div className="text-amber-400 mb-4">
                  <Icon name="star" size={32} />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Favorite Genre</h4>
                <p className="text-xl font-bold text-amber-400">Fantasy</p>
                <p className="text-white/60 text-sm">Adventure close 2nd</p>
              </div>
              
              <div className="glass-card bg-white/5 border border-white/10 rounded-lg p-6 text-center">
                <div className="text-amber-400 mb-4">
                  <Icon name="user" size={32} />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Reading Level</h4>
                <p className="text-xl font-bold text-amber-400">All Ages</p>
                <p className="text-white/60 text-sm">Stories for everyone</p>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default ProfilePage;