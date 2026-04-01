import { useState, useEffect, useCallback } from 'react';
import type { StoryGroup, StoryCreatePayload } from '../types/story';
import * as storiesApi from '../api/stories';

export function useStories() {
  const [groups, setGroups] = useState<StoryGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await storiesApi.fetchStories();
      setGroups(data);
    } catch {
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const createStory = useCallback(async (payload: StoryCreatePayload) => {
    await storiesApi.createStory(payload);
    await fetchStories();
  }, [fetchStories]);

  const markViewed = useCallback(async (storyId: number) => {
    await storiesApi.markStoryViewed(storyId);
    setGroups(prev =>
      prev.map(group => ({
        ...group,
        stories: group.stories.map(s =>
          s.id === storyId ? { ...s, is_viewed: true } : s
        ),
        has_unseen: group.stories.some(s => s.id !== storyId && !s.is_viewed),
      }))
    );
  }, []);

  const react = useCallback(async (storyId: number, emoji: string) => {
    await storiesApi.reactToStory(storyId, emoji);
  }, []);

  const reply = useCallback(async (storyId: number, content: string) => {
    await storiesApi.replyToStory(storyId, content);
  }, []);

  const deleteStory = useCallback(async (storyId: number) => {
    await storiesApi.deleteStory(storyId);
    await fetchStories();
  }, [fetchStories]);

  return { groups, loading, createStory, markViewed, react, reply, deleteStory };
}
