import type { Notification } from '../types/notification';
import client from './client';

export async function fetchNotifications(): Promise<Notification[]> {
  const { data } = await client.get<Notification[]>('/notifications/');
  return data;
}

export async function markAllRead(): Promise<void> {
  await client.patch('/notifications/read-all/');
}

export async function fetchUnreadCount(): Promise<number> {
  const { data } = await client.get<{ count: number }>('/notifications/unread-count/');
  return data.count;
}
