'use client';

import { useState, useEffect } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, CheckCheck, Trash2, RefreshCw, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import StudentRoute from '@/components/StudentRoute';

function NotificationsContent() {
  const { notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState('all');
  const [displayedNotifications, setDisplayedNotifications] = useState([]);

  // Filter notifications based on active tab
  useEffect(() => {
    if (activeTab === 'unread') {
      setDisplayedNotifications(notifications.filter(notification => !notification.isRead));
    } else {
      setDisplayedNotifications(notifications);
    }
  }, [activeTab, notifications]);

  // Format notification time
  const formatTime = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
      return 'Unknown time';
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">View and manage your notifications</p>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Badge variant="outline" className="text-sm font-medium">
            {unreadCount} unread
          </Badge>
          
          <Button variant="outline" size="sm" onClick={() => fetchNotifications()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {unreadCount > 0 && (
            <Button variant="default" size="sm" onClick={markAllAsRead} disabled={loading}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all read
            </Button>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            All Notifications
          </TabsTrigger>
          <TabsTrigger value="unread" className="flex items-center gap-2">
            <Badge variant="secondary" className="ml-1">
              {unreadCount}
            </Badge>
            Unread
          </TabsTrigger>
        </TabsList>
        
        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === 'all' ? 'All Notifications' : 'Unread Notifications'}
            </CardTitle>
            <CardDescription>
              {activeTab === 'all' 
                ? 'View all your notifications' 
                : 'View your unread notifications'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : displayedNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground/20 mb-4" />
                <p className="text-muted-foreground">No notifications found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeTab === 'all' 
                    ? 'You don\'t have any notifications yet' 
                    : 'You don\'t have any unread notifications'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {displayedNotifications.map((notification) => (
                  <Card key={notification._id} className={`overflow-hidden ${!notification.isRead ? 'border-primary/50' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">{notification.title}</div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(notification.createdAt)}
                        </div>
                      </div>
                      <p className="text-sm mb-4">{notification.message}</p>
                      <div className="flex justify-between items-center">
                        {!notification.isRead ? (
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            New
                          </Badge>
                        ) : (
                          <span></span>
                        )}
                        <div className="flex gap-2">
                          {!notification.isRead && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => markAsRead(notification._id)}
                            >
                              <CheckCheck className="h-4 w-4 mr-1" />
                              Mark as read
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteNotification(notification._id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
          {displayedNotifications.length > 0 && (
            <CardFooter className="flex justify-between text-xs text-muted-foreground border-t pt-4">
              <p>Last updated: {new Date().toLocaleString()}</p>
              <p>{displayedNotifications.length} notifications</p>
            </CardFooter>
          )}
        </Card>
      </Tabs>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <StudentRoute>
      <NotificationsContent />
    </StudentRoute>
  );
}
