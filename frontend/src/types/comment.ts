import type { User } from './user';

export interface Comment {
  id: number;
  user: User;
  content: string;
  created_at: string;
}
