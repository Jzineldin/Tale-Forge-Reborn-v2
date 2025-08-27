import React, { useState } from 'react';
import { useAuth } from '@/providers/AuthContext';
import Icon from '@/components/atoms/Icon';
import Button from '@/components/atoms/Button';

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
    <div className="page-container">
      {/* Header */}
      <section className="p-section">
        <div className="container-lg">
          <div className="glass-card text-center max-w-2xl mx-auto">
            <h1 className="title-hero mb-4">
              My Profile
            </h1>
            <p className="text-body">
              Manage your personal information and storytelling preferences
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="p-section">
        <div className="container-lg">
          <div className="glass-card max-w-4xl mx-auto">
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
              <h2 className="title-card mb-1">
                {user?.full_name || user?.email}
              </h2>
              <p className="text-amber-400 mb-2 text-body">
                @{user?.username || 'storyteller'}
              </p>
              <p className="text-body-sm">
                Member since {new Date(user?.created_at || Date.now()).toLocaleDateString()}
              </p>
            </div>

            <div className="sm:ml-auto mt-4 sm:mt-0">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="primary"
                  size="small"
                >
                  <Icon name="edit" size={16} className="mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    onClick={handleCancel}
                    variant="ghost"
                    size="small"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={loading}
                    variant="primary"
                    size="small"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Icon name="check" size={16} className="mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-body-sm font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={!isEditing}
                className="input-primary disabled:opacity-60"
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label className="block text-body-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled={true}
                className="input-primary opacity-60 cursor-not-allowed"
                placeholder="Email cannot be changed"
              />
            </div>

            <div>
              <label className="block text-body-sm font-medium mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={!isEditing}
                className="input-primary disabled:opacity-60"
                placeholder="Choose a unique username"
              />
            </div>

            <div>
              <label className="block text-body-sm font-medium mb-2">
                Account Type
              </label>
              <div className="glass-card border border-amber-400/30 px-4 py-3 flex items-center">
                <Icon name="star" size={20} className="text-amber-400 mr-2" />
                <span className="text-amber-300 font-medium text-body">
                  {user?.role === 'admin' ? 'Administrator' : 'Storyteller'}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-body-sm font-medium mb-2">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={!isEditing}
              rows={4}
              className="textarea-primary disabled:opacity-60"
              placeholder="Tell us about your storytelling journey..."
            />
          </div>

          {/* Storytelling Preferences */}
          <div className="border-t border-white/20 pt-8">
            <h3 className="title-section mb-6">
              Storytelling Preferences
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="glass-card text-center">
                <div className="text-amber-400 mb-4">
                  <Icon name="book" size={32} />
                </div>
                <h4 className="title-card mb-2">Stories Created</h4>
                <p className="stat-value-large">12</p>
                <p className="text-body-sm">This month</p>
              </div>
              
              <div className="glass-card text-center">
                <div className="text-amber-400 mb-4">
                  <Icon name="star" size={32} />
                </div>
                <h4 className="title-card mb-2">Favorite Genre</h4>
                <p className="stat-value text-amber-400">Fantasy</p>
                <p className="text-body-sm">Adventure close 2nd</p>
              </div>
              
              <div className="glass-card text-center">
                <div className="text-amber-400 mb-4">
                  <Icon name="user" size={32} />
                </div>
                <h4 className="title-card mb-2">Reading Level</h4>
                <p className="stat-value text-amber-400">All Ages</p>
                <p className="text-body-sm">Stories for everyone</p>
              </div>
            </div>
          </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;