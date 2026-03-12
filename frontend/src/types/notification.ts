import type { User } from './user';

export interface Notification {
  id: number;
  actor: User;
  notification_type: 'follow' | 'like' | 'comment';
  post: number | null;
  is_read: boolean;
  created_at: string;
}
