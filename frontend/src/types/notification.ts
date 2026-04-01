import type { User } from './user';

export interface Notification {
  id: number;
  actor: User;
  notification_type: 'follow' | 'like' | 'comment' | 'story_reaction' | 'story_reply';
  post: number | null;
  is_read: boolean;
  created_at: string;
}
