import React, { useState } from 'react';
import Text from '@/components/atoms/Text';
import Button from '@/components/atoms/Button';

const NotificationsPage: React.FC = () => {
  const [filter, setFilter] = useState('all');
  
  // Mock notifications data
  const notifications = [
    {
      id: '1',
      title: 'Story Published Successfully',
      description: '"The Magic Forest Adventure" has been published and is now available in your library.',
      date: '2025-08-15T14:30:00Z',
      type: 'success',
      read: false
    },
    {
      id: '2',
      title: 'New Interactive Element Available',
      description: 'We\'ve added new sound effects that you can use in your stories.',
      date: '2025-08-14T09:15:00Z',
      type: 'info',
      read: false
    },
    {
      id: '3',
      title: 'Subscription Renewal Reminder',
      description: 'Your Premium subscription will renew in 3 days. Manage your subscription in Account Settings.',
      date: '2025-08-12T10:45:00Z',
      type: 'warning',
      read: true
    },
    {
      id: '4',
      title: 'Story Saved as Draft',
      description: '"The Mystery of the Missing Cookies" has been saved as a draft.',
      date: '2025-08-10T16:20:00Z',
      type: 'info',
      read: true
    },
    {
      id: '5',
      title: 'Reading Streak: 7 Days!',
      description: 'Great job! You\'ve read a story every day for a week.',
      date: '2025-08-08T20:00:00Z',
      type: 'achievement',
      read: true
    }
  ];

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const markAsRead = (id: string) => {
    // In a real app, this would update the backend
    console.log(`Marking notification ${id} as read`);
  };

  const markAllAsRead = () => {
    // In a real app, this would update the backend
    console.log('Marking all notifications as read');
  };

  return (
    <div className="py-6">
      <div className="mb-8">
        <Text variant="h1" weight="bold" className="text-3xl mb-2">
          Notifications
        </Text>
        <Text variant="p" color="secondary">
          Stay updated with your story activities
        </Text>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex flex-wrap gap-2 mb-4 md:mb-0">
          <Button 
            variant={filter === 'all' ? 'primary' : 'secondary'} 
            size="small"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button 
            variant={filter === 'unread' ? 'primary' : 'secondary'} 
            size="small"
            onClick={() => setFilter('unread')}
          >
            Unread
          </Button>
          <Button 
            variant={filter === 'info' ? 'primary' : 'secondary'} 
            size="small"
            onClick={() => setFilter('info')}
          >
            Info
          </Button>
          <Button 
            variant={filter === 'success' ? 'primary' : 'secondary'} 
            size="small"
            onClick={() => setFilter('success')}
          >
            Success
          </Button>
          <Button 
            variant={filter === 'warning' ? 'primary' : 'secondary'} 
            size="small"
            onClick={() => setFilter('warning')}
          >
            Warnings
          </Button>
          <Button 
            variant={filter === 'achievement' ? 'primary' : 'secondary'} 
            size="small"
            onClick={() => setFilter('achievement')}
          >
            Achievements
          </Button>
        </div>
        
        <Button variant="secondary" size="small" onClick={markAllAsRead}>
          Mark All as Read
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        {filteredNotifications.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <li 
                key={notification.id} 
                className={`p-6 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {notification.type === 'success' && (
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-green-600">✓</span>
                      </div>
                    )}
                    {notification.type === 'info' && (
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600">ℹ️</span>
                      </div>
                    )}
                    {notification.type === 'warning' && (
                      <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                        <span className="text-yellow-600">⚠️</span>
                      </div>
                    )}
                    {notification.type === 'achievement' && (
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <span className="text-purple-600">🏆</span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <Text variant="h3" weight="semibold" className="mb-1">
                      {notification.title}
                    </Text>
                    <Text variant="p" color="secondary" className="mb-2">
                      {notification.description}
                    </Text>
                    <Text variant="p" size="sm" color="secondary">
                      {formatDate(notification.date)}
                    </Text>
                  </div>
                  {!notification.read && (
                    <button 
                      onClick={() => markAsRead(notification.id)}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <Text variant="p" size="lg" color="secondary">
              No notifications found.
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;