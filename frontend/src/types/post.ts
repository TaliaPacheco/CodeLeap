import type { User } from './user';

export interface Post {
  id: number;
  author: User;
  title: string;
  content: string;
  media: string | null;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  created_at: string;
  updated_at: string;
}

export interface PostCreatePayload {
  title: string;
  content: string;
  media?: string;
}

export interface PostUpdatePayload {
  title?: string;
  content?: string;
  media?: string | null;
}
