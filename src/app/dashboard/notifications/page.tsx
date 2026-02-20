'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Notification {
  id: string;
  type: 'interest_received' | 'interest_accepted' | 'interest_declined' | 'offering_live' | 'offering_funded' | 'message';
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications?limit=50');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data || []);
      }
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId?: string) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationId ? { notification_id: notificationId } : { mark_all: true }),
      });

      if (res.ok) {
        if (notificationId) {
          setNotifications(prev => 
            prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
          );
        } else {
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }
      }
    } catch (e) {
      console.error('Failed to mark as read:', e);
    }
  };

  const getIconForType = (type: Notification['type']) => {
    switch (type) {
      case 'interest_received':
        return '👋';
      case 'interest_accepted':
        return '✅';
      case 'interest_declined':
        return '❌';
      case 'offering_live':
        return '🚀';
      case 'offering_funded':
        return '🎉';
      default:
        return '📢';
    }
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {unreadCount > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({unreadCount} unread)
                </span>
              )}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border overflow-hidden">
              <button
                onClick={() => setFilter('all')}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium transition-colors",
                  filter === 'all' 
                    ? "bg-orange-500 text-white" 
                    : "bg-background hover:bg-muted"
                )}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium transition-colors",
                  filter === 'unread' 
                    ? "bg-orange-500 text-white" 
                    : "bg-background hover:bg-muted"
                )}
              >
                Unread
              </button>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAsRead()}
              >
                <Check className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">
              Loading notifications...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-12 text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-muted-foreground">
                {filter === 'unread' 
                  ? "No unread notifications" 
                  : "No notifications yet"}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="divide-y">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 hover:bg-muted/50 transition-colors",
                      !notification.read && "bg-orange-50/50 dark:bg-orange-950/20"
                    )}
                  >
                    <div className="flex gap-4">
                      <span className="text-2xl shrink-0">
                        {getIconForType(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className={cn(
                              "font-medium",
                              !notification.read && "text-foreground"
                            )}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatTime(notification.created_at)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            {notification.link && (
                              <Link href={notification.link}>
                                <Button variant="outline" size="sm">
                                  View
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
