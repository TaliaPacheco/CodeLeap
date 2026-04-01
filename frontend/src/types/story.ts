import type { User } from './user';

export interface Story {
  id: number;
  author: User;
  content_type: 'image' | 'text' | 'code';
  text: string;
  media: string | null;
  code: string;
  language: string;
  background_color: string;
  views_count: number;
  is_viewed: boolean;
  created_at: string;
}

export interface StoryGroup {
  author: User;
  has_unseen: boolean;
  stories: Story[];
}

export interface StoryCreatePayload {
  content_type: 'image' | 'text' | 'code';
  text?: string;
  media?: string;
  code?: string;
  language?: string;
  background_color?: string;
}

export interface MyStory extends Story {
  viewers: { username: string; profile_picture: string | null; viewed_at: string }[];
}
