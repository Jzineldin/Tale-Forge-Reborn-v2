import React, { useState } from 'react';
import Text from '@/components/atoms/Text';
import Input from '@/components/atoms/Input';

const AccountHistoryPage: React.FC = () => {
  const [dateRange, setDateRange] = useState('last30');
  
  // Mock activity data
  const activities = [
    {
      id: '1',
      type: 'story-created',
      title: 'Created "The Magic Forest Adventure"',
      description: 'New story with 3 chapters and interactive elements',
      date: '2025-08-15T14:30:00Z',
      icon: '📝'
    },
    {
      id: '2',
      type: 'story-read',
      title: 'Read "Space Explorer"',
      description: 'Chapter 2: The Red Planet - Completed',
      date: '2025-08-14T19:15:00Z',
      icon: '📖'
    },
    {
      id: '3',
      type: 'story-edited',
      title: 'Edited "The Lost Treasure"',
      description: 'Updated chapter 1 with new character descriptions',
      date: '2025-08-12T10:45:00Z',
      icon: '✏️'
    },
    {
      id: '4',
      type: 'story-created',
      title: 'Created "The Mystery of the Missing Cookies"',
      description: 'New mystery story with 4 chapters',
      date: '2025-08-10T16:20:00Z',
      icon: '📝'
    },
    {
      id: '5',
      type: 'story-read',
      title: 'Read "The Dragon Who Lost His Fire"',
      description: 'Chapter 1: The Lonely Dragon - Completed',
      date: '2025-08-08T20:00:00Z',
      icon: '📖'
    },
    {
      id: '6',
      type: 'account-updated',
      title: 'Updated profile information',
      description: 'Changed email address and added child profile',
      date: '2025-08-05T09:30:00Z',
      icon: '👤'
    },
    {
      id: '7',
      type: 'subscription',
      title: 'Upgraded to Premium Plan',
      description: 'Unlimited stories and advanced features',
      date: '2025-08-01T11:15:00Z',
      icon: '💳'
    }
  ];

  const filteredActivities = activities.filter(activity => {
    const activityDate = new Date(activity.date);
    const now = new Date();
    
    switch (dateRange) {
      case 'last7':
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return activityDate >= oneWeekAgo;
      case 'last30':
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return activityDate >= oneMonthAgo;
      case 'last90':
        const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        return activityDate >= threeMonthsAgo;
      default:
        return true;
    }
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="py-6">
      <div className="mb-8">
        <Text variant="h1" weight="bold" className="text-3xl mb-2">
          Activity History
        </Text>
        <Text variant="p" color="secondary">
          View your reading and creation history
        </Text>
      </div>

      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <Text variant="h2" weight="semibold" className="text-xl mb-4 md:mb-0">
              Recent Activity
            </Text>
            
            <div className="flex flex-col sm:flex-row sm:space-x-4">
              <div className="mb-4 sm:mb-0">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Range
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="last7">Last 7 days</option>
                  <option value="last30">Last 30 days</option>
                  <option value="last90">Last 90 days</option>
                  <option value="all">All time</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <Input
                  placeholder="Search activities..."
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {filteredActivities.length > 0 ? (
            <div className="flow-root">
              <ul className="divide-y divide-gray-200">
                {filteredActivities.map((activity) => (
                  <li key={activity.id} className="py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-lg">{activity.icon}</span>
                      </div>
                      <div className="ml-4 flex-1">
                        <Text variant="p" weight="semibold">
                          {activity.title}
                        </Text>
                        <Text variant="p" size="sm" color="secondary">
                          {activity.description}
                        </Text>
                      </div>
                      <div className="ml-4">
                        <Text variant="p" size="sm" color="secondary">
                          {formatDate(activity.date)}
                        </Text>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center py-12">
              <Text variant="p" color="secondary">
                No activities found for the selected date range.
              </Text>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-xl">📖</span>
            </div>
            <div className="ml-4">
              <Text variant="p" color="secondary">
                Stories Read
              </Text>
              <Text variant="h2" weight="bold" className="text-2xl">
                24
              </Text>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-xl">📝</span>
            </div>
            <div className="ml-4">
              <Text variant="p" color="secondary">
                Stories Created
              </Text>
              <Text variant="h2" weight="bold" className="text-2xl">
                12
              </Text>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-xl">⏱️</span>
            </div>
            <div className="ml-4">
              <Text variant="p" color="secondary">
                Reading Time
              </Text>
              <Text variant="h2" weight="bold" className="text-2xl">
                24h 18m
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountHistoryPage;