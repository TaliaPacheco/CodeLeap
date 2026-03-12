import { useState, useEffect, useCallback } from 'react';
import type { Notification } from '../types/notification';
import * as api from '../api/notifications';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCount = useCallback(async () => {
    try {
      const count = await api.fetchUnreadCount();
      setUnreadCount(count);
    } catch { /* ignore */ }
  }, []);

  // Poll unread count every 30s
  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.fetchNotifications();
      setNotifications(data);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    await api.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, []);

  return { notifications, unreadCount, loading, loadNotifications, markAllAsRead };
}
