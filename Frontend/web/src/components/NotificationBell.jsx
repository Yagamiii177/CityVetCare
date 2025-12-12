import { useState, useEffect, useRef } from 'react';
import { BellIcon, XMarkIcon, MapPinIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import api from '../utils/api';

const NotificationBell = ({ onNotificationClick }) => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef(null);

  // Poll for new notifications every 5 seconds
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notifications');
        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.count || 0);
      } catch {
        // Failed to fetch notifications - will retry
      }
    };

    // Fetch immediately
    fetchNotifications();

    // Set up polling
    intervalRef.current = setInterval(fetchNotifications, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleNotificationClick = async (notification) => {
    // Navigate to monitoring page with this incident
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    
    // Remove this specific notification
    try {
      await fetch(`${API_BASE_URL}/notifications`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notification_id: notification.id
        })
      });
      
      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // Failed to mark notification as read
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${API_BASE_URL}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'mark_read'
        })
      });
      
      setNotifications([]);
      setUnreadCount(0);
      setShowDropdown(false);
    } catch {
      // Failed to mark notifications as read
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - (timestamp * 1000);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {unreadCount > 0 ? (
          <BellSolidIcon className="h-6 w-6 text-[#FA8630]" />
        ) : (
          <BellIcon className="h-6 w-6 text-gray-600" />
        )}
        
        {/* Notification Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-900">
                Notifications ({unreadCount})
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-[#FA8630] hover:text-[#e67e22] font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className="p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icon */}
                      <div className={`flex-shrink-0 p-2 rounded-full ${getPriorityColor(notification.priority)}`}>
                        <ExclamationTriangleIcon className="h-4 w-4" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        
                        {/* Location and Reporter */}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          {notification.location && (
                            <div className="flex items-center space-x-1">
                              <MapPinIcon className="h-3 w-3" />
                              <span>{notification.location}</span>
                            </div>
                          )}
                          <span>Reporter: {notification.reporter}</span>
                        </div>
                        
                        {/* Priority and Time */}
                        <div className="flex items-center justify-between mt-2">
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getPriorityColor(notification.priority)}`}>
                            {notification.priority?.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatTimeAgo(notification.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <BellIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No new notifications</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;