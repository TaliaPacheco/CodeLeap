import type { StoryGroup, Story, StoryCreatePayload, MyStory } from '../types/story';
import client from './client';

export async function fetchStories(): Promise<StoryGroup[]> {
  const { data } = await client.get<StoryGroup[]>('/stories/');
  return data;
}

export async function createStory(payload: StoryCreatePayload): Promise<Story> {
  const { data } = await client.post<Story>('/stories/', payload);
  return data;
}

export async function deleteStory(id: number): Promise<void> {
  await client.delete(`/stories/${id}/`);
}

export async function markStoryViewed(id: number): Promise<void> {
  await client.post(`/stories/${id}/view/`);
}

export async function reactToStory(id: number, emoji: string): Promise<void> {
  await client.post(`/stories/${id}/react/`, { emoji });
}

export async function removeStoryReaction(id: number): Promise<void> {
  await client.delete(`/stories/${id}/react/`);
}

export async function replyToStory(id: number, content: string): Promise<void> {
  await client.post(`/stories/${id}/reply/`, { content });
}

export async function fetchMyStories(): Promise<MyStory[]> {
  const { data } = await client.get<MyStory[]>('/stories/me/');
  return data;
}
